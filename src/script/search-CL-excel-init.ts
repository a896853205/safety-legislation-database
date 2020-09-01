import path from 'path';

import Bill from '../models/bill';
import dbInit from '../db-connect';
import LegislativeSubject from '../models/legislative-subject';
import Excel from './util/excel-helper';

dbInit();

class Categorizes {
  categorizes: CategorizeLegislative[] = [];

  addCategorize(bill: Bill) {
    if (bill.categorize) {
      let foundCL = this.categorizes.find(CL => {
        return CL.name === bill.categorize;
      });
      if (foundCL) {
        foundCL.addBill(bill);
      } else {
        let CL = new CategorizeLegislative(bill.categorize);
        CL.addBill(bill);
        this.categorizes.push(CL);
      }
    }
  }
}
class CategorizeLegislative {
  name = '';
  billNum = 0;
  subjects: { name: string; count: number }[] = [];

  constructor(categorizeName: string) {
    this.name = categorizeName;
  }
  addBill(bill: Bill) {
    this.billNum++;
    bill.legislativeSubjects?.forEach(billSubject => {
      let foundSubject = this.subjects.find(subject => {
        return subject.name === billSubject.subject;
      });

      if (foundSubject) {
        foundSubject.count++;
      } else {
        if (billSubject.subject) {
          this.subjects.push({
            name: billSubject.subject,
            count: 1,
          });
        }
      }
    });
  }
  getNounSubject(noun: number) {
    if (!this.subjects.length || noun > this.subjects.length) return null;

    this.subjects.sort((a, b) => b.count - a.count);

    return this.subjects[noun - 1];
  }
}

const searchBill = async () => {
  let allBill = await Bill.findAll({
    attributes: ['number', 'congress', 'categorize'],
    include: [
      {
        model: LegislativeSubject,
        attributes: ['subject'],
      },
    ],
  });

  return allBill;
};

(async () => {
  let excel = new Excel();
  excel.setTitle([
    '分类',
    '法案总量',
    '第一主题',
    '第一主题数量',
    '第二主题',
    '第二主题数量',
    '第三主题',
    '第三主题数量',
  ]);
  let res = new Categorizes();

  let allBill = await searchBill();

  for (let bill of allBill) {
    res.addCategorize(bill);
  }

  res.categorizes.forEach(CL => {
    let first = CL.getNounSubject(1);
    let second = CL.getNounSubject(2);
    let third = CL.getNounSubject(3);

    excel.addData([
      CL.name,
      CL.billNum,
      first ? first.name : '',
      first ? first.count : '',
      second ? second.name : '',
      second ? second.count : '',
      third ? third.name : '',
      third ? third.count : '',
    ]);
  });

  excel.renderExcel(path.resolve(__dirname, '../../dist-excel/search-CL.xlsx'));
})();
