import { model, Schema, Document } from 'mongoose';

const tokenSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      expires: 3600,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const tokenModel = model<any & Document>('Token', tokenSchema);

export default tokenModel;
