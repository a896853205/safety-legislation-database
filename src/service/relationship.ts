import Bill from '../models/bill';
import Cosponsor from '../models/cosponsor';
import Person from '../models/person';

export default {
  // <基本角色实例，基本角色关系类型，基本角色实例>数据集
  getSponsorAndCosponsor: async (
    personUuid: string,
    page: number,
    pageSize: number
  ) => {
    let { rows, count } = await Bill.findAndCountAll({
      where: {
        sponsorUuid: personUuid,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['uuid'],
      include: [
        {
          model: Cosponsor,
          include: [
            {
              model: Person,
              attributes: ['uuid', 'name'],
            },
          ],
        },
      ],
    });

    return {
      tableData: {
        totalNum: count,
        page,
        data: rows,
      },
      relativeBillNum: count,
    };
  },
};
