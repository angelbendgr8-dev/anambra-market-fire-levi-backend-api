import { model, Schema, Document } from 'mongoose';

const stakeSchema: Schema = new Schema(
  {
    name: {
      type: String,
    },
    percent: {
      type: Number,
    },
  },
  { timestamps: true },
);

const stakeModel = model<any & Document>('Stakes', stakeSchema);

export default stakeModel;
