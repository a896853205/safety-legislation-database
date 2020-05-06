import Bill from '../models/bill';
import Cosponsor from '../models/cosponsor';
import Person from '../models/person';
import culSecondTableOption from './util/second-table-option';
import { Op } from 'sequelize';

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
        attributes: ['uuid', 'number', 'name'],
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
      attributes: ['uuid', 'number', 'name'],
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
};
