import path from 'path';
import XLSX from 'xlsx';

import dbInit from '../db-connect';
import Bill from '../models/bill';
import searchJson from '../json/search.json';

dbInit();

(async () => {
  let allBill = await Bill.findAll({
    attributes: [
      'dateSponsored',
      'categorize',
      'policyArea',
      'number',
      'congress',
    ],
  });

  let res: {
    number: string;
    congress: number;
    yearSponsored: number;
    policyArea: string;
    categorize: string;
  }[] = [];

  searchJson.forEach(item => {
    let foundBill = allBill.find(bill => {
      return bill.number === item.number && bill.congress === item.congress;
    });

    if (foundBill) {
      res.push({
        number: foundBill.number ? foundBill.number : '',
        congress: foundBill.congress ? foundBill.congress : 0,
        yearSponsored: foundBill.dateSponsored
          ? foundBill.dateSponsored.getFullYear()
          : 0,
        policyArea: foundBill.policyArea ? foundBill.policyArea : '',
        categorize: foundBill.categorize ? foundBill.categorize : '',
      });
    }
  });

  let wb = XLSX.utils.book_new();

  let ws_name = 'SheetJS';

  /* make worksheet */
  let ws_data = [
    ...res.map(item => [
      item.number,
      item.congress,
      item.yearSponsored,
      item.policyArea,
      item.categorize,
    ]),
  ];
  let ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(
    wb,
    path.resolve(__dirname, '../../dist-excel/bill-search.xlsx')
  );
})();
