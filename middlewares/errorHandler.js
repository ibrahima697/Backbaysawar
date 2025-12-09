import logger from '../utils/logger.js';

export default (err, req, res, next) => {
  logger.error(err.stack);
  
  // Gestion des erreurs d'authentification
  if (err.message === 'Identifiants invalides') {
    return res.status(401).json({
      error: 'Email ou mot de passe incorrect',
      message: 'Identifiants invalides'
    });
  }
  
  // Gestion des erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      message: err.message
    });
  }
  
  // Gestion des erreurs de duplication (email déjà utilisé)
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Email déjà utilisé',
      message: 'Cet email est déjà associé à un compte'
    });
  }
  
  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Votre session a expiré, veuillez vous reconnecter'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Votre session a expiré, veuillez vous reconnecter'
    });
  }
  
  // Erreur par défaut
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur serveur' 
    : err.message;
    
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
