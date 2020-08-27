import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Bill from '../models/bill';
import Amendment from '../models/amendment';

export default async () => {
  const spinner = ora('Amendment').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/amendment.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    interface IExcelRow {
      number: string;
      billCongress: string;
      amendmentNumber?: string;
      congress?: string;
    }

    interface IAmendment {
      uuid: string;
      billUuid?: string;
      amendmentCode?: string;
      congress?: number;
    }

    let amendmentArr: Array<IAmendment> = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();

        if (item.billCongress) {
          // 处理国会届数
          let billCongress: number | undefined = Number(
            `${item.billCongress}`?.substring(0, 3)
          );
          billCongress = !isNaN(billCongress) ? billCongress : undefined;

          lastNumberUuid = billArr.find(
            item =>
              item.congress === billCongress && item.number === _lastNumber
          )?.uuid;
        } else {
          lastNumberUuid = billArr.find(item => item.number === _lastNumber)
            ?.uuid;
        }
      }

      amendmentArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        amendmentCode: item.amendmentNumber?.trim(),
        congress: item?.congress
          ? parseInt(`${item?.congress}`?.slice(0, 3) || '')
          : undefined,
      });
    }

    await Amendment.bulkCreate(amendmentArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
