import { Op } from 'sequelize';

import Person from '../models/person';

export default {
  // 模糊搜索person的name列表
  getPersonList: (name: string, max: number) =>
    Person.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'name'],
      limit: max,
    }),
};
