import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import ora from 'ora';

// 数据库
import Person from '../models/person';
import Bill from '../models/bill';
import Cosponsor from '../models/cosponsor';
import { stringify } from 'querystring';

interface IExcelRow {
  number?: string;
  cosponsor?: string;
  cosponsorDate?: string;
}

interface ICosponsor {
  uuid: string;
  billUuid?: string;
  cosponsorUuid?: string;
  cosponsorDate?: Date;
}

export default async () => {
  const spinner = ora('Cosponsor').start();
  try {
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/cosponsor.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 处理掉中文表头
    dataArray.shift();
    // console.log(dataArray);

    let personArr = await Person.findAll();
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number'],
    });
    let cosponsorArr: ICosponsor[] = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';

    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();
        lastNumberUuid = await billArr.find(item => item.number === _lastNumber)
          ?.uuid;
      }

      let cosponsorUuid: string | undefined;

      if (item.cosponsor) {
        cosponsorUuid = personArr.find(
          person => person.name === item.cosponsor?.trim()
        )?.uuid;

        if (!cosponsorUuid) {
          // console.error(item.cosponsor);
          throw new Error(`cosponsor有非法内容为 ${item.cosponsor}`);
        }
      }

      cosponsorArr.push({
        uuid: uuidv1(),
        billUuid: lastNumberUuid,
        cosponsorUuid,
        cosponsorDate: item.cosponsorDate
          ? moment(item.cosponsorDate, 'MM/DD/YYYY', false).toDate()
          : undefined,
      });
    }

    await Cosponsor.bulkCreate(cosponsorArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
