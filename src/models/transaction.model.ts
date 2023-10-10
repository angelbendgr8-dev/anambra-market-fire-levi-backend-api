import { model, Schema, Document } from 'mongoose';

const transactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    market: {
      type: String,
      default: '',
    },
    location: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true },
);

const transactionModel = model<any & Document>('Transaction', transactionSchema);

export default transactionModel;
