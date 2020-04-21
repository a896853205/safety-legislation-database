import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Bill from '../models/bill';
import Committee from '../models/committee';
import CommitteeSub from '../models/committee-sub';

interface IExcelRow {
  number: string;
  committee?: string;
  subcommittee?: string;
}

interface IcommitteeSub {
  uuid: string;
  committeeUuid?: string;
  subCommitteeName?: string;
}

export default async () => {
  const spinner = ora('CommitteeSub').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number'],
    });
    const committeeArr = await Committee.findAll({
      attributes: ['uuid', 'billUuid', 'committeeName'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/committee-sub.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let committeeSubArr: IcommitteeSub[] = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';

    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();
        lastNumberUuid = billArr.find(item => item.number === _lastNumber)
          ?.uuid;
      }

      let committeeUuid: string | undefined = '';

      if (lastNumberUuid && item.committee) {
        committeeUuid = committeeArr.find(
          committeeItem =>
            committeeItem.billUuid === lastNumberUuid &&
            committeeItem.committeeName === item.committee
        )?.uuid;
      }

      if (committeeUuid && item.subcommittee) {
        committeeSubArr.push({
          uuid: uuidv1(),
          committeeUuid,
          subCommitteeName: item.subcommittee,
        });
      }
    }

    await CommitteeSub.bulkCreate(committeeSubArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
