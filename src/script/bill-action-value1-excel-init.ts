import path from 'path';
import XLSX from 'xlsx';
import moment from 'moment';

import dbInit from '../db-connect';
import Action from '../models/action';
import Bill from '../models/bill';
import Country from '../models/country';
import Person from '../models/person';
import Cosponsor from '../models/cosponsor';

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
      {
        model: Person,
      },
      {
        model: Cosponsor,
        include: [
          {
            model: Person,
          },
        ],
      },
    ],
  });

  billArr.forEach(bill => {
    bill.actions?.forEach(action => {
      if (action.value === '1') {
        res.push({
          number: bill.number,
          congress: bill.congress,
          year: moment(action.actionDate).year(),
          country: '美国',
          sponsor: bill.sponsor?.name,
          cosSponsor: bill.cosponsors
            ?.map(cos => cos.cosponsor?.name)
            .join(','),
        });
      }
    });
  });

  let wb = XLSX.utils.book_new();

  let ws_name = 'SheetJS';

  /* make worksheet */
  let ws_data = [
    ['年份', '国家', '法案号', '国会届数', '提出者', '管理者'],
    ...res.map(item => [
      item.year,
      item.country,
      item.number,
      item.congress,
      item.sponsor,
      item.cosSponsor,
    ]),
  ];
  let ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(
    wb,
    path.resolve(__dirname, '../../dist-excel/action-value1.xlsx')
  );
})();
