import Sequelize from 'sequelize';

import Bill from '../../models/bill';
import Cosponsor from '../../models/cosponsor';

const Op = Sequelize.Op;

// 获取当前法案国会届数之前的法案集合
const getBeforeTotalBill = async (billUuid?: string) => {
  if (billUuid) {
    const bill = await Bill.findOne({
      where: {
        uuid: billUuid,
      },
      attributes: ['congress'],
    });

    return await Bill.findAll({
      where: {
        congress: {
          [Op.lt]: bill?.congress,
        },
      },
      include: [
        {
          model: Cosponsor,
          attributes: ['uuid'],
        },
      ],
    });
  }
};

// 人作为法案的主要提出者的次数
const getSponsorTimes = async (totalBill: Bill[], billUuid?: string) => {
  try {
    if (billUuid) {
      const curBill = await Bill.findOne({
        where: {
          uuid: billUuid,
        },
        attributes: ['sponsorUuid'],
        include: [
          {
            model: Cosponsor,
            attributes: ['uuid'],
          },
        ],
      });

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      const sponsorTimes = totalBill.filter(
        bill => bill?.sponsor?.uuid === curBill?.sponsor?.uuid
      ).length;
      const cosponsorTimes = totalBill.filter(
        bill =>
          bill.cosponsors?.findIndex(
            cosponsor => cosponsor.uuid === curBill?.sponsorUuid
          ) !== -1
      ).length;

      return sponsorTimes * SPONSOR_W + cosponsorTimes * COSPONSOR_W;
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 提出者作为法案的联合提出者的次数
const getCosponsorTimes = () => {};

export { getBeforeTotalBill, getSponsorTimes, getCosponsorTimes };
