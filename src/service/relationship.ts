import { Op } from 'sequelize';

import Bill from '../models/bill';
import Committee from '../models/committee';
import Constraint from '../models/constraint';
import Cosponsor from '../models/cosponsor';
import culSecondTableOption from './util/second-table-option';
import Executor from '../models/executor';
import Organization from '../models/organization';
import Person from '../models/person';
import RelatedObject from '../models/related-object';

interface ISponsorAndCosponsorTable extends Bill {
  personType: string;
}

export default {
  // <基本角色实例，基本角色关系类型，基本角色实例>数据集
  getSponsorAndCosponsor: async (
    personUuid: string,
    page: number,
    pageSize: number
  ) => {
    let sponsorTableRows: ISponsorAndCosponsorTable[] = [];
    let cosponsorTableRows: ISponsorAndCosponsorTable[] = [];
    let { rows: sponsorRows, count: sponsorCount } = await Bill.findAndCountAll(
      {
        where: {
          sponsorUuid: personUuid,
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        attributes: ['uuid', 'number', 'congress'],
        distinct: true,
        include: [
          {
            model: Cosponsor,
            attributes: ['uuid'],
            include: [
              {
                model: Person,
                attributes: ['uuid', 'name'],
              },
            ],
          },
          {
            model: Person,
            attributes: ['uuid', 'name'],
          },
        ],
      }
    );

    sponsorTableRows = sponsorRows.map(item => {
      let typeItem: any = item.get();
      typeItem.personType = 'sponsor';
      return typeItem;
    });

    let billUuidArr: { uuid: string }[] = [];
    // 计算分页第二部分的limit, offset
    let { offset, limit } = culSecondTableOption(sponsorCount, pageSize, page);

    // 先查询有哪些bill的cosponsors包含personUuid
    let billRows = await Bill.findAll({
      attributes: ['uuid'],
      include: [
        {
          model: Cosponsor,
          attributes: [],
          where: {
            cosponsorUuid: personUuid,
          },
        },
      ],
    });

    for (let item of billRows) {
      if (item.uuid) billUuidArr.push({ uuid: item.uuid });
    }

    let {
      rows: cosponsorRows,
      count: cosponsorCount,
    } = await Bill.findAndCountAll({
      limit,
      offset,
      attributes: ['uuid', 'number', 'name', 'congress'],
      where: {
        [Op.or]: billUuidArr,
      },
      distinct: true,
      include: [
        {
          model: Cosponsor,
          attributes: ['uuid'],
          include: [
            {
              model: Person,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: Person,
          attributes: ['uuid', 'name'],
        },
      ],
    });

    cosponsorTableRows = cosponsorRows.map(item => {
      let typeItem: any = item.get();
      typeItem.personType = 'cosponsor';
      return typeItem;
    });

    return {
      totalNum: sponsorCount + cosponsorCount,
      data: [...sponsorTableRows, ...cosponsorTableRows],
    };
  },

  getSCStatistics: async (personUuid: string) => {
    let billUuidSet = new Set<string>();
    let [sponsorRows, cosSponsorRows] = await Promise.all([
      Bill.findAll({
        where: {
          sponsorUuid: personUuid,
        },
        attributes: ['uuid'],
      }),
      Bill.findAll({
        attributes: ['uuid'],
        include: [
          {
            model: Cosponsor,
            attributes: [],
            where: {
              cosponsorUuid: personUuid,
            },
          },
        ],
      }),
    ]);

    sponsorRows.forEach((item: Bill) => {
      item.uuid ? billUuidSet.add(item.uuid) : undefined;
    });

    cosSponsorRows.forEach((item: Bill) => {
      item.uuid ? billUuidSet.add(item.uuid) : undefined;
    });

    return {
      relativeBillTotal: billUuidSet.size,
    };
  },

  getOBCommittee: async (
    organizationUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      include: [
        {
          model: Committee,
          attributes: ['uuid'],
          where: {
            organizationUuid,
          },
          include: [
            {
              model: Organization,
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

  getOBConstraint: async (
    organizationUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      include: [
        {
          model: Constraint,
          attributes: ['uuid'],
          where: {
            organizationUuid,
          },
          include: [
            {
              model: Organization,
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

  getOBRelatedObject: async (
    organizationUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      include: [
        {
          model: RelatedObject,
          attributes: ['uuid'],
          where: {
            organizationUuid,
          },
          include: [
            {
              model: Organization,
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

  getOBExecutor: async (
    organizationUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      include: [
        {
          model: Executor,
          attributes: ['uuid'],
          where: {
            organizationUuid,
          },
          include: [
            {
              model: Organization,
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

  getOBStatistics: async (organizationUuid: string) => {
    let billUuidSet = new Set<string | undefined>();
    let [
      { rows: committeeRows, count: committeeNum },
      { rows: constraintRows, count: constraintNum },
      { rows: relatedObjectRows, count: relatedObjectNum },
      { rows: executorRows, count: executorNum },
    ] = await Promise.all([
      Bill.findAndCountAll({
        attributes: ['uuid'],
        include: [
          {
            model: Committee,
            attributes: [],
            where: {
              organizationUuid,
            },
          },
        ],
      }),
      Bill.findAndCountAll({
        attributes: ['uuid'],
        include: [
          {
            model: Constraint,
            attributes: [],
            where: {
              organizationUuid,
            },
          },
        ],
      }),
      Bill.findAndCountAll({
        attributes: ['uuid'],
        include: [
          {
            model: RelatedObject,
            attributes: [],
            where: {
              organizationUuid,
            },
          },
        ],
      }),
      Bill.findAndCountAll({
        attributes: ['uuid'],
        include: [
          {
            model: Executor,
            attributes: [],
            where: {
              organizationUuid,
            },
          },
        ],
      }),
    ]);

    committeeRows.forEach(item => billUuidSet.add(item?.uuid));
    constraintRows.forEach(item => billUuidSet.add(item?.uuid));
    relatedObjectRows.forEach(item => billUuidSet.add(item?.uuid));
    executorRows.forEach(item => billUuidSet.add(item?.uuid));

    return {
      relativeBillNum: billUuidSet.size,
      committeeNum,
      constraintNum,
      executorNum,
      relatedObjectNum,
    };
  },

  getBillAndOrganization: async (
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
      attributes: ['uuid', 'number', 'congress'],
      distinct: true,
      include: [
        {
          model: Committee,
          attributes: ['uuid'],
          include: [
            {
              model: Organization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: Constraint,
          attributes: ['uuid'],
          include: [
            {
              model: Organization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: Executor,
          attributes: ['uuid'],
          include: [
            {
              model: Organization,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: RelatedObject,
          attributes: ['uuid'],
          include: [
            {
              model: Organization,
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
};
