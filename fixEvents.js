// fixEvents.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecté à MongoDB');

  const result = await Event.updateMany(
    {},
    [
      {
        $set: {
          registrations: {
            $filter: {
              input: "$registrations",
              as: "reg",
              cond: { $ne: ["$$reg.user", null] } // garde seulement ceux avec user non null
            }
          }
        }
      }
    ]
  );

  console.log("Nettoyage terminé :", result);

  // Optionnel : supprime les inscriptions vides
  await Event.updateMany(
    { "registrations.user": null },
    { $pull: { registrations: { user: null } } }
  );

  console.log("Base nettoyée ! Plus aucune inscription corrompue.");
  process.exit();
};

fix();
