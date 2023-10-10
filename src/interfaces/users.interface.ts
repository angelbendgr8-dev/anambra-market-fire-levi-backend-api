export interface User {
  _id: string;
  phoneNumber: string;
  name: string;
  market: string;
  location: string;
  shopNumber: string;
  bankName: string;
  accountNumber: string;
  tempMarket: string;
  accountName: string;
  payments: any[];
}

export enum Roles {
  ADMIN = 'ADMIN',

  GOVT = 'GOVERNMENT',

  UNION = 'UNION',
}
export interface WebHook {
  activities: object;
}
export interface Market {
  COLUMN1: string;
  Market: string;
  COLUMN3: number;
  Location: string;
}
