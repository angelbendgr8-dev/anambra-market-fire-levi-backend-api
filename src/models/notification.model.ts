import { model, Schema, Document } from 'mongoose';

const notificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: Number,
    },
    market: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const notificationModel = model<any & Document>('Notification', notificationSchema);

export default notificationModel;
