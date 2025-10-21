import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingData extends Document {
  title: string;
  category: 'legal' | 'medical' | 'shelter' | 'psychological' | 'emergency' | 'general';
  userMessage: string;
  expectedResponse: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  keywords: string[];
  context: string;
  language: 'en' | 'hi';
  isApproved: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingDataSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['legal', 'medical', 'shelter', 'psychological', 'emergency', 'general'], 
    required: true 
  },
  userMessage: { type: String, required: true },
  expectedResponse: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'emergency'], 
    required: true 
  },
  keywords: [{ type: String }],
  context: { type: String },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  isApproved: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
TrainingDataSchema.index({ category: 1, isApproved: 1 });
TrainingDataSchema.index({ severity: 1, isApproved: 1 });
TrainingDataSchema.index({ language: 1, isApproved: 1 });
TrainingDataSchema.index({ keywords: 1 });

export default mongoose.models.TrainingData || mongoose.model<ITrainingData>('TrainingData', TrainingDataSchema);
