import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  category: 'legal' | 'medical' | 'shelter' | 'psychological' | 'emergency' | 'general';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country: string;
  };
  severity: 'low' | 'medium' | 'high' | 'emergency';
  languages: string[];
  is24Hours: boolean;
  isVerified: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['legal', 'medical', 'shelter', 'psychological', 'emergency', 'general'], 
    required: true 
  },
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    address: { type: String },
  },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String, required: true, default: 'India' },
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'emergency'], 
    required: true 
  },
  languages: [{ type: String }],
  is24Hours: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ResourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
