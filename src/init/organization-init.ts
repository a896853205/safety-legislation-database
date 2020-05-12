import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Organization from '../models/organization';

interface IExcelRow {
  name: string;
}

interface IOrganization {
  uuid: string;
  name?: string;
}

export default async () => {
  const spinner = ora('Organization').start();
  try {
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/organization.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let nameSet = new Set<string>();
    let organizationArr: IOrganization[] = [];

    for (let item of dataArray) {
      nameSet.add(item.name.trim());
    }

    for (let item of nameSet) {
      organizationArr.push({
        uuid: uuidv1(),
        name: item,
      });
    }

    await Organization.bulkCreate(organizationArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
