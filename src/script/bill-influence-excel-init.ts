// @ts-ignore
import consoleGrid from 'console-grid';

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
} from './util/influence';

dbInit();

// 主函数
(async () => {
  const [USPerson, USBill] = await Promise.all([getUSPerson(), getUSBill()]);

  const res = [];
  for (let person of USPerson) {
    if (person?.uuid) {
      res.push({
        name: person.name,
        M01: sponsorTotalNum(person?.uuid, USBill),
        M02: cosponsorTotalNum(person?.uuid, USBill),
        R01: policyAreaTotalNum(person?.uuid, USBill),
        R02: 4,
        R03: legislativeSubjectsTotalNum(person?.uuid, USBill),
        D03: becameLawRate(person?.uuid, USBill),
        D04: recognizedRate(person?.uuid, USBill),
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
