import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';
import moment from 'moment';

import Bill from '../models/bill';
import Committee from '../models/committee';
import CommitteeActivity from '../models/committee-activity';
import Organization from '../models/organization';

interface IExcelRow {
  number: string;
  congress: string;
  committee?: string;
  committeeActivityDate?: string;
  committeeActivity?: string;
}

interface IcommitteeActivity {
  uuid: string;
  committeeUuid?: string;
  committeeActivityDate?: Date;
  committeeActivity?: string;
}

export default async () => {
  const spinner = ora('CommitteeActivity').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });
    const committeeArr = await Committee.findAll({
      attributes: ['uuid', 'billUuid'],
      include: [
        {
          model: Organization,
        },
      ],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/committee-activity.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let committeeActivityArr: IcommitteeActivity[] = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';

    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();

        // 处理国会届数
        let congress: number | undefined = Number(
          item.congress?.substring(0, 3)
        );
        congress = !isNaN(congress) ? congress : undefined;

        lastNumberUuid = billArr.find(
          item => item.congress === congress && item.number === _lastNumber
        )?.uuid;
      }

      let committeeUuid: string | undefined = '';

      if (lastNumberUuid && item.committee) {
        committeeUuid = committeeArr.find(
          committeeItem =>
            committeeItem.billUuid === lastNumberUuid &&
            committeeItem.organization?.name === item.committee
        )?.uuid;
      }

      if (
        committeeUuid &&
        (item.committeeActivityDate || item.committeeActivity)
      ) {
        committeeActivityArr.push({
          uuid: uuidv1(),
          committeeUuid,
          committeeActivity: item.committeeActivity?.trim(),
          committeeActivityDate: item.committeeActivityDate
            ? moment(item.committeeActivityDate, 'MM/DD/YYYY', false).toDate()
            : undefined,
        });
      }
    }

    await CommitteeActivity.bulkCreate(committeeActivityArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
