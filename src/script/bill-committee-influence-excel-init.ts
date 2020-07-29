// @ts-ignore
import consoleGrid from 'console-grid';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import { csv2Array } from './util/csv2array';
import dbInit from '../db-connect';
import {
  getUSCommittee,
  getUSBill,
  committeeTotalNum,
  committeePolicyAreaTotalNum,
  committeeLegislativeSubjectsTotalNum,
  committeeBecameLawRate,
  committeeRecognizedRate,
  socialInflu,
  committeeInfluTime,
  identityScore,
  committeeRelativeTime,
} from './util/influence';
import { data2One } from './util/2one';

dbInit();

// 主函数
(async () => {
  const csvBuffer = fs.readFileSync(
    path.resolve(__dirname, '../csv/提出者.csv')
  );
  const personSocialInfluArr = csv2Array(csvBuffer);

  const [USCommitteeOrganization, USBill] = await Promise.all([
    getUSCommittee(),
    getUSBill(),
  ]);

  const res = [];
  for (let organization of USCommitteeOrganization) {
    if (organization?.uuid && organization.name) {
      res.push({
        name: organization.name,
        M01: committeeTotalNum(organization.uuid, USBill),
        R01: committeePolicyAreaTotalNum(organization.uuid, USBill),
        R02: 4,
        R03: committeeLegislativeSubjectsTotalNum(organization.uuid, USBill),
        // D01: socialInflu(person.name, personSocialInfluArr),
        // D02: await identityScore(person.uuid, USBill),
        D03: committeeBecameLawRate(organization.uuid, USBill),
        D04: committeeRecognizedRate(organization.uuid, USBill),
        T01: committeeInfluTime(organization.uuid, USBill),
        T02: committeeRelativeTime(organization.uuid, USBill),
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

  XLSX.writeFile(
    wb,
    path.resolve(__dirname, '../../dist-excel/committeeInfluence.xlsx')
  );
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
