import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Subject from '../models/legislative-subject';
import Bill from '../models/bill';

export default async () => {
  const spinner = ora('Subject').start();

  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number']
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/subject.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    interface IExcelRow {
      number?: string;
      subject: string;
    }

    interface ISubject {
      uuid: string;
      billUuid?: string;
      subject: string;
    }

    let subjectArr: Array<ISubject> = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';

    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();
        lastNumberUuid = await billArr.find(item => item.number === _lastNumber)
          ?.uuid;
      }

      subjectArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        subject: item.subject?.trim()
      });
    }

    await Subject.bulkCreate(subjectArr);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
