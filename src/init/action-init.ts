import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import ora from 'ora';

import Bill from '../models/bill';
import Action from '../models/action';

export default async () => {
  const spinner = ora('Action').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });

    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/action.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    interface IExcelRow {
      number: string;
      congress: string;
      actionDate: string;
      actionStatus: string;
      action: string;
      value: string;
    }

    interface IAction {
      uuid: string;
      billUuid?: string;
      action?: string;
      actionDate?: Date;
      actionStatus?: string;
      value?: string;
    }

    // 中文标题
    dataArray.shift();

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    let actionArr: IAction[] = [];

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

      actionArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        action: item.action,
        actionDate: item.actionDate
          ? moment(item.actionDate, 'MM/DD/YYYY-hh:mmA', false).toDate()
          : undefined,
        actionStatus: item.actionStatus,
        value: item.value,
      });
    }

    await Action.bulkCreate(actionArr);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
