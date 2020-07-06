import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Country from '../models/country';
import PoliticalOrganization from '../models/political-organization';
import PoliticalOrganizationDivision from '../models/political-organization-division';

const unlessColumnArray: string[] = [
  '国家',
  '全称',
  '地域',
  '地域细分',
  '序号',
];

export default async () => {
  const spinner = ora('Country, PoliticalOrganization').start();

  try {
    interface IExcelRow {
      序号?: number;
      国家: string;
      全称: string;
      地域: string;
      地域细分: string;
      [propName: string]: string | undefined | number;
    }

    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/country.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    interface IPoliticalOrganization {
      uuid: string;
      name: string;
    }

    // 组织集合
    let organizationArray: Set<string> = new Set();
    let politicalOrganizationArray: IPoliticalOrganization[] = [];

    for (let item of dataArray) {
      for (let key in item) {
        organizationArray.add(key);
      }
    }

    // 去掉没用的列
    for (let unlessItem of unlessColumnArray) {
      organizationArray.delete(unlessItem);
    }

    organizationArray.forEach(item => {
      politicalOrganizationArray.push({
        uuid: uuidv1(),
        name: item,
      });
    });

    // console.log('政策组织处理结束');
    // console.log('politicalOrganizationArray');
    // console.table(politicalOrganizationArray);

    interface ICountry {
      uuid: string;
      name: string;
      fullName: string;
      territory: string;
      territoryDetail: string;
    }
    let countryArray: ICountry[] = [];

    for (let item of dataArray) {
      countryArray.push({
        uuid: uuidv1(),
        name: item['国家'],
        fullName: item['全称'],
        territory: item['地域'],
        territoryDetail: item['地域细分'],
      });
    }

    // console.log('国家数据处理结束');
    // console.log('countryArray');
    // console.table(countryArray);

    interface IPoliticalOrganizationDivision {
      uuid: string;
      CUuid?: string;
      POUuid?: string;
    }

    let politicalOrganizationDivisionArray: IPoliticalOrganizationDivision[] = [];

    for (let item of dataArray) {
      let CUuid = countryArray.find(countryItem => {
        return item['国家'] === countryItem.name;
      })?.uuid;

      for (let key in item) {
        if (item[key] === '是') {
          let POUuid = politicalOrganizationArray.find(
            politicalOrganizationItem => key === politicalOrganizationItem.name
          )?.uuid;

          politicalOrganizationDivisionArray.push({
            uuid: uuidv1(),
            CUuid,
            POUuid,
          });
        }
      }
    }

    // console.log('两表关联数据处理结束');
    // console.log('politicalOrganizationDivisionArray');
    // console.table(politicalOrganizationDivisionArray);

    await Country.bulkCreate(countryArray);
    await PoliticalOrganization.bulkCreate(politicalOrganizationArray);
    await PoliticalOrganizationDivision.bulkCreate(
      politicalOrganizationDivisionArray
    );
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
