import { Op } from 'sequelize';

import Country from '../models/country';
import Bill from '../models/bill';
import politicalOrganization from '../models/political-organization';

export default {
  getBillAndLegislativeOrganization: async (
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
          attributes: ['uuid'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getBPOStatistics: async (billNumber: string, billCongress: number) => {
    let bill = await Bill.findOne({
      where: {
        number: billNumber,
        congress: billCongress,
      },
      attributes: ['uuid', 'number', 'congress'],
      include: [
        {
          model: Country,
          attributes: ['uuid'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
      ],
    });

    return {
      totalNum: bill?.country?.politicalOrganizations
        ? bill.country.politicalOrganizations.length
        : 0,
    };
  },

  getPolicyOrganizationAndBill: async (
    policyOrganizationUuid: string,
    page: number,
    pageSize: number
  ) => {
    let billUuidArr: { uuid: string }[] = [];

    let billRows = await Bill.findAll({
      attributes: ['uuid'],
      include: [
        {
          model: Country,
          attributes: ['uuid'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['uuid'],
              where: {
                uuid: policyOrganizationUuid,
              },
            },
          ],
        },
      ],
    });

    for (let item of billRows) {
      if (item.uuid) billUuidArr.push({ uuid: item.uuid });
    }

    let { rows, count } = await Bill.findAndCountAll({
      distinct: true,
      where: {
        [Op.or]: billUuidArr,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      include: [
        {
          model: Country,
          attributes: ['uuid'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
      ],
    });

    return {
      data: rows,
      totalNum: count,
    };
  },

  getPOBStatistics: async (policyOrganizationUuid: string) => {
    let relativeBillTotal = await Bill.count({
      attributes: ['uuid'],
      distinct: true,
      include: [
        {
          model: Country,
          attributes: ['uuid'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['uuid'],
              where: {
                uuid: policyOrganizationUuid,
              },
            },
          ],
        },
      ],
    });

    return {
      relativeBillTotal,
    };
  },
};
