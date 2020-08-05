import path from 'path';
import XLSX from 'xlsx';
import moment from 'moment';

import dbInit from '../db-connect';
import Action from '../models/action';
import Bill from '../models/bill';
import Country from '../models/country';

dbInit();

(async () => {
  let res: any[] = [];

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

  let yearArr: any[] = [];

  for (let year = 2010; year <= 2019; year++) {
    yearArr.push({
      year: year,
      '0.1': 0,
      '0.3': 0,
      '0.5': 0,
      '0.8': 0,
      '1': 0,
    });
  }

  billArr.forEach(bill => {
    bill.actions?.forEach(action => {
      yearArr.forEach((year, yearIndex) => {
        if (year.year === moment(action.actionDate).year()) {
          for (let key in year) {
            if (key === action.value) {
              yearArr[yearIndex][key]++;
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
    ['年份', '0.1', '0.3', '0.5', '0.8', '1'],
    ...yearArr.map(item => [
      item.year,
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
    path.resolve(__dirname, '../../dist-excel/action-value.xlsx')
  );
})();
