import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import HumanWord from '../models/human-word';
import Program from '../models/program-word';
import Bill from '../models/bill';

export default async () => {
  const spinner = ora('Program, HumanWord').start();

  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number', 'congress'],
    });

    interface IExcelRow {
      number: string;
      congress: string;
      humanWord: string;
    }

    interface IHumanWord {
      uuid: string;
      billUuid?: string;
      word: string;
    }

    interface IProgramWord {
      uuid: string;
      billUuid?: string;
      word: string;
    }
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/words.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    const jsonBuf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../json/programWord.json')
    );

    const programJson = JSON.parse(jsonBuf.toString());

    // console.table(dataArray);

    let humanWordArr: Array<IHumanWord> = [];
    let programWordArr: Array<IProgramWord> = [];

    for (let item of dataArray) {
      let curNumber = item.number?.replace(/\(.*\)/g, '')?.trim();

      // 处理国会届数
      let congress: number | undefined = Number(item.congress?.substring(0, 3));
      congress = !isNaN(congress) ? congress : undefined;

      let billUuid = billArr.find(
        item => item.congress === congress && item.number === curNumber
      )?.uuid;

      if (item.humanWord) {
        for (let humanWord of item.humanWord.split('\n')) {
          humanWordArr.push({
            uuid: uuidv1(),
            billUuid,
            word: humanWord,
          });
        }
      }
    }

    for (let bill of programJson) {
      let billUuid = billArr.find(
        item =>
          item.congress === Number(bill.congress) && item.number === bill.number
      )?.uuid;

      if (billUuid && bill.sortedKeywords) {
        for (let programWord of bill.sortedKeywords) {
          if (programWord[0]) {
            programWordArr.push({
              uuid: uuidv1(),
              billUuid,
              word: programWord[0],
            });
          }
        }
      }
    }

    await HumanWord.bulkCreate(humanWordArr);
    await Program.bulkCreate(programWordArr);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
