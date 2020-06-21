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
  getBecameLawRate,
  getRecognitionNums,
  getStateRate,
  getPersonPartyRate,
  getCommitteesTimes,
} from './util/influence';
import { initNeo4j } from '../neo4j';

const _needTotalBillInfluence = async (billUuid: string) => {
  const totalBill = await getBeforeTotalBill(billUuid);

  let func = [
    getSponsorTimes,
    getCosponsorTimes,
    getPolicyAreaTimes,
    getLegislativeSubjectTimes,
    getSocialNums,
    getBecameLawRate,
    getRecognitionNums,
    getCommitteesTimes,
  ];

  if (totalBill && totalBill.length) {
    return await Promise.all(func.map(func => func(totalBill, billUuid)));
  } else {
    return new Array(func.length).fill('0.00');
  }
};

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

    if (billUuid) {
      const [
        [
          sponsorTimes,
          cosponsorTimes,
          policyAreaTimes,
          legislativeSubjectTimes,
          socialNums,
          becameLawRate,
          recognitionNums,
          committeesTimes,
        ],
        countryPoliticalOrganizationNums,
        identityNums,
        stateRate,
        partyRate,
      ] = await Promise.all([
        _needTotalBillInfluence(billUuid),
        getCountryPoliticalOrganizationNums(billUuid),
        getIdentityNums(billUuid),
        getStateRate(billUuid),
        getPersonPartyRate(billUuid),
      ]);

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
        becameLawRate,
        recognitionNums,
        stateRate,
        partyRate,
        committeesTimes,
      });
    }
  }

  spinner.text = '开始生成json文件';

  fs.writeFileSync(
    path.resolve(__dirname, '../../dist-json/influence.json'),
    JSON.stringify(res, null, 2)
  );

  spinner.succeed('influence.json文件生成成功');
  console.table(res, ['number', 'congress', 'partyRate']);
})();
