import fs from 'fs';
import ora from 'ora';
import path from 'path';

import Bill from '../models/bill';
import dbInit from '../db-connect';
import {
  getBeforeTotalBill,
  getSponsorTimes,
  getCosponsorTimes,
  getPolicyAreaTimes,
  getCountryPoliticalOrganizationNums,
  getLegislativeSubjectTimes,
  getSocialNums,
  getIdentityNums,
} from './util/influence';
import { initNeo4j } from '../neo4j';

const spinner = ora('influence start').start();

dbInit();
(async () => {
  await initNeo4j();
  const allBill = await Bill.findAll({
    attributes: ['uuid', 'number', 'congress'],
  });

  const totalLen = allBill.length;

  const res = [];
  while (allBill.length) {
    spinner.text = `${((1 - allBill.length / totalLen) * 100).toFixed(0)}%`;

    const bill = allBill.pop();
    const billUuid = bill?.uuid;

    const totalBill = await getBeforeTotalBill(billUuid);

    if (totalBill && totalBill.length) {
      const sponsorTimes = await getSponsorTimes(totalBill, billUuid);
      const cosponsorTimes = await getCosponsorTimes(totalBill, billUuid);
      const policyAreaTimes = await getPolicyAreaTimes(totalBill, billUuid);
      const countryPoliticalOrganizationNums = await getCountryPoliticalOrganizationNums(
        billUuid
      );
      const legislativeSubjectTimes = await getLegislativeSubjectTimes(
        totalBill,
        billUuid
      );
      const socialNums = await getSocialNums(totalBill, billUuid);
      const identityNums = await getIdentityNums(billUuid);

      res.push({
        number: bill?.number,
        congress: bill?.congress,
        sponsorTimes,
        cosponsorTimes,
        policyAreaTimes,
        countryPoliticalOrganizationNums,
        legislativeSubjectTimes,
        socialNums,
        identityNums,
      });
    }
  }

  spinner.text = '开始生成json文件';

  fs.writeFileSync(
    path.resolve(__dirname, '../../dist-json/influence.json'),
    JSON.stringify(res, null, 2)
  );

  spinner.succeed('influence.json文件生成成功');
  // console.table(res);
})();
