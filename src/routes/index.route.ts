import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

class IndexRoute implements Routes {
  public path = '/api';
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/user`, this.indexController.index);
    this.router.post(`${this.path}/webhook`, this.indexController.webhookHandler);
  }
}

export default IndexRoute;
