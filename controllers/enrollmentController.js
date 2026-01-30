import Enrollment from '../models/Enrollment.js';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { formatUploadData } from '../middlewares/cloudinaryUpload.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import { getRegistrationReceivedEmail, getAdminNotificationEmail, getApprovalEmail } from '../utils/emailTemplates.js';

dotenv.config();

export const submitEnrollment = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            country,
            city,
            companyName = '',
            interests = [],               // <-- tableau par défaut
        } = req.body;

        // ==== 1. Validation des champs obligatoires ====
        if (!firstName || !lastName || !email || !phone || !country || !city) {
            return res.status(400).json({
                error: 'Les champs obligatoires doivent être remplis : Prénom, Nom, Email, Téléphone, Pays, Ville',
            });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Format d\'email invalide' });
        }

        // ==== 2. Traitement des images (optionnelles) ====
        const uploadData = formatUploadData(req); // { companyLogo: url, businessDocuments: [url,…] }

        // ==== 3. Vérifier si l'email existe déjà (User ou Enrollment en attente) ====
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Un compte existe déjà avec cet email' });
        }
        const existingEnrollment = await Enrollment.findOne({ email, status: 'pending' });
        if (existingEnrollment) {
            return res.status(400).json({ error: 'Une demande est déjà en cours avec cet email' });
        }

        // ==== 4. Normaliser les intérêts ====
        let parsedInterests = [];

        if (Array.isArray(interests)) {
            parsedInterests = interests;
        } else if (typeof interests === 'string') {
            try {
                parsedInterests = JSON.parse(interests);
            } catch (e) {
                return res.status(400).json({ error: 'Champ interests invalide' });
            }
        }

        // ==== 5. Créer l'enrôlement (SANS créer d'utilisateur) ====
        const enrollmentData = {
            firstName,
            lastName,
            email,
            phone,
            country,
            city,
            companyName: companyName || null,
            interests: parsedInterests,
            // userId: null, // Pas d'utilisateur pour l'instant
            status: 'pending',
            companyLogo: uploadData.companyLogo || null,
            businessDocuments: uploadData.businessDocuments || [],
        };

        const enrollment = new Enrollment(enrollmentData);
        await enrollment.save();

        // ==== 6. Envoi des emails ====
        // ---- Email à l'utilisateur (Notification de réception) ----
        sendEmail(email, 'Confirmation de réception de votre demande - BAY SA WAAR',
            getRegistrationReceivedEmail(firstName, 'votre demande d\'adhésion'))
            .catch(err => console.error('Erreur email utilisateur submitEnrollment:', err));

        // ---- Email à l'admin ----
        const adminContent = `Nouvelle demande d'inscription:\nNom: ${firstName} ${lastName}\nEmail: ${email}\nTéléphone: ${phone}\nLocalisation: ${city}, ${country}\nEntreprise: ${companyName || 'Non renseignée'}`;
        sendEmail(process.env.EMAIL_USER || 'iguisse97@gmail.com', 'Nouvelle demande d\'inscription (En attente) - BAY SA WAAR',
            getAdminNotificationEmail('Nouvelle demande d\'adhésion', adminContent))
            .catch(err => console.error('Erreur email admin submitEnrollment:', err));

        // ==== 7. Réponse ====
        res.status(201).json({
            message: 'Votre demande a été soumise avec succès. Vous recevrez un email de confirmation.',
            enrollmentId: enrollment._id,
        });
    } catch (err) {
        console.error('Erreur submitEnrollment:', err);
        next(err);
    }
};

/* ------------------------------------------------------------------ */
/* Les autres fonctions restent inchangées (getAll, getById, …)       */
/* ------------------------------------------------------------------ */
export const getAllEnrollments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};
        const enrollments = await Enrollment.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .populate('userId', 'firstName lastName email');
        const total = await Enrollment.countDocuments(query);
        res.json({ enrollments, total });
    } catch (err) {
        next(err);
    }
};

export const getEnrollmentById = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate('userId');
        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.json(enrollment);
    } catch (err) {
        next(err);
    }
};

export const updateEnrollment = async (req, res, next) => {
    try {
        const { status } = req.body;
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });

        if (status === 'approved') {
            const user = await User.findById(enrollment.userId);

            if (user && user.email) {
                sendEmail(user.email, 'Votre inscription est approuvée !',
                    getApprovalEmail(user.firstName))
                    .catch(err => console.error('Erreur email approbation:', err));
            }
        }

        res.json({ message: 'Statut mis à jour', enrollment });
    } catch (err) {
        next(err);
    }
};


export const deleteEnrollment = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.json({ message: 'Inscription supprimée' });
    } catch (err) {
        next(err);
    }
};

export const getEnrollmentStatus = async (req, res, next) => {
    try {
        // Maintenant req.user est l'objet User complet → on utilise _id
        if (!req.user?._id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const enrollments = await Enrollment.find({ userId: req.user._id });
        res.json(enrollments);
    } catch (err) {
        next(err);
    }
};
