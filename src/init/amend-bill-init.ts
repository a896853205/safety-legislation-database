import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import AmendBill from '../models/amend-bill';
import Bill from '../models/bill';

export default async () => {
  const spinner = ora('AmendBill').start();

  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number']
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/amend-bill.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    interface IExcelRow {
      number: string;
      amendBill?: string;
    }

    interface IAmendBill {
      uuid: string;
      billUuid?: string;
      amendBillNumber: string;
    }

    let amendBillArr: Array<IAmendBill> = [];

    for (let item of dataArray) {
      if (item.amendBill) {
        amendBillArr.push({
          uuid: uuidv1(),
          billUuid: await billArr.find(
            billItem =>
              billItem.number === item.number?.replace(/\(.*\)/g, '')?.trim()
          )?.uuid,
          amendBillNumber: item.amendBill.trim()
        });
      }
    }

    await AmendBill.bulkCreate(amendBillArr);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
