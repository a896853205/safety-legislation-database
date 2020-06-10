import Sequelize from 'sequelize';

import Bill from '../../models/bill';
import Cosponsor from '../../models/cosponsor';
import Person from '../../models/person';

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
              attributes: ['uuid'],
            },
          ],
        },
        {
          model: Person,
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
        include: [
          {
            model: Cosponsor,
            attributes: ['uuid'],
            include: [
              {
                model: Person,
                attributes: ['uuid'],
              },
            ],
          },
          {
            model: Person,
            attributes: ['uuid'],
          },
        ],
      });

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      const sponsorTimes = totalBill.filter(bill =>
        bill?.sponsor?.uuid && curBill?.sponsor?.uuid
          ? bill?.sponsor?.uuid === curBill?.sponsor?.uuid
          : false
      ).length;

      let cosponsorTimes = 0;
      curBill?.cosponsors?.forEach(curCosponsor => {
        cosponsorTimes += totalBill.filter(bill =>
          bill?.sponsor?.uuid && curCosponsor?.cosponsor?.uuid
            ? bill?.sponsor?.uuid === curCosponsor?.cosponsor?.uuid
            : false
        ).length;
      });

      return (
        (sponsorTimes * SPONSOR_W * 10 + cosponsorTimes * COSPONSOR_W * 10) /
        10
      ).toFixed(2);
    } else {
      return '0.0';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 提出者作为法案的联合提出者的次数
const getCosponsorTimes = async (totalBill: Bill[], billUuid?: string) => {
  try {
    if (billUuid) {
      const curBill = await Bill.findOne({
        where: {
          uuid: billUuid,
        },
        include: [
          {
            model: Cosponsor,
            attributes: ['uuid'],
            include: [
              {
                model: Person,
                attributes: ['uuid'],
              },
            ],
          },
          {
            model: Person,
            attributes: ['uuid'],
          },
        ],
      });

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      let sponsorTimes = 0;
      curBill?.cosponsors?.forEach(cosponsor => {
        sponsorTimes += totalBill.filter(bill =>
          bill?.sponsor?.uuid && cosponsor?.cosponsor?.uuid
            ? bill?.sponsor?.uuid === cosponsor?.cosponsor?.uuid
            : false
        ).length;
      });

      let cosponsorTimes = 0;
      curBill?.cosponsors?.forEach(curCosponsor => {
        cosponsorTimes += totalBill.filter(
          bill =>
            bill.cosponsors?.findIndex(
              cosponsor =>
                cosponsor?.cosponsor?.uuid === curCosponsor?.cosponsor?.uuid
            ) !== -1
        ).length;
      });

      return (
        (sponsorTimes * SPONSOR_W * 10 + cosponsorTimes * COSPONSOR_W * 10) /
        10
      ).toFixed(2);
    } else {
      return '0.0';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getBeforeTotalBill, getSponsorTimes, getCosponsorTimes };
