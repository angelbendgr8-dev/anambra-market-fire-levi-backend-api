import { DB_USERNAME, DB_PASSWORD } from '@config';
export const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.bwpku.mongodb.net/firelevies?retryWrites=true&w=majority
`;

export const dbConnection = {
  url,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
