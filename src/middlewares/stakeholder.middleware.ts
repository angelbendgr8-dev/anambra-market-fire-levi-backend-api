import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import stakeholdersModel from '@/models/stakeholder.model';
import stakeModel from '@/models/stake.model';

const stakeholderMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await stakeholdersModel.findById(userId).populate('stake', stakeModel);

      if (findUser) {
        if (findUser.status === 'inactive') {
          next(new HttpException(401, 'Account is inactive'));
        } else {
          if (findUser?.stake?.name === 'taskforce') {
            next(new HttpException(401, 'Unauthorized access'));
          } else {
            req.user = findUser;
            next();
          }
        }
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default stakeholderMiddleware;
