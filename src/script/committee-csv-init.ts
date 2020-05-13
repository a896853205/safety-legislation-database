import { read, WorkBook, utils, stream } from 'xlsx';
import fs from 'fs';
import path from 'path';
import dbInit from '../db-connect';

import Bill from '../models/bill';
import Committee from '../models/committee';
import Organization from '../models/organization';

/* make worksheet */
const ws_data: (string | undefined)[][] = [['committee1', 'committee2']];
dbInit();

export default async () => {
  const billArr = await Bill.findAll({
    attributes: [],
    include: [
      {
        model: Committee,
        include: [
          {
            model: Organization,
          },
        ],
      },
    ],
  });

  for (let bill of billArr) {
    if (bill.committees) {
      for (let i = 0; i < bill.committees.length; i++) {
        for (let j = i + 1; j < bill.committees.length; j++) {
          ws_data.push([
            bill.committees[i].organization?.name,
            bill.committees[j].organization?.name,
          ]);
        }
      }
    }
  }

  const ws = utils.aoa_to_sheet(ws_data);
  const wbStream = stream.to_csv(ws);
  wbStream.pipe(
    fs.createWriteStream(
      path.resolve(__dirname, '../../dist-csv/committee.csv')
    )
  );
};
