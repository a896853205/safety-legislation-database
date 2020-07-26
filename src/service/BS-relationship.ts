import Action from '../models/action';
import Bill from '../models/bill';

export default {
  getBillAndStatus: async (
    billNumber: string,
    billCongress: number,
    page: number,
    pageSize: number
  ) => {
    let bill = await Bill.findOne({
      where: {
        number: billNumber,
        congress: billCongress,
      },
    });

    let billUuid = bill?.uuid ? bill?.uuid : '';

    let { rows, count } = await Action.findAndCountAll({
      where: {
        billUuid,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'action', 'actionDate', 'actionStatus', 'value'],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getStatusValueAndBill: async (
    statusValue: number,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      include: [
        {
          model: Action,
          attributes: ['uuid', 'action', 'actionDate', 'actionStatus', 'value'],
          where: {
            value: statusValue,
          },
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },
};
