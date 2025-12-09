import BlogPost from '../models/BlogPost.js';
import { formatUploadData } from '../middlewares/cloudinaryUpload.js';

export const getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    const blogs = await BlogPost.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await BlogPost.countDocuments(query);
    res.json({ blogs, total });
  } catch (err) {
    next(err);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    // Récupérer les données d'upload d'images
    const uploadData = formatUploadData(req);
    
    // Créer le blog avec les données d'images
    const blogData = {
      ...req.body,
      ...uploadData,
    };
    
    // Parser tags si c'est une chaîne
    if (blogData.tags && typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // Générer un slug unique si nécessaire
    if (blogData.title && !blogData.slug) {
      let baseSlug = blogData.title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Vérifier l'unicité du slug
      while (await BlogPost.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      blogData.slug = slug;
    }
    
    const blog = new BlogPost(blogData);
    await blog.save();
    res.status(201).json({ message: 'Article créé', blog });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    // Récupérer les données d'upload d'images
    const uploadData = formatUploadData(req);
    
    // Mettre à jour le blog avec les données d'images
    const updateData = {
      ...req.body,
      ...uploadData,
    };
    
    // Parser tags si c'est une chaîne
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // Générer un slug unique si le titre a changé
    if (updateData.title && !updateData.slug) {
      let baseSlug = updateData.title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Vérifier l'unicité du slug (en excluant l'article actuel)
      while (await BlogPost.findOne({ slug, _id: { $ne: req.params.id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
    }
    
    const blog = await BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!blog) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ message: 'Article mis à jour', blog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ message: 'Article supprimé' });
  } catch (err) {
    next(err);
  }
};
