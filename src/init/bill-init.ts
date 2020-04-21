import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import ora from 'ora';

// 数据库
import Country from '../models/country';
import Person from '../models/person';
import Bill from '../models/bill';

const TYPE = ['BILL', 'AMENDMENT', 'RESOLUTION', 'CONCURRENTRESOLUTION'];

export default async () => {
  const spinner = ora('Bill').start();
  try {
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/bill.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 处理掉中文表头
    dataArray.shift();
    // console.log(dataArray);

    interface IExcelRow {
      [propName: string]: string | undefined;
    }

    interface IBill {
      uuid: string;
      number?: string;
      type?: string;
      congress?: number;
      name?: string;
      dateSponsored?: Date;
      sponsor?: string;
      originChamber?: string;
      status?: string;
      policyArea?: string;
      purpose?: string;
      description?: string;
      summary?: string;
      text?: string;
      ref?: string;
      businessUnit?: string;
      proposed?: string;
      explanatory?: string;
      country?: string;
      member?: string;
      countryUuid?: string;
    }

    // 目前全部是美国uuid
    let USUuid: string | undefined = '';

    let country = await Country.findOne({
      where: { name: '美国' },
    });
    USUuid = country?.uuid;

    let personArr = await Person.findAll();

    let billArray: IBill[] = [];

    for (let item of dataArray) {
      // 处理国会届数
      let congress: number | undefined = Number(item.congress?.substring(0, 3));
      congress = !isNaN(congress) ? congress : undefined;

      if (
        !TYPE.includes(item.type?.toUpperCase() ? item.type?.toUpperCase() : '')
      ) {
        throw new Error(`type有非法字段为${item.type?.toUpperCase()}`);
      }

      let sponsor = personArr.find(
        person => person.name === item.sponsor?.trim()
      )?.uuid;

      if (!sponsor) {
        console.log(item.number);
      }

      billArray.push({
        uuid: uuidv1(),
        // 处理括号和年份
        number: item.number?.replace(/\(.*\)/g, '')?.trim(),
        type: item.type?.toUpperCase(),
        // 处理国会届数
        congress,
        name: item.name,
        dateSponsored: moment(item.dateSponsored, 'MM/DD/YYYY', false).toDate(),
        sponsor,
        originChamber: item.originChamber?.trim(),
        status: item.status,
        policyArea: item.policyArea,
        purpose: item.purpose,
        description: item.description,
        summary: item.summary,
        text: item.text,
        ref: item.ref,
        businessUnit: item.businessUnit,
        proposed: item.proposed,
        explanatory: item.explanatory,
        country: item.country,
        member: item.member,
        countryUuid: USUuid,
      });
    }

    await Bill.bulkCreate(billArray);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
