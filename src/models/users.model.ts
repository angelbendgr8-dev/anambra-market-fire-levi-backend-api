import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    market: {
      type: String,
    },
    tempMarket: {
      type: String,
    },
    location: {
      type: String,
    },
    shopNumber: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountName: {
      type: String,
    },
    payments: {
      type: Array,
      default: [],
    },
    certificateGenerated: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const userModel = model<User & Document>('User', userSchema);

export default userModel;
