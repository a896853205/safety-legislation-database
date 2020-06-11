import Sequelize from 'sequelize';

import Bill from '../../models/bill';
import Cosponsor from '../../models/cosponsor';
import Country from '../../models/country';
import Person from '../../models/person';
import politicalOrganization from '../../models/political-organization';

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
      attributes: ['uuid', 'policyArea'],
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

      const sponsorTimes = totalBill.filter(
        bill =>
          bill.cosponsors?.findIndex(
            cosponsor => cosponsor?.cosponsor?.uuid === curBill?.sponsor?.uuid
          ) !== -1
      ).length;

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

// 与提出者相关的法案覆盖的行业范围
const getPolicyAreaTimes = async (totalBill: Bill[], billUuid?: string) => {
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

      const SPONSOR_SET = new Set<string>();
      const COSPONSOR_SET = new Set<string>();

      totalBill
        .filter(bill => {
          let sponsorFlag = false;
          let cosponsorFlag = false;

          if (bill?.sponsor?.uuid && curBill?.sponsor?.uuid) {
            sponsorFlag = bill?.sponsor?.uuid === curBill?.sponsor?.uuid;
          } else {
            sponsorFlag = false;
          }

          cosponsorFlag =
            bill.cosponsors?.findIndex(
              cosponsor => cosponsor?.cosponsor?.uuid === curBill?.sponsor?.uuid
            ) !== -1;

          return sponsorFlag || cosponsorFlag;
        })
        .forEach(filteredBill => {
          if (filteredBill.policyArea) {
            SPONSOR_SET.add(filteredBill.policyArea);
          }
        });

      let cosponsorSetAllSize = 0;
      curBill?.cosponsors?.forEach(curCosponsor => {
        totalBill
          .filter(bill => {
            let sponsorFlag = false;
            let cosponsorFlag = false;

            if (bill?.sponsor?.uuid && curCosponsor?.cosponsor?.uuid) {
              sponsorFlag =
                bill?.sponsor?.uuid === curCosponsor?.cosponsor?.uuid;
            } else {
              sponsorFlag = false;
            }

            cosponsorFlag =
              bill.cosponsors?.findIndex(
                cosponsor =>
                  cosponsor?.cosponsor?.uuid === curCosponsor?.cosponsor?.uuid
              ) !== -1;

            return sponsorFlag || cosponsorFlag;
          })
          .forEach(filteredBill => {
            if (filteredBill.policyArea) {
              COSPONSOR_SET.add(filteredBill.policyArea);
            }
          });

        cosponsorSetAllSize += COSPONSOR_SET.size;
        COSPONSOR_SET.clear();
      });

      return (
        (SPONSOR_SET.size * SPONSOR_W * 10 +
          cosponsorSetAllSize * COSPONSOR_W * 10) /
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

// 与提出者相关的法案覆盖的地理范围
const getCountryPoliticalOrganizationNums = async (billUuid?: string) => {
  try {
    if (billUuid) {
      const curBill = await Bill.findOne({
        where: {
          uuid: billUuid,
        },
        include: [
          {
            model: Country,
            attributes: ['uuid'],
            include: [
              {
                model: politicalOrganization,
                attributes: ['uuid'],
              },
            ],
          },
        ],
      });

      return curBill?.country?.politicalOrganizations?.length
        ? curBill?.country?.politicalOrganizations?.length
        : 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  getBeforeTotalBill,
  getSponsorTimes,
  getCosponsorTimes,
  getPolicyAreaTimes,
  getCountryPoliticalOrganizationNums,
};
