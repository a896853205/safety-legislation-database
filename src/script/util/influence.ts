import Sequelize from 'sequelize';

import Bill from '../../models/bill';
import Cosponsor from '../../models/cosponsor';
import Country from '../../models/country';
import LegislativeSubject from '../../models/legislative-subject';
import { socialInfluence } from '../../neo4j';
import { JUMP_PROBABILITY } from '../../constants/pagerank-constants';
import Person from '../../models/person';
import PersonIdentity from '../../models/person-identity';
import PoliticalOrganization from '../../models/political-organization';
import moment from 'moment';
import Committee from '../../models/committee';

const Op = Sequelize.Op;

const _congress2startYear = (congress: number) => {
  return (congress - 100 - 13) * 2 + 2013;
};

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
      attributes: ['uuid', 'policyArea', 'status', 'number', 'congress'],
      where: {
        congress: {
          [Op.lt]: bill?.congress,
        },
      },
      include: [
        {
          model: Committee,
          attributes: ['organizationUuid'],
        },
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
        {
          model: LegislativeSubject,
          attributes: ['subject'],
        },
        {
          model: Country,
          attributes: ['uuid'],
          include: [
            {
              model: PoliticalOrganization,
              attributes: ['uuid'],
            },
          ],
        },
      ],
    });
  }
};

