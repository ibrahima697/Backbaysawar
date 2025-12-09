import { uploadSingle, uploadMultiple, uploadFields } from '../config/cloudinary.js';
import multer from 'multer';

// Middleware pour uploader le logo de l'entreprise lors de l'enrôlement
export const uploadCompanyLogo = uploadSingle('companyLogo');

// Middleware pour uploader les documents d'entreprise lors de l'enrôlement
export const uploadBusinessDocuments = uploadMultiple('businessDocuments', 5);

// Middleware pour uploader les images de produits
export const uploadProductImages = uploadMultiple('images', 5);

// Middleware pour uploader l'image principale d'un blog
export const uploadBlogFeaturedImage = uploadSingle('featuredImage');

// Middleware pour uploader la galerie d'images d'un blog
export const uploadBlogGallery = uploadMultiple('gallery', 10);

// Middleware pour uploader plusieurs types d'images pour l'enrôlement
export const uploadEnrollmentImages = uploadFields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessDocuments', maxCount: 5 }
]);

// Middleware pour uploader les images de produits avec différents champs
export const uploadProductImagesWithFields = uploadFields([
  { name: 'images', maxCount: 5 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Middleware pour uploader les images de blog avec différents champs
export const uploadBlogImagesWithFields = uploadFields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

// Middleware de gestion d'erreur pour les uploads
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux',
        message: 'La taille du fichier ne doit pas dépasser 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Trop de fichiers',
        message: 'Le nombre de fichiers dépasse la limite autorisée'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Champ de fichier inattendu',
        message: 'Le champ de fichier n\'est pas autorisé'
      });
    }
  }
  
  if (error.message === 'Seules les images sont autorisées!') {
    return res.status(400).json({
      error: 'Type de fichier non autorisé',
      message: 'Seules les images (JPG, PNG, GIF, WebP) sont acceptées'
    });
  }
  
  next(error);
};

// Fonction utilitaire pour formater les données d'upload
export const formatUploadData = (req) => {
  const uploadData = {};
  
  console.log('formatUploadData - req.file:', req.file);
  console.log('formatUploadData - req.files:', req.files);
  
  // Traiter les fichiers uniques
  if (req.file) {
    console.log('Processing single file:', req.file);
    uploadData[req.file.fieldname] = {
      publicId: req.file.public_id,
      url: req.file.secure_url,
      alt: req.file.originalname
    };
  }
  
  // Traiter les fichiers multiples
  if (req.files) {
    console.log('Processing multiple files:', req.files);
    if (Array.isArray(req.files)) {
      // Un seul champ avec plusieurs fichiers
      const fieldName = req.files[0]?.fieldname;
      if (fieldName) {
        uploadData[fieldName] = req.files.map(file => ({
          publicId: file.public_id,
          url: file.secure_url,
          alt: file.originalname
        }));
      }
    } else {
      // Plusieurs champs avec fichiers
      Object.keys(req.files).forEach(fieldName => {
        const files = req.files[fieldName];
        console.log(`Processing field ${fieldName}:`, files);
        if (files.length === 1) {
          uploadData[fieldName] = {
            publicId: files[0].public_id,
            url: files[0].secure_url,
            alt: files[0].originalname
          };
        } else {
          uploadData[fieldName] = files.map(file => ({
            publicId: file.public_id,
            url: file.secure_url,
            alt: file.originalname
          }));
        }
      });
    }
  }
  
  return uploadData;
};
