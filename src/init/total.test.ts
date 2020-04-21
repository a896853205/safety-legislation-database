import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';

const buf: Buffer = fs.readFileSync(
  path.resolve(__dirname, '../excel/total.xlsx')
);
const wb: WorkBook = read(buf);
const dataArray: object[] = utils.sheet_to_json(wb.Sheets['合表']);

console.log(dataArray);