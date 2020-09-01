import path from 'path';

import Bill from '../models/bill';
import Action from '../models/action';
import Excel from './util/excel-helper';
import dbInit from '../db-connect';

dbInit();
const COUNT_YEAR = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];

class ActionBill extends Bill {
  actions: Action[] = [];
  actionStartYear = 0;

  isStart = false;
  isEvolution = false;
  isCompeleted = false;

  constructor(bill: Bill) {
    super(bill);

    if (bill.actions) {
      this.actions = bill.actions;
      this.actionStartYear =
        bill.actions
          .find(action => {
            return action.value === '0.1';
          })
          ?.actionDate?.getFullYear() || 0;

      this.isStart = this.isStartBill();
      this.isEvolution = this.isEvolutionBill();
      this.isCompeleted = this.isCompeletedBill();
    }
  }

  isStartBill(): boolean {
    return this.actions.some(action => {
      return (
        action.value === '0.1' &&
        action.actionDate?.getFullYear() === this.actionStartYear
      );
    });
  }

  isEvolutionBill(): boolean {
    if (!this.isStart) return false;

    const evolutionValues = ['0.3', '0.5', '0.8', '1'];
    return this.actions.some(action => {
      return evolutionValues.some(evolutionValue => {
        return evolutionValue === action.value;
      });
    });
  }

  isCompeletedBill(): boolean {
    if (!this.isEvolution) return false;

    return this.actions.some(action => {
      return action.value === '1';
    });
  }
}

class OneYearBills {
  bills: ActionBill[] = [];
  policyAreaCount: {
    name: string;
    startNum: number;
    evolutionNum: number;
    compeletNum: number;
  }[] = [];

  constructor(bills: ActionBill[], year: number) {
    let curYearBills = bills.map(bill => {
      if (bill.actionStartYear === year) {
        return bill;
      }
    });

    curYearBills.forEach(bill => {
      if (bill?.policyArea) {
        let foundCount = this.policyAreaCount.find(policyArea => {
          return policyArea.name === bill.policyArea;
        });

        if (foundCount) {
          // 已经有policyArea
          if (bill?.isStart) foundCount.startNum++;
          if (bill?.isEvolution) foundCount.evolutionNum++;
          if (bill?.isCompeleted) foundCount.compeletNum++;
        } else {
          // 新的policyArea
          this.policyAreaCount.push({
            name: bill.policyArea,
            startNum: bill.isStart ? 1 : 0,
            evolutionNum: bill.isEvolution ? 1 : 0,
            compeletNum: bill.isCompeleted ? 1 : 0,
          });
        }
      }
    });
  }
}

const searchBill = async () => {
  let allBill = await Bill.findAll({
    attributes: ['number', 'congress', 'policyArea'],
    include: [
      {
        model: Action,
      },
    ],
  });

  return allBill.map(bill => new ActionBill(bill.get() as Bill));
};

(async () => {
  let actionBillArr = await searchBill();
  let excel = new Excel();
  excel.setTitle(['年份', '政策领域', '发生阶段', '发展阶段', '成熟阶段']);

  for (let year of COUNT_YEAR) {
    let oneYearBills = new OneYearBills(actionBillArr, year);

    for (let res of oneYearBills.policyAreaCount) {
      excel.addData([
        year,
        res.name,
        res.startNum,
        res.evolutionNum,
        res.compeletNum,
      ]);
    }
  }

  excel.renderExcel(
    path.resolve(__dirname, '../../dist-excel/search-action.xlsx')
  );
})();
