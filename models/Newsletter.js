import { Schema, model } from 'mongoose';

const newsletterSchema = new Schema({
  email: { type: String, unique: true, required: true },
  subscribedAt: { type: Date, default: Date.now }
});

export default model('Newsletter', newsletterSchema);
