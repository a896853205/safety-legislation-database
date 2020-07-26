import assert from 'assert';
import { isArray } from 'util';

import { getBeforeTotalBill, getSponsorTimes } from '../feature';

describe('influence', () => {
  it('getBeforeTotalBill', done => {
    (async () => {
      let totalBill = await getBeforeTotalBill(
        'bc0dcca0-aacd-11ea-8566-1b5a5b9480b1'
      );
      assert(isArray(totalBill));
      done();
    })();
  });

  it('getSponsorTimes', done => {
    (async () => {
      const billUuid = 'bc0dcca0-aacd-11ea-8566-1b5a5b9480b1';
      let totalBill = await getBeforeTotalBill(billUuid);

      if (totalBill && totalBill.length) {
        const sponsorTimes = await getSponsorTimes(totalBill, billUuid);
        assert(Number(sponsorTimes) >= 0);
        done();
      } else {
        console.log('此法案没数据');
        done();
      }
    })();
  });
});
