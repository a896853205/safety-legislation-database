import { Op } from 'sequelize';

import Bill from '../models/bill';
import LegislativeSubject from '../models/legislative-subject';

export default {
  getBillAndLegislativeSubjects: async (
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
          model: LegislativeSubject,
          attributes: ['uuid', 'subject'],
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getLegislativeSubjectsAndBill: async (
    legislativeSubjects: string,
    page: number,
    pageSize: number
  ) => {
    let billUuidArr: { uuid: string }[] = [];

    let billRows = await Bill.findAll({
      attributes: ['uuid'],
      include: [
        {
          model: LegislativeSubject,
          where: {
            subject: legislativeSubjects,
          },
        },
      ],
    });

    for (let item of billRows) {
      if (item.uuid) billUuidArr.push({ uuid: item.uuid });
    }

    let { rows, count } = await Bill.findAndCountAll({
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      where: {
        [Op.or]: billUuidArr,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: LegislativeSubject,
          attributes: ['uuid', 'subject'],
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getBLStatistics: async (billNumber: string, billCongress: number) => {
    let billRows = await Bill.findOne({
      where: {
        number: billNumber,
        congress: billCongress,
      },
      attributes: ['uuid'],
      include: [
        {
          model: LegislativeSubject,
          attributes: ['uuid'],
        },
      ],
    });

    return {
      totalNum: billRows?.legislativeSubjects
        ? billRows?.legislativeSubjects?.length
        : 0,
    };
  },

  getLBStatistics: async (subject: string) => {
    let relativeBillTotal = await Bill.count({
      distinct: true,
      include: [
        {
          model: LegislativeSubject,
          where: {
            subject,
          },
        },
      ],
    });

    return {
      relativeBillTotal,
    };
  },
};
