import dbInit from '../db-connect';
import Bill from '../models/bill';
import Action from '../models/action';
import Excel from './util/excel-helper';
import path from 'path';

dbInit();

class ActionBill extends Bill {
  actions: Action[] = [];

  isStart = false;
  isEvolution = false;
  isCompeleted = false;

  constructor(bill: Bill) {
    super(bill);

    if (bill.actions) {
      this.actions = bill.actions;

      this.isStart = this.isStartBill();
      this.isEvolution = this.isEvolutionBill();
      this.isCompeleted = this.isCompeletedBill();
    }
  }

  isStartBill(): boolean {
    return this.actions.some(action => {
      return action.value === '0.1';
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

class OneCategorizeBills {
  bills: ActionBill[] = [];

  categorizeCount: {
    name: string;
    startNum: number;
    evolutionNum: number;
    compeletNum: number;
  }[] = [];

  constructor(bills: ActionBill[]) {
    bills.forEach(bill => {
      if (bill?.categorize) {
        let foundCount = this.categorizeCount.find(categorize => {
          return categorize.name === bill.categorize;
        });

        if (foundCount) {
          // 已经有categorize
          if (bill?.isStart) foundCount.startNum++;
          if (bill?.isEvolution) foundCount.evolutionNum++;
          if (bill?.isCompeleted) foundCount.compeletNum++;
        } else {
          // 新的categorize
          if (bill.categorize)
            this.categorizeCount.push({
              name: bill.categorize,
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
    attributes: ['number', 'congress', 'categorize'],
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
  excel.setTitle(['分类', '发生阶段', '发展阶段', '成熟阶段']);

  let oneCategorizeBills = new OneCategorizeBills(actionBillArr);

  for (let res of oneCategorizeBills.categorizeCount) {
    excel.addData([res.name, res.startNum, res.evolutionNum, res.compeletNum]);
  }

  excel.renderExcel(path.resolve(__dirname, '../../dist-excel/search-CA.xlsx'));
})();
