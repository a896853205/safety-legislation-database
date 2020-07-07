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
      attributes: ['uuid', 'number', 'congress'],
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
      congress?: string;
    }

    interface IAmendBill {
      uuid: string;
      billUuid?: string;
      amendBillNumber: string;
    }

    let amendBillArr: Array<IAmendBill> = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';

    for (let item of dataArray) {
      if (item.amendBill) {
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

        amendBillArr.push({
          uuid: uuidv1(),
          billUuid: lastNumberUuid,
          amendBillNumber: item.amendBill.trim(),
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
