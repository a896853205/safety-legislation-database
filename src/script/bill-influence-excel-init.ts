// @ts-ignore
import consoleGrid from 'console-grid';
import fs from 'fs';
import path from 'path';

import { csv2Array } from './util/csv2array';
import dbInit from '../db-connect';
import {
  getUSPerson,
  getUSBill,
  sponsorTotalNum,
  cosponsorTotalNum,
  policyAreaTotalNum,
  legislativeSubjectsTotalNum,
  becameLawRate,
  recognizedRate,
  socialInflu,
  influTime,
  identityScore,
  relativeTime,
} from './util/influence';

dbInit();

// 主函数
(async () => {
  const csvBuffer = fs.readFileSync(
    path.resolve(__dirname, '../csv/提出者.csv')
  );
  const personSocialInfluArr = csv2Array(csvBuffer);

  const [USPerson, USBill] = await Promise.all([getUSPerson(), getUSBill()]);

  const res = [];
  for (let person of USPerson) {
    if (person?.uuid && person.name) {
      res.push({
        name: person.name,
        M01: sponsorTotalNum(person.uuid, USBill),
        M02: cosponsorTotalNum(person.uuid, USBill),
        R01: policyAreaTotalNum(person.uuid, USBill),
        R02: 4,
        R03: legislativeSubjectsTotalNum(person.uuid, USBill),
        D01: socialInflu(person.name, personSocialInfluArr),
        D02: await identityScore(person.uuid, USBill),
        D03: becameLawRate(person.uuid, USBill),
        D04: recognizedRate(person.uuid, USBill),
        T01: influTime(person.uuid, USBill),
        T02: relativeTime(person.uuid, USBill),
      });
    }
  }

  const col: any[] = [];

  for (let key in res[0]) {
    col.push({
      id: key,
      name: key,
      type: 'string',
      maxWidth: 20,
    });
  }

  new consoleGrid().render({
    columns: col,
    rows: res,
  });
})();
