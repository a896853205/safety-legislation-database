import path from 'path';
import XLSX from 'xlsx';
import moment from 'moment';

import dbInit from '../db-connect';
import Action from '../models/action';
import Bill from '../models/bill';
import Country from '../models/country';

dbInit();

(async () => {
  const billArr = await Bill.findAll({
    include: [
      {
        model: Country,
        where: {
          name: '美国',
        },
      },
      {
        model: Action,
      },
    ],
  });

  let policyAreaSet = new Set();

  let policyAreaArr: any[] = [];

  billArr.forEach(bill => {
    policyAreaSet.add(bill.policyArea);
  });

  for (let year = 2010; year <= 2019; year++) {
    policyAreaSet.forEach(policyArea => {
      if (policyArea) {
        policyAreaArr.push({
          year,
          policyArea,
          '0.1': 0,
          '0.3': 0,
          '0.5': 0,
          '0.8': 0,
          '1': 0,
        });
      }
    });
  }

  billArr.forEach(bill => {
    bill.actions?.forEach(action => {
      policyAreaArr.forEach((policyArea, policyAreaIndex) => {
        if (policyArea.policyArea === bill.policyArea) {
          for (let key in policyArea) {
            if (
              key === action.value &&
              moment(action.actionDate).year() === policyArea.year
            ) {
              policyAreaArr[policyAreaIndex][key]++;
            }
          }
        }
      });
    });
  });

  let wb = XLSX.utils.book_new();

  let ws_name = 'SheetJS';

  /* make worksheet */
  let ws_data = [
    ['年份', '政策领域', '0.1', '0.3', '0.5', '0.8', '1'],
    ...policyAreaArr.map(item => [
      item.year,
      item.policyArea,
      item['0.1'],
      item['0.3'],
      item['0.5'],
      item['0.8'],
      item['1'],
    ]),
  ];
  let ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(
    wb,
    path.resolve(__dirname, '../../dist-excel/policy-value.xlsx')
  );
})();
