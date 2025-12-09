import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
  name: String,
  email: { type: String, required: true },
  phone: String,
  company: String,
  subject: String,
  message: String,
  category: { type: String, enum: ['information', 'partnership', 'support'], required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  ticketId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Contact', contactSchema);
