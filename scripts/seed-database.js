const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Resource Schema
const resourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: String,
    enum: ['legal', 'medical', 'shelter', 'psychological', 'emergency', 'general'],
    required: true
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    address: String,
  },
  location: {
    city: String,
    state: String,
    country: { type: String, required: true, default: 'India' },
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    required: true
  },
  languages: [String],
  is24Hours: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model('Resource', resourceSchema);

const initialResources = [
  {
    title: "National Women Helpline",
    description: "24/7 helpline for women in distress. Provides immediate assistance and connects to local support services.",
    category: "emergency",
    contactInfo: {
      phone: "181",
      website: "https://wcd.nic.in/schemes/women-helpline"
    },
    location: {
      country: "India"
    },
    severity: "emergency",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["helpline", "emergency", "women"]
  },
  {
    title: "Police Emergency",
    description: "Emergency police response for immediate danger situations.",
    category: "emergency",
    contactInfo: {
      phone: "100"
    },
    location: {
      country: "India"
    },
    severity: "emergency",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["police", "emergency", "immediate"]
  },
  {
    title: "Medical Emergency Services",
    description: "Emergency medical services for immediate health crises.",
    category: "medical",
    contactInfo: {
      phone: "108"
    },
    location: {
      country: "India"
    },
    severity: "emergency",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["medical", "emergency", "ambulance"]
  },
  {
    title: "Domestic Violence Helpline",
    description: "Specialized helpline for domestic violence cases with trained counselors.",
    category: "emergency",
    contactInfo: {
      phone: "1091"
    },
    location: {
      country: "India"
    },
    severity: "emergency",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["domestic violence", "helpline", "counseling"]
  },
  {
    title: "Legal Aid Services",
    description: "Free legal assistance for domestic violence cases, including filing FIRs and protection orders.",
    category: "legal",
    contactInfo: {
      phone: "1800-345-3590",
      website: "https://nalsa.gov.in/"
    },
    location: {
      country: "India"
    },
    severity: "high",
    languages: ["en", "hi"],
    is24Hours: false,
    tags: ["legal aid", "free", "court", "protection order"]
  },
  {
    title: "Mental Health Support",
    description: "Counseling and psychological support for survivors of domestic violence.",
    category: "psychological",
    contactInfo: {
      phone: "1800-599-0019"
    },
    location: {
      country: "India"
    },
    severity: "medium",
    languages: ["en", "hi"],
    is24Hours: false,
    tags: ["counseling", "mental health", "therapy", "support"]
  },
  {
    title: "Women's Shelter Network",
    description: "Safe housing and accommodation for women escaping domestic violence.",
    category: "shelter",
    contactInfo: {
      phone: "1800-121-0013"
    },
    location: {
      country: "India"
    },
    severity: "high",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["shelter", "safe housing", "emergency accommodation"]
  },
  {
    title: "Child Helpline",
    description: "Specialized support for children affected by domestic violence.",
    category: "emergency",
    contactInfo: {
      phone: "1098"
    },
    location: {
      country: "India"
    },
    severity: "high",
    languages: ["en", "hi"],
    is24Hours: true,
    tags: ["children", "helpline", "emergency"]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    console.log('Clearing existing resources...');
    await Resource.deleteMany({});

    console.log('Inserting initial resources...');
    await Resource.insertMany(initialResources);

    console.log(`✅ Successfully seeded ${initialResources.length} resources!`);
    
    // Verify the data
    const count = await Resource.countDocuments();
    console.log(`📊 Total resources in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
