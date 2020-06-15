import Sequelize from 'sequelize';
import { read, readFile, utils, writeFile } from 'xlsx';
import fs from 'fs';
import path from 'path';

import Bill from '../models/bill';
import committeeCsvInit from '../script/committee-csv-init';
import Cosponsor from '../models/cosponsor';
import Person from '../models/person';

const Op = Sequelize.Op;

/* make worksheet */

export default {
  // 生成committee两者关系csv文件
  committeeCsvInit: () => committeeCsvInit(),
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
};
