import { Op } from 'sequelize';

import Country from '../models/country';
import Bill from '../models/bill';

export default {
  getBillAndCountry: async (
    billNumber: string,
    billCongress: number,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      distinct: true,
      where: {
        number: billNumber,
        congress: billCongress,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      include: [
        {
          model: Country,
          attributes: [
            'uuid',
            'name',
            'fullName',
            'territory',
            'territoryDetail',
          ],
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getCountryAndBill: async (
    countryUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      attributes: ['uuid', 'number', 'congress'],
      where: {
        countryUuid,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getCBStatistics: async (countryUuid: string) => {
    let relativeBillTotal = await Bill.count({
      where: {
        countryUuid,
      },
    });

    return {
      relativeBillTotal,
    };
  },
};
