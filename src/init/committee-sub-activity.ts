import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';
import moment from 'moment';

import Bill from '../models/bill';
import Committee from '../models/committee';
import CommitteeSub from '../models/committee-sub';
import CommitteeSubActivity from '../models/committee-sub-activity';
import Organization from '../models/organization';

interface IExcelRow {
  number: string;
  congress: string;
  committee?: string;
  subcommittee?: string;
  subCommitteeActivityDate?: string;
  subCommitteeActivity?: string;
}

interface IcommitteeSubActivity {
  uuid: string;
  subCommitteeUuid?: string;
  subCommitteeActivityDate?: Date;
  subCommitteeActivity?: string;
}

export default async () => {
  const spinner = ora('CommitteeSub').start();
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
    const committeeSubArr = await CommitteeSub.findAll({
      attributes: ['uuid', 'committeeUuid', 'subCommitteeName'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/committee-sub-activity.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let committeeSubActivityArr: IcommitteeSubActivity[] = [];

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

      let committeeUuid: string | undefined;

      if (lastNumberUuid && item.committee) {
        committeeUuid = committeeArr.find(
          committeeItem =>
            committeeItem.billUuid === lastNumberUuid &&
            committeeItem.organization?.name === item.committee
        )?.uuid;
      }

      let committeeSubUuid: string | undefined;

      if (committeeUuid && item.subcommittee) {
        committeeSubUuid = committeeSubArr.find(
          committeeSubItem =>
            committeeSubItem.committeeUuid === committeeUuid &&
            committeeSubItem.subCommitteeName === item.subcommittee
        )?.uuid;
      }

      if (
        committeeSubUuid &&
        (item.subCommitteeActivityDate || item.subCommitteeActivity)
      ) {
        committeeSubActivityArr.push({
          uuid: uuidv1(),
          subCommitteeUuid: committeeSubUuid,
          subCommitteeActivityDate: item.subCommitteeActivityDate
            ? moment(
                item.subCommitteeActivityDate,
                'MM/DD/YYYY',
                false
              ).toDate()
            : undefined,
          subCommitteeActivity: item.subCommitteeActivity?.trim(),
        });
      }
    }

    await CommitteeSubActivity.bulkCreate(committeeSubActivityArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
