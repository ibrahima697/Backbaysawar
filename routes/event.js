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
import { uploadProductImages, handleUploadError } from '../middlewares/cloudinaryUpload.js';

const router = express.Router();

router.route('/')
  .post(isAdmin, uploadProductImages, handleUploadError, createEvent)
  .get(getAllEvents);

router.route('/:id')
  .put(isAdmin, uploadProductImages, handleUploadError, updateEvent)
  .delete(isAdmin, deleteEvent);

router.route('/:slug')
  .get(getEventBySlug);

router.post('/:slug/register', protect, registerToEvent);

export default router;
