import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';
import moment from 'moment';

import Bill from '../models/bill';
import Committee from '../models/committee';
import Organization from '../models/organization';

interface IExcelRow {
  number: string;
  congress: string;
  committeeName?: string;
  committeeDate?: string;
  committeeReportsNumber?: string;
}

interface Icommittee {
  uuid: string;
  billUuid?: string;
  organizationUuid?: string;
  committeeDate?: Date;
  committeeReportsNumber?: string;
}

export default async () => {
  const spinner = ora('Committee').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });
    const OrgArr = await Organization.findAll({
      attributes: ['uuid', 'name'],
    });

    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/committee.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let committeeArr: Icommittee[] = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    for (let item of dataArray) {
      let _organizationUuid: string | undefined = '';

      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();

        if (item.congress) {
          // 处理国会届数
          let congress: number | undefined = Number(
            item.congress?.substring(0, 3)
          );
          congress = !isNaN(congress) ? congress : undefined;

          lastNumberUuid = billArr.find(
            item => item.congress === congress && item.number === _lastNumber
          )?.uuid;
        } else {
          lastNumberUuid = billArr.find(item => item.number === _lastNumber)
            ?.uuid;
        }
      }

      if (item.committeeName) {
        _organizationUuid = OrgArr.find(
          orgItem => orgItem.name === item.committeeName
        )?.uuid;
      }

      if (
        item.committeeName ||
        item.committeeDate ||
        item.committeeReportsNumber
      ) {
        committeeArr.push({
          uuid: uuidv1(),
          billUuid: lastNumberUuid,
          organizationUuid: _organizationUuid,
          committeeDate: item.committeeDate
            ? moment(item.committeeDate, 'MM/DD/YYYY', false).toDate()
            : undefined,
          committeeReportsNumber: item.committeeReportsNumber,
        });
      }
    }

    await Committee.bulkCreate(committeeArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
