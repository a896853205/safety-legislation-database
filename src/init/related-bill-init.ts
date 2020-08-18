import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Bill from '../models/bill';
import RelatedBill from '../models/related-bill';

export default async () => {
  const spinner = ora('RelatedBill').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/relate.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    interface IExcelRow {
      number: string;
      congress: string;
      relatedBills?: string;
      relationship?: string;
      relatedBillTitle?: string;
    }

    interface IRelatedBill {
      uuid: string;
      billUuid?: string;
      relatedBillCode?: string;
      relationship?: string;
      relatedBillName?: string;
    }

    let relatedBillArr: Array<IRelatedBill> = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    for (let item of dataArray) {
      if (!item.relatedBills && !item.relationship && !item.relatedBillTitle)
        continue;

      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();

        // 处理国会届数
        let congress: number | undefined = Number(
          `${item.congress}`?.substring(0, 3)
        );
        congress = !isNaN(congress) ? congress : undefined;

        lastNumberUuid = billArr.find(
          item => item.congress === congress && item.number === _lastNumber
        )?.uuid;
      }

      relatedBillArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        relatedBillCode: item.relatedBills?.trim(),
        relationship: item.relationship?.trim(),
        relatedBillName: item.relatedBillTitle?.trim(),
      });
    }

    await RelatedBill.bulkCreate(relatedBillArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
