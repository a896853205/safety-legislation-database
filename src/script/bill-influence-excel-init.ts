import Bill from '../models/bill';

import {
  getBeforeTotalBill,
  getSponsorTimes,
  getCosponsorTimes,
} from './util/influence';

(async () => {
  const allBill = await Bill.findAll({
    attributes: ['uuid'],
  });
  while (allBill.length) {
    let billUuid = allBill.pop()?.uuid;

    const totalBill = await getBeforeTotalBill(billUuid);

    if (totalBill && totalBill.length) {
      const sponsorTimes = getSponsorTimes(totalBill, billUuid);
      // const cosponsorTimes = getCosponsorTimes(billUuid, totalBill);
    }
  }
})();
