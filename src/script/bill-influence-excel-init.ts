// @ts-ignore
import consoleGrid from 'console-grid';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

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
import { data2One } from './util/2one';

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

  const oneRes = data2One(res);

  let wb = XLSX.utils.book_new();

  let ws_name = 'SheetJS';

  /* make worksheet */
  let ws_data = [
    ['name', 'score'],
    ...oneRes.map(item => [item.name, item.score]),
  ];
  let ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, path.resolve(__dirname, '../../dist-excel/out.xlsx'));
  const col: any[] = [];

  for (let key in oneRes[0]) {
    col.push({
      id: key,
      name: key,
      type: 'string',
      maxWidth: 20,
    });
  }

  new consoleGrid().render({
    columns: col,
    rows: oneRes,
  });
})();
