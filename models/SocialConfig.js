import { Schema, model } from 'mongoose';

const socialConfigSchema = new Schema({
  platform: { type: String, enum: ['facebook', 'linkedin'], required: true },
  pageId: String,
  accessToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default model('SocialConfig', socialConfigSchema);
