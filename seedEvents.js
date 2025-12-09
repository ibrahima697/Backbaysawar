import Event from './models/Event.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const createFirstEvent = async () => {
    try {   
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingEvent = await Event.findOne({ slug: 'fipa-2025' });
        if (existingEvent) {
            console.log('Event already exists');
            return;
        }

        const fipa = new Event({
        title: "FIPA 2025 - Foire Internationale des Produits Africains",
        slug: "fipa-2025",
        description: "La plus grande foire africaine de transformation des produits locaux.",
        shortDescription: "Foire Internationale des Produits Africains 2025",
        image: "https://res.cloudinary.com/drxouwbms/image/upload/v1738000000/fipa2025-banner.jpg",
        type: "fair",
        dateStart: new Date("2025-12-12T09:00:00.000Z"),   // ← VRAIE DATE
        dateEnd: new Date("2025-12-14T18:00:00.000Z"),     // ← VRAIE DATE
        location: "CICES - Dakar, Sénégal",
        priceMember: 25000,
        priceNonMember: 50000,
        maxParticipants: 500,
        isFeatured: true,
        sponsors: ["Fabira Trading", "APIX", "Orange Money"],
        createdBy: null // Set this to the user ID who creates the event
        });

        await fipa.save();
        console.log('Event created successfully');
    } catch (error) {
        console.error('Error creating event:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createFirstEvent();
