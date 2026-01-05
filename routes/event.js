// routes/eventRoutes.js
import express from 'express';
//import authMiddleware from '../middlewares/auth.js';
import { protect, isAdmin } from '../middlewares/auth.js';

import {
  createEvent,
  getAllEvents,
  getEventBySlug,
  registerToEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';

const router = express.Router();

router.route('/')
  .post(isAdmin, createEvent)
  .get(getAllEvents);

// Place /:id routes BEFORE /:slug to avoid conflict if IDs look like slugs (though ObjectId usually doesn't conflict easily with typical slugs, it's safer to handle specific patterns or routes. But here we mix :id and :slug. To be safe, we rely on MongoDB ObjectId format being distinct enough or use specific resource path, but standard REST often shares root. Given existing structure:
router.route('/:id')
  .put(isAdmin, updateEvent)
  .delete(isAdmin, deleteEvent);

router.route('/:slug')
  .get(getEventBySlug);

router.post('/:slug/register', protect, registerToEvent);

export default router;
