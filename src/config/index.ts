import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_USERNAME,
  DB_PASSWORD,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  PAYSTACK_API_KEY,
  FRONTEND_URL,
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
} = process.env;
