import Bill from '../models/bill';

export default {
  getBillAndPolicyArea: async (
    billNumber: string,
    billCongress: number,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      where: {
        number: billNumber,
        congress: billCongress,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress', 'policyArea'],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getPolicyAreaAndBill: async (
    policyArea: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      where: {
        policyArea,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getPBStatistics: async (policyArea: string) => {
    let relativeBillTotal = await Bill.count({
      where: {
        policyArea,
      },
    });

    return {
      relativeBillTotal,
    };
  },
};
