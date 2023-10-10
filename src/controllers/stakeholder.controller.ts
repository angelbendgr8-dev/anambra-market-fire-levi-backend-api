import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_SECRET_ACCESS_KEY, FRONTEND_URL, SECRET_KEY } from '@/config';
import { ConfirmCodeDto, ForgotPasswordDto, StakeholderResetDto } from '@/dtos/stakeholder.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, RequestWithUser, TokenData } from '@/interfaces/auth.interface';
import stakeModel from '@/models/stake.model';
import stakeholdersModel from '@/models/stakeholder.model';
import { compare, hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import AWS from 'aws-sdk';
import fs from 'fs';
import SesMailService from '@/services/ses.service';
import tokenModel from '@/models/token.model';
import notificationModel from '@/models/notification.model';
import userModel from '@/models/users.model';
import { defaultersPagination, functionPaginate } from '@/utils/pagination';
const QRCode = require('qrcode');
const pdf = require('pdf-creator-node');

class StakeholderController {
  public sesMailService = new SesMailService();
  html = fs.readFileSync('certficate.html', 'utf8');
  s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
  public createStake = async (req: Request, res: Response, next: NextFunction) => {
    const stakeData = req.body;

    try {
      const stake = await stakeModel.create(stakeData);

      res.status(200).json({ data: stake, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public updateStake = async (req: Request, res: Response, next: NextFunction) => {
    const stake = req.body;

    try {
      const findStake = await stakeModel.findOne({ _id: req.params.id });

      if (!findStake) throw new HttpException(404, 'stake not found');

      const updateStake = await stakeModel.findByIdAndUpdate(req.params.id, { ...stake });

      res.status(200).json({ data: updateStake, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public fetchAllStakes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stakes = await stakeModel.find();

      res.status(200).json({ data: stakes, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public createStakeholder = async (req: Request, res: Response, next: NextFunction) => {
    const stakeholderData = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ email: stakeholderData.email.toLowerCase() });

      if (findStakeholder) {
        throw new HttpException(409, 'stakeholder already exists');
      }
      //find stake by id
      const findStake = await stakeModel.findOne({ name: stakeholderData.stake });

      if (!findStake) {
        throw new HttpException(404, 'stake not found');
      }

      const hashedPassword = await hash(stakeholderData.password, 10);
      const stakeholder = await stakeholdersModel.create({ ...stakeholderData, password: hashedPassword, stake: findStake._id });

      res.status(200).json({ data: stakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public toggleStakeholderStatus = async (req: any, res: Response, next: NextFunction) => {
    try {
      const findStakeholder = await stakeholdersModel.findOne({ _id: req.params.id });

      if (!findStakeholder) {
        throw new HttpException(404, 'stakeholder not found');
      }

      if (req.user._id.toString() === req.params.id.toString()) {
        throw new HttpException(409, 'You cannot deactivate your own account');
      }

      const stakeholder = await stakeholdersModel.findByIdAndUpdate(
        req.params.id,
        { status: findStakeholder.status === 'active' ? 'inactive' : 'active' },
        { new: true },
      );

      res.status(200).json({ data: stakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public fetchStakeholders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findStakeholder = await stakeholdersModel.find({}).populate('stake');

      res.status(200).json({ data: findStakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public fetchStakeholderNotifications = async (req: any, res: Response, next: NextFunction) => {
    const userStake = req.user.stake;
    try {
      // const notifications = await notificationModel.find({ stakeholder: req.params.id });
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
        const notifications = await notificationModel.find({});
        res.status(200).json({ data: notifications, message: 'processed successfully', status: 'success' });
      } else {
        const notifications = await notificationModel.find({ market: req.user.market });
        res.status(200).json({ data: notifications, message: 'processed successfully', status: 'success' });
      }
    } catch (error) {
      next(error);
    }
  };

  public fetchTraders = async (req: any, res: Response, next: NextFunction) => {
    const userStake = req.user.stake;
    const { search, page, limit } = req.query;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
      } else {
        const users = await userModel.find({
          market: req.user.market,
          ...(search && {
            $or: [
              { phoneNumber: { $regex: search, $options: 'i' } },
              { name: { $regex: search, $options: 'i' } },
              { shopNumber: { $regex: search, $options: 'i' } },
            ],
          }),
        });
        const { data, totalContent, totalPages, limitPerPage } = await functionPaginate(Number(page), Number(limit), users, userModel, {
          market: req.user.market,
        });
        res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
      }
    } catch (error) {
      next(error);
    }
  };

  public fetchDefaulters = async (req: any, res: Response, next: NextFunction) => {
    const userStake = req.user.stake;
    const { search, page, limit } = req.query;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
      } else {
        // find all users, add all amount in user.payments array. if total amount is less than months * 5000, push to defaulters array and show how much is remaining
        const users = await userModel.aggregate([
          {
            $match: {
              market: req.user.market,
              ...(search && {
                $or: [
                  { phoneNumber: { $regex: search, $options: 'i' } },
                  { name: { $regex: search, $options: 'i' } },
                  { shopNumber: { $regex: search, $options: 'i' } },
                ],
              }),
            },
          },
          {
            $addFields: {
              totalAmount: {
                $reduce: {
                  input: '$payments',
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.amount'] },
                },
              },
              months: {
                //months from when user joined to now
                $floor: {
                  $divide: [
                    {
                      $subtract: [
                        new Date(),
                        {
                          $dateFromParts: {
                            year: { $year: '$createdAt' },
                            month: {
                              $add: [{ $month: '$createdAt' }, 1],
                            },
                            day: 1,
                          },
                        },
                      ],
                    },
                    1000 * 60 * 60 * 24 * 31,
                  ],
                },
              },
              outstanding: {
                $subtract: [
                  {
                    $multiply: [
                      {
                        $floor: {
                          $divide: [
                            {
                              $subtract: [
                                new Date(),
                                {
                                  $dateFromParts: {
                                    year: { $year: '$createdAt' },
                                    month: {
                                      $add: [{ $month: '$createdAt' }, 1],
                                    },
                                    day: 1,
                                  },
                                },
                              ],
                            },
                            1000 * 60 * 60 * 24 * 31,
                          ],
                        },
                      },
                      5000,
                    ],
                  },
                  {
                    $reduce: {
                      input: '$payments',
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.amount'] },
                    },
                  },
                ],
              },
              // months owned as ['2021-01-02', '2021-02-02', '2021-03-02']
              monthsOwned: {
                $map: {
                  input: {
                    $range: [
                      0,
                      {
                        $floor: {
                          $divide: [
                            {
                              $subtract: [
                                new Date(),
                                {
                                  $dateFromParts: {
                                    year: { $year: '$createdAt' },
                                    month: {
                                      $add: [{ $month: '$createdAt' }, 1],
                                    },
                                    day: 1,
                                  },
                                },
                              ],
                            },
                            1000 * 60 * 60 * 24 * 31,
                          ],
                        },
                      },
                    ],
                  },
                  as: 'month',
                  in: {
                    $dateToString: {
                      date: {
                        $add: [
                          {
                            $dateFromParts: {
                              year: { $year: '$createdAt' },
                              month: {
                                $add: [{ $month: '$createdAt' }, 1],
                              },
                              day: 1,
                            },
                          },
                          ,
                          { $multiply: ['$$month', 1000 * 60 * 60 * 24 * 31] },
                        ],
                      },
                      format: '%Y-%m-%d',
                    },
                  },
                },
              },
            },
          },
          {
            $match: {
              outstanding: { $gt: 0 },
            },
          },
        ]);

        // /
        const { data, totalContent, totalPages, limitPerPage } = await defaultersPagination(
          Number(page),
          Number(limit),
          users,
          userModel,
          req.user.market,
        );
        res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
      }
    } catch (error) {
      next(error);
    }
  };

  public fetchTraderById = async (req: any, res: Response, next: NextFunction) => {
    const userStake = req.user.stake;
    const userId = req.params.id;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      const data = await userModel.aggregate([
        {
          $match: {
            // market: req.user.market,
            accountNumber: userId,
          },
        },
        {
          $addFields: {
            totalAmount: {
              $reduce: {
                input: '$payments',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] },
              },
            },
            months: {
              //months from when user joined to now
              $floor: {
                $divide: [
                  {
                    $subtract: [
                      new Date(),
                      {
                        $dateFromParts: {
                          year: { $year: '$createdAt' },
                          month: {
                            $add: [{ $month: '$createdAt' }, 1],
                          },
                          day: 1,
                        },
                      },
                    ],
                  },
                  1000 * 60 * 60 * 24 * 31,
                ],
              },
            },
            outstanding: {
              $subtract: [
                {
                  $multiply: [
                    {
                      $floor: {
                        $divide: [
                          {
                            $subtract: [
                              new Date(),
                              {
                                $dateFromParts: {
                                  year: { $year: '$createdAt' },
                                  month: {
                                    $add: [{ $month: '$createdAt' }, 1],
                                  },
                                  day: 1,
                                },
                              },
                            ],
                          },
                          1000 * 60 * 60 * 24 * 31,
                        ],
                      },
                    },
                    5000,
                  ],
                },
                {
                  $reduce: {
                    input: '$payments',
                    initialValue: 0,
                    in: { $add: ['$$value', '$$this.amount'] },
                  },
                },
              ],
            },
            // months owned as ['2021-01-02', '2021-02-02', '2021-03-02']
            monthsOwned: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $floor: {
                        $divide: [
                          {
                            $subtract: [
                              new Date(),
                              {
                                $dateFromParts: {
                                  year: { $year: '$createdAt' },
                                  month: {
                                    $add: [{ $month: '$createdAt' }, 1],
                                  },
                                  day: 1,
                                },
                              },
                            ],
                          },
                          1000 * 60 * 60 * 24 * 31,
                        ],
                      },
                    },
                  ],
                },
                as: 'month',
                in: {
                  $dateToString: {
                    date: {
                      $add: [
                        {
                          $dateFromParts: {
                            year: { $year: '$createdAt' },
                            month: {
                              $add: [{ $month: '$createdAt' }, 1],
                            },
                            day: 1,
                          },
                        },
                        { $multiply: ['$$month', 1000 * 60 * 60 * 24 * 31] },
                      ],
                    },
                    format: '%Y-%m-%d',
                  },
                },
              },
            },
          },
        },
      ]);

      if (!data) {
        throw new HttpException(404, 'Not found');
      }

      res.status(200).json({
        data: {
          ...data[0],
        },
        message: 'processed successfully',
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public stakeholderLogin = async (req: Request, res: Response, next: NextFunction) => {
    const stakeholderData = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ email: stakeholderData.email.toLowerCase() }).populate('stake');

      if (!findStakeholder) {
        throw new HttpException(404, 'Not found');
      }

      const isPasswordMatching = await compare(stakeholderData.password, findStakeholder.password);

      if (!isPasswordMatching) {
        throw new HttpException(409, 'invalid credentials');
      }

      const tokenData = this.createToken(findStakeholder);

      res.status(200).json({ data: findStakeholder, token: tokenData.token, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public stakeholderResetPassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const stakeholderData: StakeholderResetDto = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ _id: req.user._id });

      if (!findStakeholder) {
        throw new HttpException(404, 'Account Not found');
      }

      const isPasswordMatching = await compare(stakeholderData.currentPassword, findStakeholder.password);

      if (!isPasswordMatching) {
        throw new HttpException(409, 'invalid credentials');
      }

      const hashedPassword = await hash(stakeholderData.newPassword, 10);

      const updateStakeholder = await stakeholdersModel.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true });

      res.status(200).json({ data: updateStakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public stakeholderForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const stakeholderData: ForgotPasswordDto = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ email: stakeholderData.email.toLowerCase() });

      if (!findStakeholder) {
        throw new HttpException(404, 'Account Not found');
      }
      const otp_code = Math.random().toString().substr(2, 6);
      const otp_hash = await hash(otp_code, 10);
      const token = await tokenModel.create({ hash: otp_hash, userId: findStakeholder._id, code: otp_code });

      const link = `  ${FRONTEND_URL}/reset?code=${otp_code}&email=${stakeholderData.email}`;

      const resp = await this.sesMailService.sendTemplatedEmail('circo_replace_password', {
        email: stakeholderData.email,
        username: findStakeholder?.firstName,
        link,
      });
      console.log(resp);
      res.status(200).json({ status: 'success', otp_hash, message: 'Otp Sent Successfully' });
    } catch (error) {
      next(error);
    }
  };

  public confirmChangePassword = async (req: Request, res: Response, next: NextFunction) => {
    const stakeholderData: ConfirmCodeDto = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ email: stakeholderData.email });

      if (!findStakeholder) {
        throw new HttpException(404, 'Account Not found');
      }

      const findToken = await tokenModel.findOne({ code: stakeholderData.code });

      if (!findToken) {
        throw new HttpException(404, 'Token Not found');
      }

      if (findToken.userId.toString() !== findStakeholder._id.toString()) {
        throw new HttpException(409, 'Invalid Token');
      }

      const hashedPassword = await hash(stakeholderData.newPassword, 10);

      const updatedStakeholder = await stakeholdersModel.findByIdAndUpdate(findStakeholder._id, { password: hashedPassword }, { new: true });

      //delete all token of the user
      await tokenModel.deleteMany({ userId: findStakeholder._id });

      res.status(200).json({ data: updatedStakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public updateStakeholderProfile = async (req: any, res: Response, next: NextFunction) => {
    const stakeholderData = req.body;

    try {
      const findStakeholder = await stakeholdersModel.findOne({ _id: req.user._id });

      if (!findStakeholder) {
        throw new HttpException(404, 'Account Not found');
      }
      const { profile } = req.files;
      let fileUrl = '';
      if (profile) {
        console.log(profile[0].mimetype);
        if (profile[0].mimetype !== 'image/jpeg' && profile[0].mimetype !== 'image/png') {
          throw new HttpException(400, 'Invalid file type');
        }

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Key: `usersProfile/${profile[0].originalname}`,
          Body: fs.readFileSync(profile[0].path),
        };
        const s3Response = await this.s3.upload(params).promise();
        fileUrl = s3Response.Location;
      }

      const updateStakeholder = await stakeholdersModel.findByIdAndUpdate(
        req.user._id,
        {
          ...stakeholderData,
          profile: fileUrl,
        },
        { new: true },
      );

      res.status(200).json({ data: updateStakeholder, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };
  public createToken(user: { _id: string }): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public getUserWithoutCertificate = async (req: any, res: Response, next: NextFunction) => {
    console.log(req.user.market);
    try {
      const users = await userModel.find({
        market: req.user.market,
        $or: [{ certificateGenerated: false }, { certificateGenerated: { $exists: false } }],
      });

      res.status(200).json({ data: users, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public generateCertificate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const users = req.body.users;
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    };

    const document = {
      html: this.html,
      path: `./certtificate.pdf`,
      type: '',
    };

    try {
      const foundUsers = await userModel.find({
        _id: {
          $in: users,
        },
      });

      const QRCode = require('qrcode');

      // ...

      const promises = foundUsers.map(async user => {
        const profileUrl = `${FRONTEND_URL}/taskforce/?id=${user.accountNumber}`;
        const qrCodeDataUrl: any = await new Promise((resolve, reject) => {
          QRCode.toDataURL(profileUrl, (err, url) => {
            if (err) reject(err);
            else resolve(url);
          });
        });

        const params = [
          {
            Bucket: AWS_BUCKET_NAME,
            Key: `qrcodes/${user?.name}.png`,
            Body: Buffer.from(qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
            ContentType: 'image/png',
          },
        ];

        const s3Response = await Promise.all(params.map(param => this.s3.upload(param).promise()));

        const res = await pdf.create(
          {
            ...document,
            data: {
              name: user.name.toUpperCase(),
              shop: user.shopNumber,
              bank: user.bankName,
              account: user.accountNumber,
              _id: user._id,
              market: user.market,
              phone: `${user.phoneNumber.slice(0, 4)} ***** ${user.phoneNumber.slice(9, 14)}`,
              qrCode: s3Response[0].Location,
            },
            path: `./${user.name}.pdf`,
          },
          options,
        );

        const pdfParams = {
          Bucket: AWS_BUCKET_NAME,
          Key: `certificates/${user?.name}.pdf`,
          Body: fs.readFileSync(`./${user.name}.pdf`),
          ContentType: 'application/pdf',
        };

        const pdfS3Response = await this.s3.upload(pdfParams).promise();

        if (fs.existsSync(`./${user.name}.pdf`)) {
          fs.unlinkSync(`./${user.name}.pdf`);
        }

        await userModel.findByIdAndUpdate(
          user._id,
          {
            $set: {
              certificateGenerated: true,
              certificateUrl: pdfS3Response.Location,
              qrCodeUrl: s3Response[0].Location,
            },
          },
          { new: true },
        );

        return {
          name: user.name,
          certificateUrl: pdfS3Response.Location,
          qrCodeUrl: s3Response[0].Location,
        };
      });

      Promise.all(promises)
        .then(result => {
          res.status(200).json({ data: result, message: 'processed successfully', status: 'success' });
        })
        .catch(error => {
          console.error(error);
        });
    } catch (error) {
      next(error);
    }
  };
}

export default StakeholderController;
