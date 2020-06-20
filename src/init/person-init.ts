import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import ora from 'ora';

import Person from '../models/person';
import PersonIdentity from '../models/person-identity';

export default async () => {
  const spinner = ora('Person, PersonIdentity').start();

  try {
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/person.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    interface IExcelRow {
      people: string;
      state?: string;
      district?: string;
      congressStart?: string;
      congressEnd?: string;
      dateStart?: string;
      dateEnd?: string;
      identity?: string;
      party?: string;
    }

    interface IPerson {
      uuid: string;
      name: string;
    }

    interface IPersonIdentity {
      uuid: string;
      personUuid?: string;
      state?: string;
      district?: number;
      congressStart?: number;
      congressEnd?: number;
      dateStart?: number;
      dateEnd?: number;
      identity?: string;
      party?: string;
    }

    let peopleSet = new Set<string>();
    let personArr: IPerson[] = [];
    let personIdentityArr: IPersonIdentity[] = [];

    // 删除中文表头
    dataArray.shift();

    // 人名去重
    for (let item of dataArray) {
      peopleSet.add(item.people.trim());
    }

    for (let name of peopleSet) {
      personArr.push({
        uuid: uuidv1(),
        name,
      });
    }

    for (let item of dataArray) {
      personIdentityArr.push({
        uuid: uuidv1(),
        personUuid: personArr.find(person => person.name === item.people.trim())
          ?.uuid,
        state: item.state,
        district: item.district ? +item.district : undefined,
        congressStart: item.congressStart ? +item.congressStart : undefined,
        congressEnd: item.congressEnd ? +item.congressEnd : undefined,
        dateStart: item.dateStart
          ? moment(item.dateStart, 'YYYY', false).unix()
          : undefined,
        dateEnd: item.dateEnd
          ? moment(item.dateEnd, 'YYYY', false).unix()
          : undefined,
        identity: item.identity,
        party: item.party,
      });
    }

    await Promise.all([
      Person.bulkCreate(personArr),
      PersonIdentity.bulkCreate(personIdentityArr),
    ]);
    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};