/**
 * [1] 提出者作为法案的主要提出者的次数
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
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

/**
 * [2] 提出者作为法案的联合提出者的次数
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
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

/**
 * [3] 与提出者相关的法案覆盖的行业范围
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
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

/**
 * [4] 与提出者相关的法案覆盖的地理范围
 * @param billUuid 计算法案的uuid
 */
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
                model: PoliticalOrganization,
                attributes: ['uuid'],
              },
            ],
          },
        ],
      });

      return curBill?.country?.politicalOrganizations?.length
        ? curBill?.country?.politicalOrganizations?.length.toFixed(2)
        : '0.00';
    } else {
      return '0.00';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * [5] 与提出者相关的法案覆盖的立法范围
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getLegislativeSubjectTimes = async (
  totalBill: Bill[],
  billUuid?: string
) => {
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
          filteredBill.legislativeSubjects?.forEach(LS => {
            if (LS?.subject) {
              SPONSOR_SET.add(LS.subject);
            }
          });
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
            filteredBill.legislativeSubjects?.forEach(LS => {
              if (LS?.subject) {
                COSPONSOR_SET.add(LS.subject);
              }
            });
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

/**
 * [6] 提出者的社交影响力
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getSocialNums = async (totalBill: Bill[], billUuid?: string) => {
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

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      let relativeTimes = 0;

      relativeTimes += totalBill.filter(bill =>
        bill?.sponsor?.uuid && curBill?.sponsor?.uuid
          ? bill?.sponsor?.uuid === curBill?.sponsor?.uuid
          : false
      ).length;

      curBill?.cosponsors?.forEach(curCosponsor => {
        relativeTimes += totalBill.filter(bill =>
          bill?.sponsor?.uuid && curCosponsor?.cosponsor?.uuid
            ? bill?.sponsor?.uuid === curCosponsor?.cosponsor?.uuid
            : false
        ).length;
      });

      relativeTimes += totalBill.filter(
        bill =>
          bill.cosponsors?.findIndex(
            cosponsor => cosponsor?.cosponsor?.uuid === curBill?.sponsor?.uuid
          ) !== -1
      ).length;

      curBill?.cosponsors?.forEach(curCosponsor => {
        relativeTimes += totalBill.filter(
          bill =>
            bill.cosponsors?.findIndex(
              cosponsor =>
                cosponsor?.cosponsor?.uuid === curCosponsor?.cosponsor?.uuid
            ) !== -1
        ).length;
      });

      let res: any[] | undefined = [];
      if (relativeTimes > 0) {
        res = await socialInfluence(billUuid);
      }

      let sponsorItem = res?.find(
        item => item.personName === curBill?.sponsor?.name
      );

      const sponsorScore = sponsorItem
        ? sponsorItem.score
        : 1 - JUMP_PROBABILITY;

      let cosponsorTotalScore = 0;

      curBill?.cosponsors?.forEach(cos => {
        let cosItem = res?.find(
          item => item.personName === cos.cosponsor?.name
        );

        let cosInflu = cosItem ? cosItem.score : 1 - JUMP_PROBABILITY;
        cosponsorTotalScore += cosInflu;
      });

      return (
        (sponsorScore * SPONSOR_W * 10 +
          cosponsorTotalScore * COSPONSOR_W * 10) /
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

/**
 * [7] 提出者的身份影响力
 * @param billUuid 计算法案的uuid
 */
const getIdentityNums = async (billUuid?: string) => {
  const HOUSE_W = 0.3;
  const SENATE_W = 0.6;

  try {
    if (billUuid) {
      const curBill = await Bill.findOne({
        where: {
          uuid: billUuid,
        },
        attributes: ['uuid', 'congress'],
        include: [
          {
            model: Cosponsor,
            attributes: ['uuid'],
            include: [
              {
                model: Person,
                attributes: ['uuid', 'name'],
                include: [
                  {
                    model: PersonIdentity,
                    attributes: ['dateStart', 'dateEnd', 'identity'],
                  },
                ],
              },
            ],
          },
          {
            model: Person,
            attributes: ['uuid', 'name'],
            include: [
              {
                model: PersonIdentity,
                attributes: ['dateStart', 'dateEnd', 'identity'],
              },
            ],
          },
        ],
      });

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      let curDateStartYear = 0;
      // 将congress转换为年份
      if (curBill?.congress) {
        curDateStartYear = _congress2startYear(curBill.congress);
      }

      const culTotalYears = (PIs: PersonIdentity[]) => {
        let minYear = Infinity;
        let maxYear = -Infinity;

        PIs.forEach(PI => {
          let dateStart = moment(PI?.dateStart).year();
          let dateEnd = moment(PI?.dateEnd).year();

          if (dateStart && curDateStartYear > dateStart) {
            if (dateStart && dateStart < minYear) {
              minYear = dateStart;
            }
            if (dateEnd && curDateStartYear >= dateEnd) {
              if (dateEnd && dateEnd > maxYear) {
                maxYear = dateEnd;
              }
            } else if (dateEnd && curDateStartYear < dateEnd) {
              maxYear = curDateStartYear;
            }
            if (!dateEnd) {
              maxYear = curDateStartYear;
            }
          }
        });

        return { minYear, maxYear };
      };

      const culSHLastYears = (PIs: PersonIdentity[]) => {
        let senteLastYears = 0;
        let houseLastYears = 0;

        PIs.forEach(PI => {
          let dateStart = moment(PI?.dateStart).year();
          let dateEnd = moment(PI?.dateEnd).year();

          if (dateStart && curDateStartYear > dateStart) {
            if (PI.identity === 'Senate') {
              if (dateEnd) {
                // 有最后年
                if (curDateStartYear < dateEnd) {
                  senteLastYears += curDateStartYear - dateStart;
                } else {
                  senteLastYears += dateEnd - dateStart;
                }
              } else {
                // 没有最后年
                senteLastYears += curDateStartYear - dateStart;
              }
            } else if (PI.identity === 'House') {
              if (dateEnd) {
                // 有最后年
                if (curDateStartYear < dateEnd) {
                  houseLastYears += curDateStartYear - dateStart;
                } else {
                  houseLastYears += dateEnd - dateStart;
                }
              } else {
                // 没有最后年
                houseLastYears += curDateStartYear - dateStart;
              }
            }
          }
        });
        return { senteLastYears, houseLastYears };
      };

      const culPersonScore = (PIs: PersonIdentity[]) => {
        let senteLastYears = 0;
        let houseLastYears = 0;

        const res = culSHLastYears(PIs);
        const { maxYear, minYear } = culTotalYears(PIs);

        senteLastYears = res.senteLastYears;
        houseLastYears = res.houseLastYears;

        return maxYear - minYear
          ? (houseLastYears * HOUSE_W + senteLastYears * SENATE_W) /
              (maxYear - minYear)
          : 0;
      };

      let sponsorScore = 0;
      let cosponsorScore = 0;
      if (curBill?.sponsor?.personIdentities) {
        sponsorScore = culPersonScore(curBill?.sponsor?.personIdentities);
      }

      curBill?.cosponsors?.forEach(cos => {
        if (cos.cosponsor?.personIdentities) {
          cosponsorScore += culPersonScore(cos.cosponsor?.personIdentities);
        }
      });

      return (
        (sponsorScore * SPONSOR_W * 10 + cosponsorScore * COSPONSOR_W * 10) /
        10
      ).toFixed(2);
    } else {
      return '0.00';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * [8] 与提出者相关的全部法案正式成为法律的比率
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getBecameLawRate = async (totalBill: Bill[], billUuid?: string) => {
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

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      const culPersonRate = (personUuid: string) => {
        let totalRelativeBill = 0;
        let becameLawBill = 0;

        totalBill.forEach(bill => {
          if (bill?.sponsor?.uuid === personUuid) {
            totalRelativeBill++;

            if (bill.status === 'BecameLaw') {
              becameLawBill++;
            }
          } else {
            bill.cosponsors?.forEach(cos => {
              if (cos.cosponsor?.uuid === personUuid) {
                totalRelativeBill++;

                if (bill.status === 'BecameLaw') {
                  becameLawBill++;
                }
              }
            });
          }
        });

        return becameLawBill ? becameLawBill / totalRelativeBill : 0;
      };

      let sponsorRate = 0;
      let cosponsorRate = 0;

      if (curBill?.sponsor?.uuid) {
        sponsorRate = culPersonRate(curBill?.sponsor?.uuid);
      }

      curBill?.cosponsors?.forEach(cos => {
        if (cos.uuid) {
          cosponsorRate += culPersonRate(cos.uuid);
        }
      });

      return (
        (sponsorRate * SPONSOR_W * 10 + cosponsorRate * COSPONSOR_W * 10) /
        10
      ).toFixed(2);
    } else {
      return '0.0';
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * [9] 与提出者相关的法案获得的认可度
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getRecognitionNums = async (totalBill: Bill[], billUuid?: string) => {
  const RECOGNITION_ARR = ['AgreedInHouse', 'BecameLaw', 'AgreedToInSenate'];

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

      const SPONSOR_W = curBill?.cosponsors?.length ? 0.6 : 1;
      const COSPONSOR_W = curBill?.cosponsors?.length
        ? (1 - SPONSOR_W) / curBill?.cosponsors?.length
        : 0;

      const culPersonTimes = (personUuid: string) => {
        let totalRelativeBill = 0;

        totalBill.forEach(bill => {
          if (bill?.sponsor?.uuid === personUuid) {
            if (
              !bill.status ||
              RECOGNITION_ARR.findIndex(item => item === bill.status) !== -1
            ) {
              totalRelativeBill++;
            }
          } else {
            bill.cosponsors?.forEach(cos => {
              if (cos.cosponsor?.uuid === personUuid) {
                if (
                  !bill.status ||
                  RECOGNITION_ARR.findIndex(item => item === bill.status) !== -1
                ) {
                  totalRelativeBill++;
                }
              }
            });
          }
        });

        return totalRelativeBill;
      };

      let sponsorTimes = 0;
      let cosponsorTimes = 0;

      if (curBill?.sponsor?.uuid) {
        sponsorTimes = culPersonTimes(curBill?.sponsor?.uuid);
      }

      curBill?.cosponsors?.forEach(cos => {
        if (cos?.cosponsor?.uuid) {
          cosponsorTimes += culPersonTimes(cos?.cosponsor.uuid);
        }
      });

      return (
        (sponsorTimes * SPONSOR_W * 10 + cosponsorTimes * COSPONSOR_W * 10) /
        10
      ).toFixed(2);
    } else {
      return '0.0';
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * [12] 议员覆盖的地理区域
 * @param billUuid 计算法案的uuid
 */
const getStateRate = async (billUuid?: string) => {
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
                attributes: ['uuid', 'name'],
                include: [
                  {
                    model: PersonIdentity,
                    attributes: ['state'],
                  },
                ],
              },
            ],
          },
          {
            model: Person,
            attributes: ['uuid', 'name'],
            include: [
              {
                model: PersonIdentity,
                attributes: ['state'],
              },
            ],
          },
        ],
      });

      let stateSet = new Set<string>();
      curBill?.sponsor?.personIdentities?.forEach(PI => {
        if (PI.state) {
          stateSet.add(PI.state);
        }
      });
      curBill?.cosponsors?.forEach(cos => {
        cos.cosponsor?.personIdentities?.forEach(PI => {
          if (PI.state) {
            stateSet.add(PI.state);
          }
        });
      });

      return (stateSet.size / 50).toFixed(2);
    } else {
      return '0.00';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * [13] 议员覆盖的党派比例
 * @param billUuid 计算法案的uuid
 */
const getPersonPartyRate = async (billUuid: string) => {
  const typeArr = [
    'Democratic',
    'Republican',
    'Independent',
    'Independent Democrat',
  ];
  try {
    const curBill = await Bill.findOne({
      where: {
        uuid: billUuid,
      },
      attributes: ['uuid', 'congress'],
      include: [
        {
          model: Cosponsor,
          attributes: ['uuid'],
          include: [
            {
              model: Person,
              attributes: ['uuid', 'name'],
              include: [
                {
                  model: PersonIdentity,
                  attributes: ['party'],
                },
              ],
            },
          ],
        },
        {
          model: Person,
          attributes: ['uuid', 'name'],
          include: [
            {
              model: PersonIdentity,
              attributes: ['party'],
            },
          ],
        },
      ],
    });

    let startYear = 0;
    if (curBill?.congress) {
      startYear = _congress2startYear(curBill?.congress);
    }

    const totalPerson = await Person.findAll({
      include: [
        {
          model: PersonIdentity,
          attributes: ['party', 'dateStart', 'dateEnd'],
          where: {
            [Op.and]: {
              dateStart: {
                [Op.lt]: moment(startYear, 'YYYY').unix(),
              },
              dateEnd: {
                [Op.or]: {
                  [Op.gt]: moment(startYear, 'YYYY').unix(),
                  [Op.is]: null,
                },
              },
            },
          },
        },
      ],
    });

    const personPartyType = (person: Person) => {
      let partyType = undefined;

      if (person?.personIdentities) {
        for (let PI of person?.personIdentities) {
          if (PI?.party && typeArr.includes(PI?.party)) {
            partyType = PI.party;
          }
        }
      }

      return partyType;
    };

    let democraticNums = 0;
    let republicanNums = 0;
    let independentNums = 0;
    let independentDemocratNums = 0;

    totalPerson.forEach(person => {
      let partyType = personPartyType(person);

      switch (partyType) {
        case 'Democratic':
          democraticNums++;
          break;
        case 'Republican':
          republicanNums++;
          break;

        case 'Independent':
          independentNums++;
          break;
        case 'Independent Democrat':
          independentDemocratNums++;
          break;
      }
    });

    const personPartyScore = (person: Person) => {
      let partyType = personPartyType(person);
      let total = totalPerson.length;

      switch (partyType) {
        case 'Democratic':
          return democraticNums / total;

        case 'Republican':
          return republicanNums / total;

        case 'Independent':
          return independentNums / total;

        case 'Independent Democrat':
          return independentDemocratNums / total;
        default:
          return 0;
      }
    };

    let totalScore = 0;
    if (curBill?.sponsor) {
      totalScore += personPartyScore(curBill?.sponsor);
    }
    curBill?.cosponsors?.forEach(cos => {
      if (cos.cosponsor) {
        totalScore += personPartyScore(cos.cosponsor);
      }
    });

    return totalScore.toFixed(2);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * [15] 管理者作为法案的管理者的次数
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesTimes = async (totalBill: Bill[], billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
    ],
  });

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;
    let totalCom = 0;

    curBill.committees.forEach(committee => {
      totalBill.forEach(bill => {
        if (
          bill.committees?.findIndex(
            com => com.organizationUuid === committee.organizationUuid
          ) !== -1
        )
          totalCom++;
      });
    });

    return (totalCom * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

/**
 * [17] 与管理者相关的法案覆盖的行业范围
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesPATimes = async (totalBill: Bill[], billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
    ],
  });

  let PAScore = 0;

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;

    curBill.committees.forEach(committee => {
      let PASet = new Set<string>();

      totalBill.forEach(bill => {
        if (
          bill.committees?.findIndex(
            com => com.organizationUuid === committee.organizationUuid
          ) !== -1
        )
          if (bill.policyArea) {
            PASet.add(bill.policyArea);
          }
      });

      PAScore += PASet.size;
    });

    return (PAScore * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

/**
 * [18] 与管理者相关的法案覆盖的地理范围
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesPOTimes = async (totalBill: Bill[], billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
      {
        model: Country,
        attributes: ['uuid'],
        include: [
          {
            model: PoliticalOrganization,
            attributes: ['uuid'],
          },
        ],
      },
    ],
  });

  let POScore = 0;

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;

    curBill.committees.forEach(committee => {
      let POSet = new Set<string>();

      totalBill.forEach(bill => {
        if (
          bill.committees?.findIndex(
            com => com.organizationUuid === committee.organizationUuid
          ) !== -1
        )
          bill.country?.politicalOrganizations?.forEach(PO => {
            if (PO && PO.uuid) {
              POSet.add(PO.uuid);
            }
          });
      });

      POScore += POSet.size;
    });

    return (POScore * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

/**
 * [19] 与管理者相关的法案覆盖的立法范围
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesLSTimes = async (totalBill: Bill[], billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
      {
        model: LegislativeSubject,
        attributes: ['subject'],
      },
    ],
  });

  let LSScore = 0;

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;

    curBill.committees.forEach(committee => {
      let LSSet = new Set<string>();

      totalBill.forEach(bill => {
        if (
          bill.committees?.findIndex(
            com => com.organizationUuid === committee.organizationUuid
          ) !== -1
        ) {
          bill?.legislativeSubjects?.forEach(LS => {
            if (LS && LS.subject) {
              LSSet.add(LS.subject);
            }
          });
        }
      });

      LSScore += LSSet.size;
    });

    return (LSScore * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

/**
 * [21] 与管理者相关的全部法案正式成为法律的比率
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesBLRate = async (totalBill: Bill[], billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
    ],
  });

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;

    let committeeScore = 0;

    curBill.committees.forEach(curCommittee => {
      let committeeTimes = 0;
      let becameLawTimes = 0;
      totalBill.forEach(bill => {
        bill.committees?.forEach(committee => {
          if (committee.organizationUuid === curCommittee.organizationUuid) {
            committeeTimes++;
            if (bill.status === 'BecameLaw') {
              becameLawTimes++;
            }
          }
        });
      });

      if (committeeTimes) {
        committeeScore += becameLawTimes / committeeTimes;
      }
    });

    return (committeeScore * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

/**
 * [22] 与管理者相关的法案获得的认可度
 * @param totalBill 法案集合
 * @param billUuid 计算法案的uuid
 */
const getCommitteesRecognitionTimes = async (
  totalBill: Bill[],
  billUuid: string
) => {
  const RECOGNITION_ARR = ['AgreedInHouse', 'BecameLaw', 'AgreedToInSenate'];

  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: Committee,
        attributes: ['organizationUuid'],
      },
    ],
  });

  if (curBill?.committees?.length) {
    const committee_w = 1 / curBill?.committees?.length;

    let committeeScore = 0;

    curBill.committees.forEach(curCommittee => {
      totalBill.forEach(bill => {
        bill.committees?.forEach(committee => {
          if (committee.organizationUuid === curCommittee.organizationUuid) {
            if (
              !bill.status ||
              RECOGNITION_ARR.findIndex(rec => bill.status === rec) !== -1
            ) {
              committeeScore++;
            }
          }
        });
      });
    });

    return (committeeScore * committee_w).toFixed(2);
  } else {
    return '0.00';
  }
};

const getLSRate = async (billUuid: string) => {
  const curBill = await Bill.findOne({
    where: {
      uuid: billUuid,
    },
    attributes: ['uuid', 'congress'],
    include: [
      {
        model: LegislativeSubject,
        attributes: ['subject'],
      },
    ],
  });

  return curBill?.legislativeSubjects?.length
    ? (curBill?.legislativeSubjects.length / 864).toFixed(2)
    : '0.00';
};

export {
  getBeforeTotalBill,
  getSponsorTimes,
  getCosponsorTimes,
  getPolicyAreaTimes,
  getCountryPoliticalOrganizationNums,
  getLegislativeSubjectTimes,
  getSocialNums,
  getIdentityNums,
  getBecameLawRate,
  getRecognitionNums,
  getStateRate,
  getPersonPartyRate,
  getCommitteesTimes,
  getCommitteesPATimes,
  getCommitteesPOTimes,
  getCommitteesLSTimes,
  getCommitteesBLRate,
  getCommitteesRecognitionTimes,
  getLSRate,
};
