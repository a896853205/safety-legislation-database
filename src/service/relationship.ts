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
    let cosponsorRows: Bill[] = [];
    let { rows: sponsorRows, count } = await Bill.findAndCountAll({
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
    });

    sponsorTableRows = sponsorRows.map(item => {
      let typeItem = item as ISponsorAndCosponsorTable;
      typeItem.personType = 'sponsor';
      return typeItem;
    });

    if (sponsorRows.length < pageSize) {
      let billUuidArr: { uuid: string }[] = [];
      // 计算分页第二部分的limit, offset
      let { offset, limit } = culSecondTableOption(count, pageSize, page);

      // 先查询有哪些bill的cosponsors包含personUuid
      let billRows = await Bill.findAll({
        limit,
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

      cosponsorRows = await Bill.findAll({
        limit,
        offset,
        attributes: ['uuid', 'number', 'name'],
        where: {
          [Op.or]: billUuidArr,
        },
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
        let typeItem = item as ISponsorAndCosponsorTable;
        typeItem.personType = 'cosponsor';
        return typeItem;
      });
    }

    return [...sponsorTableRows, ...cosponsorTableRows]
  },
};
