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

// const TYPE = ['BILL', 'AMENDMENT', 'RESOLUTION', 'CONCURRENTRESOLUTION'];

const _congress2startYear = (congress: number) => {
  return (congress - 100 - 13) * 2 + 2013;
};

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
      sponsorUuid?: string;
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

    let personArr = await Person.findAll();

    let billArray: IBill[] = [];

    for (let item of dataArray) {
      let congress: number | undefined = undefined;

      // 处理国会届数
      if (item.congress) {
        congress = Number(item.congress?.substring(0, 3));
        congress = !isNaN(congress) ? congress : undefined;
      } else {
        if (item.dateSponsored) {
          congress = _congress2startYear(
            moment(item.dateSponsored, 'MM/DD/YYYY', false).year()
          );
        }
      }

      // if (
      //   !TYPE.includes(item.type?.toUpperCase() ? item.type?.toUpperCase() : '')
      // ) {
      //   throw new Error(`type有非法字段为${item.type?.toUpperCase()}`);
      // }

      // 目前全部是美国uuid
      let countryUuid: string | undefined = '';
      let country: Country | null;

      if (item.country) {
        country = await Country.findOne({
          where: { name: item.country },
        });

        if (!country) {
          throw Error(item.country);
        }

        countryUuid = country?.uuid;
      }

      let sponsor = personArr.find(
        person => person.name === item.sponsor?.trim()
      )?.uuid;

      if (!sponsor && item.sponsor) {
        console.error(item.number);
        throw new Error(`sponsor有非法字段为${item.number}`);
      }

      // text 读取
      let textNumber = `${item.number}`?.replace('/', '_');
      let text: string | undefined;
      let summary: string | undefined;
      try {
        text = fs
          .readFileSync(
            path.resolve(
              __dirname,
              `../text/text-${textNumber}-${congress}.txt`
            )
          )
          .toString();
      } catch (error) {}

      try {
        // summary 读取
        summary = fs
          .readFileSync(
            path.resolve(
              __dirname,
              `../summary/summary-${textNumber}-${congress}.txt`
            )
          )
          .toString();
      } catch (error) {}

      billArray.push({
        uuid: uuidv1(),
        // 处理括号和年份
        number: item.number
          ? `${item.number}`?.replace(/\(.*\)/g, '')?.trim()
          : undefined,
        type: item.type?.toUpperCase(),
        // 处理国会届数
        congress,
        name: item.name,
        dateSponsored: item.dateSponsored
          ? moment(item.dateSponsored, 'MM/DD/YYYY', false).toDate()
          : undefined,
        sponsorUuid: sponsor,
        originChamber: item.originChamber?.trim(),
        status: item.status,
        policyArea: item.policyArea,
        purpose: item.purpose,
        description: item.description,
        summary,
        text,
        ref: item.ref,
        businessUnit: item.businessUnit,
        proposed: item.proposed,
        explanatory: item.explanatory,
        country: item.country,
        member: item.member,
        countryUuid,
      });
    }

    await Bill.bulkCreate(billArray);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
