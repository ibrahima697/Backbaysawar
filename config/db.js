import { connect } from 'mongoose';

export default async () => {
  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  }
};
