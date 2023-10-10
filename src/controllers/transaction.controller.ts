import { HttpException } from '@/exceptions/HttpException';
import stakeModel from '@/models/stake.model';
import transactionModel from '@/models/transaction.model';
import { functionByPaginate } from '@/utils/pagination';
import { NextFunction, Response } from 'express';
import allMarkets from '../utils/markets.json';

class TransactionController {
  public fetchTransactions = async (req: any, res: Response, next: NextFunction) => {
    const { startDate, endDate, market, search, page, limit } = req.query;
    const userStake = req.user.stake;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
        if (!startDate || !endDate || startDate === 'null' || endDate === 'null') {
          // fetch all transactions and group by market and show sum of amount
          const transactions = await transactionModel.aggregate([
            {
              $match: {
                ...(market && market === 'all' ? {} : { market }),
                ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                transactions: { $push: '$$ROOT' },
              },
            },
            {
              $unwind: '$transactions',
            },
            {
              $group: {
                _id: {
                  date: '$_id',
                  market: '$transactions.market',
                },
                totalAmount: { $sum: '$transactions.amount' },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.date',
                markets: {
                  $push: {
                    name: '$_id.market',
                    totalAmount: '$totalAmount',
                    count: '$count',
                  },
                },
              },
            },
          ]);

          const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
            Number(page),
            Number(limit),
            transactions,
            transactionModel,
          );
          res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
        } else {
          if (startDate && startDate !== 'null' && !endDate && endDate === 'null') {
            throw new HttpException(400, 'endDate is required');
          }
          // fetch all transactions that falls within 12am of startDate and 11:59pm of endDate and group by market and show sum of amount
          const transactions = await transactionModel.aggregate([
            {
              $match: {
                ...(market && market === 'all' ? {} : { market }),
                ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
                createdAt: {
                  $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                transactions: { $push: '$$ROOT' },
              },
            },
            {
              $unwind: '$transactions',
            },
            {
              $group: {
                _id: {
                  date: '$_id',
                  market: '$transactions.market',
                },
                totalAmount: { $sum: '$transactions.amount' },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.date',
                markets: {
                  $push: {
                    name: '$_id.market',
                    totalAmount: '$totalAmount',
                    count: '$count',
                  },
                },
              },
            },
          ]);

          const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
            Number(page),
            Number(limit),
            transactions,
            transactionModel,
          );
          res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
        }
      } else {
        if (!startDate || !endDate || startDate === 'null' || endDate === 'null') {
          const transactions = await transactionModel.aggregate([
            {
              $match: {
                market: req.user.market,
                ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                transactions: { $push: '$$ROOT' },
              },
            },
            {
              $unwind: '$transactions',
            },
            {
              $group: {
                _id: {
                  date: '$_id',
                  market: '$transactions.market',
                },
                totalAmount: { $sum: '$transactions.amount' },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.date',
                markets: {
                  $push: {
                    name: '$_id.market',
                    totalAmount: '$totalAmount',
                    count: '$count',
                  },
                },
              },
            },
          ]);

          const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
            Number(page),
            Number(limit),
            transactions,
            transactionModel,
          );
          res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
        } else {
          const transactions = await transactionModel.aggregate([
            {
              $match: {
                market: req.user.market,
                ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
                createdAt: {
                  $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                transactions: { $push: '$$ROOT' },
              },
            },
            {
              $unwind: '$transactions',
            },
            {
              $group: {
                _id: {
                  date: '$_id',
                  market: '$transactions.market',
                },
                totalAmount: { $sum: '$transactions.amount' },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.date',
                markets: {
                  $push: {
                    name: '$_id.market',
                    totalAmount: '$totalAmount',
                    count: '$count',
                  },
                },
              },
            },
          ]);

          const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
            Number(page),
            Number(limit),
            transactions,
            transactionModel,
          );
          res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
        }
      }
    } catch (error) {
      next(error);
    }
  };

  public fetchDashboardTransactions = async (req: any, res: Response, next: NextFunction) => {
    const { market, search, page, limit } = req.query;
    const userStake = req.user.stake;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
        const transactions = await transactionModel.aggregate([
          {
            $match: {
              ...(market && market === 'all' ? {} : { market }),
              ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              transactions: { $push: '$$ROOT' },
            },
          },
          {
            $unwind: '$transactions',
          },
          {
            $group: {
              _id: {
                date: '$_id',
                market: '$transactions.market',
              },
              totalAmount: { $sum: '$transactions.amount' },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: '$_id.date',
              markets: {
                $push: {
                  name: '$_id.market',
                  totalAmount: '$totalAmount',
                  count: '$count',
                },
              },
            },
          },
        ]);

        const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
          Number(page),
          Number(limit),
          transactions,
          transactionModel,
        );
        res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
      } else {
        const transactions = await transactionModel.aggregate([
          {
            $match: {
              market: req.user.market,
              ...(search && { $or: [{ market: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }),
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              transactions: { $push: '$$ROOT' },
            },
          },
          {
            $unwind: '$transactions',
          },
          {
            $group: {
              _id: {
                date: '$_id',
                market: '$transactions.market',
              },
              totalAmount: { $sum: '$transactions.amount' },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: '$_id.date',
              markets: {
                $push: {
                  name: '$_id.market',
                  totalAmount: '$totalAmount',
                  count: '$count',
                },
              },
            },
          },
        ]);

        const { data, totalContent, totalPages, limitPerPage } = await functionByPaginate(
          Number(page),
          Number(limit),
          transactions,
          transactionModel,
        );
        res.status(200).json({ data, message: 'processed successfully', status: 'success', totalContent, totalPages, limitPerPage });
      }
    } catch (error) {
      next(error);
    }
  };

  public Summary = async (req: any, res: Response, next: NextFunction) => {
    const userStake = req.user.stake;
    try {
      const findStake = await stakeModel.findOne({ _id: userStake });

      if (!findStake) {
        throw new HttpException(404, 'Stake not found');
      }

      if (findStake.name !== 'union') {
        let totalAmountToday = 0;
        let totalAmountYesterday = 0;

        const transactionsToday = await transactionModel.find({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        });

        const transactionsYesterday = await transactionModel.find({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
            $lt: new Date(new Date().setHours(23, 59, 59, 999) - 86400000),
          },
        });

        transactionsToday.forEach(transaction => {
          totalAmountToday += transaction.amount;
        });

        transactionsYesterday.forEach(transaction => {
          totalAmountYesterday += transaction.amount;
        });

        const commissionToday = (totalAmountToday * findStake.percent) / 100;

        const commissionYesterday = (totalAmountYesterday * findStake.percent) / 100;
        res.status(200).json({
          message: 'processed successfully',
          status: 'success',
          totalAmountToday,
          totalAmountYesterday,
          commissionToday,
          commissionYesterday,
        });
      } else {
        let totalAmountToday = 0;
        let totalAmountYesterday = 0;

        const transactionsToday = await transactionModel.find({
          market: req.user.market,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        });

        const transactionsYesterday = await transactionModel.find({
          market: req.user.market,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
            $lt: new Date(new Date().setHours(23, 59, 59, 999) - 86400000),
          },
        });

        transactionsToday.forEach(transaction => {
          totalAmountToday += transaction.amount;
        });

        transactionsYesterday.forEach(transaction => {
          totalAmountYesterday += transaction.amount;
        });

        const commissionToday = (totalAmountToday * findStake.percent) / 100;

        const commissionYesterday = (totalAmountYesterday * findStake.percent) / 100;
        res.status(200).json({
          message: 'processed successfully',
          status: 'success',
          totalAmountToday,
          totalAmountYesterday,
          commissionToday,
          commissionYesterday,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public fetchMarkets = async (req: any, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ data: allMarkets, message: 'processed successfully', status: 'success' });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionController;
