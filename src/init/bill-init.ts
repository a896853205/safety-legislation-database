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

interface ICategorize {
  number: string;
  congress: number;
  area: string;
  cls: string;
  cos: number;
}

const _startYear2congress = (startYear: number) => {
  return Math.floor((startYear - 2013) / 2) + 13 + 100;
};

export default async () => {
  const spinner = ora('Bill').start();

  try {
    const categorizeArr = JSON.parse(
      fs
        .readFileSync(path.resolve(__dirname, `../json/categorize.json`))
        .toString()
    );

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
      categorize?: string;
    }

    let personArr = await Person.findAll();

    let billArray: IBill[] = [];
    const errorNumberArr = [];

    for (let item of dataArray) {
      let congress: number | undefined = undefined;

      // 处理国会届数
      if (item.congress) {
        congress = Number(`${item.congress}`?.substring(0, 3));
        congress = !isNaN(congress) ? congress : undefined;
      } else {
        if (item.dateSponsored) {
          congress = _startYear2congress(
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
        errorNumberArr.push({ number: item.number, congress: item.congress });
        // throw new Error(`sponsor有非法字段为${item.number}`);
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

      const number = item.number
        ? `${item.number}`
            ?.replace(/\(.*\)/g, '')
            ?.replace(/\s/g, '')
            ?.trim()
        : undefined;
      const categorize = categorizeArr.find((cate: ICategorize) => {
        return (
          `${cate.number}`?.replace(/\s/g, '') === number &&
          Number(cate.congress) === congress
        );
      });

      billArray.push({
        uuid: uuidv1(),
        // 处理括号和年份
        number,
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
        categorize: categorize
          ? `${categorize.area}-${categorize.cls}`
          : undefined,
      });
    }

    if (errorNumberArr.length) {
      console.table(errorNumberArr);
      throw new Error(`sponsor有非法字段有${errorNumberArr.length}`);
    }

    await Bill.bulkCreate(billArray);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
