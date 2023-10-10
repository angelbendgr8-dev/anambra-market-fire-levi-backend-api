import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import TransactionController from '@/controllers/transaction.controller';
import stakeholderMiddleware from '@/middlewares/stakeholder.middleware';

class TransactionRoute implements Routes {
  public path = '/api';
  public router = Router();
  public transactionController = new TransactionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/transaction`, stakeholderMiddleware, this.transactionController.fetchTransactions);
    this.router.get(`${this.path}/transaction/dashboard`, stakeholderMiddleware, this.transactionController.fetchDashboardTransactions);
    this.router.get(`${this.path}/transaction/summary`, stakeholderMiddleware, this.transactionController.Summary);
    this.router.get(`${this.path}/markets`, stakeholderMiddleware, this.transactionController.fetchMarkets);
  }
}

export default TransactionRoute;
