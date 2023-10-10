import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import StakeholderController from '@/controllers/stakeholder.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  ConfirmCodeDto,
  ForgotPasswordDto,
  StakeDto,
  StakeholderDto,
  StakeholderLoginDto,
  StakeholderProfileDto,
  StakeholderResetDto,
  UpdateStakeDto,
} from '@/dtos/stakeholder.dto';
import gilahMiddleware from '@/middlewares/gilah.middleware';
import stakeholderMiddleware from '@/middlewares/stakeholder.middleware';
import multer from 'multer';
import taskforceMiddleware from '@/middlewares/taskforce.middleware';

const upload = multer({ dest: 'uploads/' });
class StakeholderRoute implements Routes {
  public path = '/api/stakeholders';
  public router = Router();
  public stakeholderController = new StakeholderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create-stake`, gilahMiddleware, validationMiddleware(StakeDto, 'body'), this.stakeholderController.createStake);

    this.router.patch(
      `${this.path}/stake/:id`,
      gilahMiddleware,
      validationMiddleware(UpdateStakeDto, 'body'),
      this.stakeholderController.updateStake,
    );

    this.router.get(`${this.path}/stakes`, gilahMiddleware, this.stakeholderController.fetchAllStakes);

    this.router.post(`${this.path}`, gilahMiddleware, validationMiddleware(StakeholderDto, 'body'), this.stakeholderController.createStakeholder);

    this.router.patch(`${this.path}/update/:id`, gilahMiddleware, this.stakeholderController.toggleStakeholderStatus);

    this.router.get(`${this.path}`, gilahMiddleware, this.stakeholderController.fetchStakeholders);

    this.router.get(`${this.path}/notifications`, stakeholderMiddleware, this.stakeholderController.fetchStakeholderNotifications);

    this.router.get(`${this.path}/traders`, stakeholderMiddleware, this.stakeholderController.fetchTraders);

    this.router.get(`${this.path}/trader/:id`, taskforceMiddleware, this.stakeholderController.fetchTraderById);

    this.router.get(`${this.path}/traders/defaulters`, stakeholderMiddleware, this.stakeholderController.fetchDefaulters);

    this.router.post(`${this.path}/login`, validationMiddleware(StakeholderLoginDto, 'body'), this.stakeholderController.stakeholderLogin);

    this.router.post(`${this.path}/certificate`, stakeholderMiddleware, this.stakeholderController.generateCertificate);

    this.router.get(`${this.path}/certificate`, stakeholderMiddleware, this.stakeholderController.getUserWithoutCertificate);

    this.router.post(
      `${this.path}/reset-password`,
      stakeholderMiddleware,
      validationMiddleware(StakeholderResetDto, 'body'),
      this.stakeholderController.stakeholderResetPassword,
    );

    this.router.post(
      `${this.path}/confirm-change-password`,
      validationMiddleware(ConfirmCodeDto, 'body'),
      this.stakeholderController.confirmChangePassword,
    );

    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(ForgotPasswordDto, 'body'),
      this.stakeholderController.stakeholderForgotPassword,
    );

    this.router.patch(
      `${this.path}/`,
      stakeholderMiddleware,
      upload.fields([{ name: 'profile' }]),
      validationMiddleware(StakeholderProfileDto, 'body'),
      this.stakeholderController.updateStakeholderProfile,
    );
  }
}

export default StakeholderRoute;
