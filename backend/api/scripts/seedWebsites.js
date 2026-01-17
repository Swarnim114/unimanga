import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Website from '../models/website.model.js';

// Load environment variables
dotenv.config();

const websites = [
  { 
    name: 'MangaDex', 
    url: 'https://mangadex.org', 
    language: 'Multi', 
    color: '#FF6740',
    isActive: true 
  },
  { 
    name: 'MangaPlus', 
    url: 'https://mangaplus.shueisha.co.jp', 
    language: 'EN', 
    color: '#FF0000',
    isActive: true 
  },
  { 
    name: 'Webtoons', 
    url: 'https://www.webtoons.com', 
    language: 'EN', 
    color: '#00D564',
    isActive: true 
  },
  { 
    name: 'AsuraScans', 
    url: 'https://asuracomic.net', 
    language: 'EN', 
    color: '#8B5CF6',
    isActive: true 
  },
  { 
    name: 'MangaFire', 
    url: 'https://mangafire.to', 
    language: 'EN', 
    color: '#FF6B35',
    isActive: true 
  },
  { 
    name: 'MangaKakalot', 
    url: 'https://mangakakalot.com', 
    language: 'EN', 
    color: '#FFB800',
    isActive: true 
  }
];

const seedWebsites = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing websites (optional - remove this if you want to keep existing data)
    await Website.deleteMany({});
    console.log('Cleared existing websites');

    // Insert preconfigured websites
    const insertedWebsites = await Website.insertMany(websites);
    console.log(`✅ Successfully seeded ${insertedWebsites.length} websites:`);
    insertedWebsites.forEach(site => {
      console.log(`   - ${site.name} (${site.url})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding websites:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedWebsites();
