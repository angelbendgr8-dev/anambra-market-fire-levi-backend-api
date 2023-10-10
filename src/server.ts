import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import TransactionRoute from './routes/transaction.route';
import StakeholderRoute from './routes/stakeholders.route';

validateEnv();

const app = new App([new IndexRoute(), new TransactionRoute(), new StakeholderRoute(), new UsersRoute(), new AuthRoute()]);

app.listen();
