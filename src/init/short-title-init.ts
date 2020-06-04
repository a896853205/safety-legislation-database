import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Bill from '../models/bill';
import ShortTitle from '../models/short-title';

export default async () => {
  const spinner = ora('ShortTitle').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/short-title.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    interface IExcelRow {
      number: string;
      congress: string;
      shortTitle?: string;
      shortTitleStatus?: string;
    }

    interface IShortTitle {
      uuid: string;
      billUuid?: string;
      shortTitle?: string;
      shortTitleStatus?: string;
    }

    let shortTitleArr: Array<IShortTitle> = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    for (let item of dataArray) {
      if (!item.shortTitle && !item.shortTitleStatus) continue;

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

      shortTitleArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        shortTitle: item.shortTitle?.trim(),
        shortTitleStatus: item.shortTitleStatus?.trim(),
      });
    }

    await ShortTitle.bulkCreate(shortTitleArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
