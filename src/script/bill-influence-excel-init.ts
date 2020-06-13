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
} from './util/influence';

dbInit();
(async () => {
  const allBill = await Bill.findAll({
    attributes: ['uuid', 'number', 'congress'],
  });

  const res = [];
  while (allBill.length) {
    const bill = allBill.pop();
    const billUuid = bill?.uuid;

    const totalBill = await getBeforeTotalBill(billUuid);

    if (totalBill && totalBill.length) {
      // const sponsorTimes = await getSponsorTimes(totalBill, billUuid);
      // const cosponsorTimes = await getCosponsorTimes(totalBill, billUuid);
      // const policyAreaTimes = await getPolicyAreaTimes(totalBill, billUuid);
      // const countryPoliticalOrganizationNums = await getCountryPoliticalOrganizationNums(
      //   billUuid
      // );
      // const legislativeSubjectTimes = await getLegislativeSubjectTimes(
      //   totalBill,
      //   billUuid
      // );

      const socialNums = await getSocialNums(totalBill, billUuid);

      console.log(`${bill?.number} ${bill?.congress} ${socialNums}`);
      res.push({
        number: bill?.number,
        congress: bill?.congress,
        // sponsorTimes,
        // cosponsorTimes,
        // policyAreaTimes,
        // countryPoliticalOrganizationNums,
        // legislativeSubjectTimes,
        socialNums,
      });
    }
  }
  console.table(res);
})();
