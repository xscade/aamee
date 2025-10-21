import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminConfig extends Document {
  configType: 'rules' | 'tones' | 'training';
  name: string;
  description?: string;
  content: any;
  isActive: boolean;
  priority?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminConfigSchema: Schema = new Schema({
  configType: { 
    type: String, 
    enum: ['rules', 'tones', 'training'], 
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String },
  content: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
AdminConfigSchema.index({ configType: 1, isActive: 1 });
AdminConfigSchema.index({ priority: -1 });

export default mongoose.models.AdminConfig || mongoose.model<IAdminConfig>('AdminConfig', AdminConfigSchema);
