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

  billArr.forEach(bill => {
    bill.actions?.forEach(action => {
      res.push({
        number: bill.number,
        congress: bill.congress,
        year: moment(action.actionDate).year(),
        status: action.actionStatus,
        value: action.value,
        policyArea: bill.policyArea,
      });
    });
  });

  let wb = XLSX.utils.book_new();

  let ws_name = 'SheetJS';

  /* make worksheet */
  let ws_data = [
    ['领域', '年份', '法案number', '法案congress', 'action状态', 'action值'],
    ...res.map(item => [
      item.policyArea,
      item.year,
      item.number,
      item.congress,
      item.status,
      item.value,
    ]),
  ];
  let ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(
    wb,
    path.resolve(__dirname, '../../dist-excel/poliy-action.xlsx')
  );
})();
