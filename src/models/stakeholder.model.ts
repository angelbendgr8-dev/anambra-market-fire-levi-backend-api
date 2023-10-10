import { model, Schema, Document } from 'mongoose';

const stakeholdersSchema: Schema = new Schema(
  {
    stake: {
      type: Schema.Types.ObjectId,
      ref: 'Stakes',
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
    },
    market: {
      type: String,
    },
    profile: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive'],
    },
  },
  { timestamps: true },
);

const stakeholdersModel = model<any & Document>('Stakeholders', stakeholdersSchema);

export default stakeholdersModel;
