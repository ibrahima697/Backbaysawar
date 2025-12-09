import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorBio: String,
  category: String,
  tags: [String],
  // Image principale Cloudinary
  featuredImage: {
    publicId: { type: String },
    url: { type: String },
    alt: { type: String }
  },
  // Images supplémentaires dans le contenu
  gallery: [{
    publicId: { type: String },
    url: { type: String },
    alt: { type: String },
    caption: { type: String }
  }],
  readTime: String,
  // Métadonnées SEO
  metaDescription: String,
  slug: { 
    type: String, 
    unique: true,
    default: function() {
      // Générer un slug basé sur le titre
      return this.title
        ? this.title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Supprimer les caractères spéciaux
            .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
            .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
            .trim('-') // Supprimer les tirets en début/fin
        : `blog-${Date.now()}`; // Fallback si pas de titre
    }
  },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('BlogPost', blogPostSchema);
