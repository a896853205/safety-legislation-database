import path from 'path';
import XLSX from 'xlsx';

import Bill from '../models/bill';
import Cosponsor from '../models/cosponsor';
import dbInit from '../db-connect';
import Person from '../models/person';

// data
import param from '../json/social-influence-param.json';
import socialInfluence from '../json/social-influnce.json';

interface SocialInfluenceItem {
  'Infulence Score': number;
  name: string;
}

class SocialInfluence {
  congress: number = 0;
  data: SocialInfluenceItem[] = [];

  constructor(congress: number, data: SocialInfluenceItem[]) {
    this.congress = congress;
    this.data = data;
  }

  getSenatorInfluence(name: string) {
    for (let item of this.data) {
      if (name === item.name) {
        return item['Infulence Score'];
      }
    }

    return -1;
  }
}

class SenatorBill extends Bill {
  senator: Person[] = [];

  constructor(bill: Bill) {
    super(bill);

    if (bill?.sponsor) this.senator.push(bill.sponsor);

    if (bill.cosponsors) {
      bill.cosponsors.forEach(cos => {
        if (cos.cosponsor) this.senator.push(cos.cosponsor);
      });
    }
  }
  isHasSenator({ name }: { name: string }): boolean {
    return this.senator.findIndex(item => item.name === name) !== -1;
  }

  getBillInfluence(socialInfluence?: SocialInfluence) {
    if (!socialInfluence) return 0;
    if (!this.senator.length) return 0;

    let total = 0;
    this.senator.forEach(senator => {
      if (senator?.name) {
        let influ = socialInfluence.getSenatorInfluence(senator.name);

        if (influ !== -1) {
          total += influ;
        }
      }
    });

    return total / this.senator.length;
  }
}

class RelativeBillInfluence {
  number?: string;
  congress?: number;
  influence?: number;
  status?: string;

  constructor(
    number?: string,
    congress?: number,
    influence?: number,
    status?: string
  ) {
    this.number = number;
    this.congress = congress;
    this.influence = influence;
    this.status = status;
  }
}

class SenatorInfluence {
  name = '';
  relativeBillInfluence: RelativeBillInfluence[] = [];
  averageInfluence: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  addRelativeBillInfluence(
    number?: string,
    congress?: number,
    influence?: number,
    status?: string
  ) {
    // TODO: 这里其实应该先判断是否拥有再push
    this.relativeBillInfluence.push(
      new RelativeBillInfluence(number, congress, influence, status)
    );

    let total = 0;
    this.relativeBillInfluence.forEach(item => {
      if (item?.influence) total += item.influence;
    });

    this.averageInfluence = total / this.relativeBillInfluence.length;
  }
}

class Res {
  title: string[] = [
    '新议员',
    '相关法案议员影响力',
    '法案进程',
    '相关议员平均影响力指数',
  ];
  sheetName: string = '';
  resData: (string | number | undefined)[][] = [];

  setSheetName(sheetName: string) {
    this.sheetName = sheetName;
  }

  addSenatorInfluence(senatorInfluence: SenatorInfluence) {
    senatorInfluence.relativeBillInfluence.forEach(
      (relativeBillInfluence, index) => {
        if (!index)
          this.resData.push([
            senatorInfluence.name,
            relativeBillInfluence.influence,
            relativeBillInfluence.status,
            senatorInfluence.averageInfluence,
          ]);
        else
          this.resData.push([
            '',
            relativeBillInfluence.influence,
            relativeBillInfluence.status,
            '',
          ]);
      }
    );
  }
  renderExcel() {}
}

class ManySheetRes {
  res: Res[] = [];

  addRes(newRes: Res) {
    this.res.push(newRes);
  }

  renderExcel(url: string) {
    let wb = XLSX.utils.book_new();

    this.res.forEach(_res => {
      let wsName = _res.sheetName;

      /* make worksheet */
      let wsData = [_res.title, ..._res.resData];
      let ws = XLSX.utils.aoa_to_sheet(wsData);

      /* Add the worksheet to the workbook */
      XLSX.utils.book_append_sheet(wb, ws, wsName);
    });

    XLSX.writeFile(wb, url);
  }
}
/**
 * 读取基本数据
 */
const readData = () => {
  let socialInfluenceData: SocialInfluence[] = socialInfluence.map(
    socialInfluenceItem => {
      return new SocialInfluence(
        socialInfluenceItem.congress,
        socialInfluenceItem.data
      );
    }
  );

  return {
    socialInfluenceData,
    param,
  };
};

/**
 * 读取数据库数据并包裹
 * @param congress 国会届数
 */
const readSenatorBill = async (congress: number): Promise<SenatorBill[]> => {
  let foundBill = await Bill.findAll({
    attributes: ['number', 'congress', 'status'],
    include: [
      {
        model: Person,
        attributes: ['name'],
      },
      {
        model: Cosponsor,
        include: [
          {
            model: Person,
            attributes: ['name'],
          },
        ],
      },
    ],
    where: {
      congress,
    },
  });

  return foundBill.map(bill => new SenatorBill(bill.get() as Bill));
};

dbInit();

(async () => {
  const { socialInfluenceData, param } = readData();
  let manySheetRes = new ManySheetRes();

  while (param.length) {
    let paramItem = param.pop();

    if (paramItem) {
      let res = new Res();
      res.setSheetName(`${paramItem.congress}`);

      let curSocialInfluence = socialInfluenceData.find(item => {
        return item.congress === paramItem?.congress;
      });

      let curCongressBill = await readSenatorBill(paramItem.congress);

      // 遍历每个人名
      paramItem.name.forEach(name => {
        let senatorInfluence = new SenatorInfluence(name);

        // 添加相关法案影响力
        curCongressBill.forEach(bill => {
          if (bill.isHasSenator({ name })) {
            let influence = bill.getBillInfluence(curSocialInfluence);

            if (influence) {
              senatorInfluence.addRelativeBillInfluence(
                bill?.number,
                bill.congress,
                influence,
                bill.status
              );
            }
          }
        });

        res.addSenatorInfluence(senatorInfluence);
      });

      manySheetRes.addRes(res);
    }
  }

  manySheetRes.renderExcel(
    path.resolve(__dirname, '../../dist-excel/new-senator-influence.xlsx')
  );
})();
