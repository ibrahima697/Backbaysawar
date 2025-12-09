import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: 'drxouwbms',
  api_key: '252612838614382',
  api_secret: 'oB4yl5QLAkvoWb-1rZ5p_uR92YA',
});

// Configuration du stockage Cloudinary pour multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'baysawaar', // Dossier principal dans Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Redimensionner si nécessaire
      { quality: 'auto' }, // Optimisation automatique de la qualité
    ],
  },
});

// Test de la configuration Cloudinary
console.log('Cloudinary config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'SET' : 'NOT SET',
  api_secret: cloudinary.config().api_secret ? 'SET' : 'NOT SET'
});

// Configuration multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'), false);
    }
  },
});

// Middleware pour uploader une seule image
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware pour uploader plusieurs images
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware pour uploader des champs spécifiques
export const uploadFields = (fields) => upload.fields(fields);

// Fonction utilitaire pour supprimer une image de Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

// Fonction utilitaire pour obtenir l'URL d'une image
export const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

export default cloudinary;
