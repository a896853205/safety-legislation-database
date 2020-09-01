import path from 'path';

import Bill from '../models/bill';
import dbInit from '../db-connect';
import Excel from './util/excel-helper';
import searchLPData from '../json/search-LP.json';
import LegislativeSubject from '../models/legislative-subject';

dbInit();

(async () => {
  let excel = new Excel();
  excel.setTitle(['法案号', '国会阶数', '立法主体', '政策领域']);

  for (let bill of searchLPData) {
    let foundBill = await Bill.findOne({
      attributes: ['number', 'congress', 'policyArea'],
      include: [
        {
          model: LegislativeSubject,
          attributes: ['subject'],
        },
      ],
      where: { number: bill.number, congress: bill.congress },
    });

    excel.addData([
      bill.number,
      bill.congress,
      foundBill?.legislativeSubjects?.map(LS => LS.subject)?.join(','),
      foundBill?.policyArea,
    ]);
  }

  excel.renderExcel(path.resolve(__dirname, '../../dist-excel/search-LP.xlsx'));
})();
