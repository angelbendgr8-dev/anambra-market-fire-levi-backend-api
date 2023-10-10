import { Document, model, Schema } from 'mongoose';

import { WebHook } from '@interfaces/users.interface';

const webHookSchema: Schema = new Schema(
  {
    activities: {
      type: Object,
    },
  },
  { timestamps: true },
);

const webHookModel = model<WebHook & Document>('WebHook', webHookSchema);

export default webHookModel;
