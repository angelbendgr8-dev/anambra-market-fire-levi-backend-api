import moment from 'moment';

export const functionPaginate = async (page: number, limit: number, content: any, db: any, filerCount?: any) => {
  const noPage = page || 1;
  const limitPerPage = limit || 20;
  const skip = (noPage - 1) * limitPerPage;
  const totalContent = await db.countDocuments(filerCount ? { ...filerCount } : {});
  const totalPages = Math.ceil(totalContent / limitPerPage);
  const data = await content.slice(skip, skip + Number(limitPerPage));
  return { data, totalContent, totalPages, limitPerPage };
};

export const functionByPaginate = async (page: number, limit: number, content: any, db: any) => {
  //pagination
  const noPage = page || 1;
  const limitPerPage = limit || 20;
  const skip = (noPage - 1) * limitPerPage;
  const totalContent = await // count by unique market
  db.aggregate([
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

  const totalPages = Math.ceil(totalContent.length / limitPerPage);
  const data = await content.slice(skip, skip + Number(limitPerPage));
  return { data, totalContent: totalContent?.length, totalPages, limitPerPage };
};

export const defaultersPagination = async (page: number, limit: number, content: any, db: any, market: string) => {
  const months = moment().diff(moment('2021-01-01'), 'months');
  //pagination
  const noPage = page || 1;
  const limitPerPage = limit || 20;
  const skip = (noPage - 1) * limitPerPage;
  const totalContent = await db.aggregate([
    {
      $match: {
        market: market,
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
        outstanding: {
          $subtract: [
            months * 5000,
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
            input: { $range: [0, months] },
            as: 'month',
            in: {
              $dateToString: {
                date: { $add: [new Date('2021-01-01'), { $multiply: ['$$month', 1000 * 60 * 60 * 24 * 31] }] },
                format: '%Y-%m-%d',
              },
            },
          },
        },
      },
    },
    {
      $match: {
        totalAmount: { $lt: months * 5000 },
      },
    },
  ]);
  const totalPages = Math.ceil(totalContent.length / limitPerPage);
  const data = await content.slice(skip, skip + Number(limitPerPage));
  return { data, totalContent: totalContent?.length, totalPages, limitPerPage };
};
