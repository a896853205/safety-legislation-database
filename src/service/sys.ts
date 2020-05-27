import { Op } from 'sequelize';

import Bill from '../models/bill';
import Country from '../models/country';
import Person from '../models/person';
import LegislativeSubject from '../models/legislative-subject';
import Organization from '../models/organization';
import politicalOrganization from '../models/political-organization';

interface countryListType {
  [key: string]: (name: string, max: number) => Promise<Country[]>;
}

const countryListType: countryListType = {
  countryName: (name: string, max: number) =>
    Country.findAll({
      group: 'name',
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'name'],
      limit: max,
    }),
  countryFullName: (name: string, max: number) =>
    Country.findAll({
      group: 'fullName',
      where: {
        fullName: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'fullName'],
      limit: max,
    }),
  territory: (name: string, max: number) =>
    Country.findAll({
      group: 'territory',
      where: {
        territory: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'territory'],
      limit: max,
    }),
  territoryDetail: (name: string, max: number) =>
    Country.findAll({
      group: 'territoryDetail',
      where: {
        territoryDetail: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'territoryDetail'],
      limit: max,
    }),
};

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

  getOrganizationList: (name: string, max: number) =>
    Organization.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'name'],
      limit: max,
    }),

  getPolicyAreaList: (name: string, max: number) =>
    Bill.findAll({
      group: 'policyArea',
      where: {
        policyArea: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['policyArea'],
      limit: max,
    }),

  getLegislativeSubjectsList: (name: string, max: number) =>
    LegislativeSubject.findAll({
      group: 'subject',
      where: {
        subject: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['subject'],
      limit: max,
    }),

  getCountryList: (name: string, max: number, countryType: string) => {
    if (countryType in countryListType) {
      return countryListType[countryType](name, max);
    } else {
      return [];
    }
  },

  getPolicyOrganizationList: (name: string, max: number) =>
    politicalOrganization.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ['uuid', 'name'],
      limit: max,
    }),
};
