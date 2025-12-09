import Enrollment from '../models/Enrollment.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';

export async function getDashboardData(req, res, next) {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request' });
    }
    
    // Find enrollments for this user
    const enrollments = await Enrollment.find({ userId: userId });
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Get recent orders (placeholder for future implementation)
    const orders = await Product.find({}).limit(5);
    
    // Get recent contacts for this user
    const contacts = await Contact.find({ email: user.email }).limit(5);
    
    // Calculate stats
    const stats = {
      totalEnrollments: enrollments.length,
      pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
      approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
      recentOrders: orders,
      recentContacts: contacts
    };
    
    const response = { 
      enrollments, 
      stats,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    };
    
    res.json(response);
    
  } catch (err) {
    console.error('Dashboard error:', err);
    next(err);
  }
}


