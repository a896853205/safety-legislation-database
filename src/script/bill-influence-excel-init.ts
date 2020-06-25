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
  getCommitteesPATimes,
  getCommitteesPOTimes,
  getCommitteesLSTimes,
  getCommitteesBLRate,
} from './util/influence';
import { initNeo4j, driver } from '../neo4j';

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
    getCommitteesPATimes,
    getCommitteesPOTimes,
    getCommitteesLSTimes,
    getCommitteesBLRate,
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
    attributes: ['uuid', 'number', 'congress', 'status'],
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
          committeesPATimes,
          committeesPOTimes,
          committeesLSTimes,
          committeesBLRate,
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
        status: bill?.status,
        '1': sponsorTimes,
        '2': cosponsorTimes,
        '3': policyAreaTimes,
        '4': countryPoliticalOrganizationNums,
        '5': legislativeSubjectTimes,
        '6': socialNums,
        '7': identityNums,
        '8': becameLawRate,
        '9': recognitionNums,
        '12': stateRate,
        '13': partyRate,
        '15': committeesTimes,
        '17': committeesPATimes,
        '18': committeesPOTimes,
        '19': committeesLSTimes,
        '21': committeesBLRate,
      });
    }
  }

  spinner.text = '开始生成json文件';

  fs.writeFileSync(
    path.resolve(__dirname, '../../dist-json/influence.json'),
    JSON.stringify(res, null, 2)
  );

  spinner.succeed('influence.json文件生成成功');
  driver.close();
  // console.table(res, ['number', 'congress', 'partyRate']);
})();
