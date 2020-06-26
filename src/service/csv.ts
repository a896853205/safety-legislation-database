import Sequelize from 'sequelize';
import { readFile, utils, writeFile } from 'xlsx';
import fs from 'fs';
import path from 'path';

import Bill from '../models/bill';
import Committee from '../models/committee';
import Cosponsor from '../models/cosponsor';
import Organization from '../models/organization';
import Person from '../models/person';

// import committeeCsvInit from '../script/committee-csv-init';

const Op = Sequelize.Op;

export default {
  // 生成committee两者关系csv文件
  committeeCsvInit: async () => {
    const ws_data: (string | undefined)[][] = [['committee']];
    const filePath = path.resolve(__dirname, `../../dist-csv/committee.csv`);

    try {
      // 先删除
      fs.unlinkSync(filePath);
    } catch (error) {
      console.log('没有文件,不用删除');
    }

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

    let committeeSet = new Set<string>();

    for (let bill of billArr) {
      if (bill.committees) {
        for (let i = 0; i < bill.committees.length; i++) {
          let com = bill.committees[i].organization?.name;
          if (com) {
            committeeSet.add(com);
          }
        }
      }
    }

    committeeSet.forEach(com => {
      ws_data.push([com]);
    });

    let wb;
    try {
      wb = readFile(filePath);
    } catch (error) {
      wb = utils.book_new();
    }

    const ws = utils.aoa_to_sheet(ws_data);
    utils.book_append_sheet(wb, ws, '1');

    await writeFile(wb, filePath);
  },
  personCsvInit: async () => {
    const ws_data: (string | undefined)[][] = [['personName']];
    const filePath = path.resolve(__dirname, `../../dist-csv/person.csv`);

    try {
      // 先删除
      fs.unlinkSync(filePath);
    } catch (error) {
      console.log('没有文件,不用删除');
    }

    const billArr = await Bill.findAll({
      attributes: ['uuid'],
      include: [
        {
          model: Cosponsor,
          attributes: ['uuid'],
          include: [
            {
              model: Person,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: Person,
          attributes: ['uuid', 'name'],
        },
      ],
    });

    billArr.forEach(bill => {
      if (bill.sponsor?.name) {
        ws_data.push([bill.sponsor?.name]);
      }

      bill.cosponsors?.forEach(cos => {
        if (cos.cosponsor?.name) {
          ws_data.push([cos.cosponsor?.name]);
        }
      });
    });

    let wb;
    try {
      wb = readFile(filePath);
    } catch (error) {
      wb = utils.book_new();
    }

    const ws = utils.aoa_to_sheet(ws_data);
    utils.book_append_sheet(wb, ws, '1');

    await writeFile(wb, filePath);
  },

  personRelationshipCsvInit: async (billUuid: string) => {
    const ws_PR_data: (string | undefined)[][] = [['sponsor', 'cosponsor']];

    const filePath = path.resolve(
      __dirname,
      '../../dist-csv/person-relationship.csv'
    );

    try {
      // 先删除
      fs.unlinkSync(filePath);
    } catch (error) {
      console.log('没有文件,不用删除');
    }

    const bill = await Bill.findOne({
      where: {
        uuid: billUuid,
      },
      attributes: ['congress'],
    });

    const billArr = await Bill.findAll({
      attributes: ['uuid'],
      where: {
        congress: {
          [Op.lt]: bill?.congress,
        },
      },
      include: [
        {
          model: Cosponsor,
          attributes: ['uuid'],
          include: [
            {
              model: Person,
              attributes: ['uuid', 'name'],
            },
          ],
        },
        {
          model: Person,
          attributes: ['uuid', 'name'],
        },
      ],
    });

    billArr.forEach(bill => {
      bill.cosponsors?.forEach(cos => {
        ws_PR_data.push([bill.sponsor?.name, cos.cosponsor?.name]);
      });
    });

    let wb;
    try {
      wb = readFile(filePath);
    } catch (error) {
      wb = utils.book_new();
    }

    const ws = utils.aoa_to_sheet(ws_PR_data);
    utils.book_append_sheet(wb, ws, '1');

    await writeFile(wb, filePath);
  },

  committeeRelationshipCsvInit: async (billUuid: string) => {
    const ws_data: (string | undefined)[][] = [['committee1', 'committee2']];

    const filePath = path.resolve(
      __dirname,
      '../../dist-csv/committee-relationship.csv'
    );

    try {
      // 先删除
      fs.unlinkSync(filePath);
    } catch (error) {
      console.log('没有文件,不用删除');
    }

    const bill = await Bill.findOne({
      where: {
        uuid: billUuid,
      },
      attributes: ['congress'],
    });

    const billArr = await Bill.findAll({
      attributes: [],
      where: {
        congress: {
          [Op.lt]: bill?.congress,
        },
      },
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

    let wb;
    try {
      wb = readFile(filePath);
    } catch (error) {
      wb = utils.book_new();
    }

    const ws = utils.aoa_to_sheet(ws_data);
    utils.book_append_sheet(wb, ws, '1');

    await writeFile(wb, filePath);
  },
};
