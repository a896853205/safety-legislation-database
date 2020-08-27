import Sequelize from 'sequelize';
import moment from 'moment';

import Bill from '../../models/bill';
import Country from '../../models/country';
import Cosponsor from '../../models/cosponsor';
import Committee from '../../models/committee';
import LegislativeSubject from '../../models/legislative-subject';
import Person from '../../models/person';
import Action from '../../models/action';
import PersonIdentity from '../../models/person-identity';
import Organization from '../../models/organization';
import organizationInit from '../../init/organization-init';

const Op = Sequelize.Op;

const _culSHLastYears = (PIs: PersonIdentity[]) => {
  let senteLastYears = 0;
  let houseLastYears = 0;

  PIs.forEach(PI => {
    let dateStart = moment(PI?.dateStart).year();
    let dateEnd = moment(PI?.dateEnd).year();

    if (PI.identity === 'Senate') {
      if (dateEnd) {
        // 有最后年
        senteLastYears += dateEnd - dateStart;
      } else {
        // 没有最后年
        senteLastYears += moment().year() - dateStart;
      }
    } else if (PI.identity === 'House') {
      if (dateEnd) {
        // 有最后年
        houseLastYears += dateEnd - dateStart;
      } else {
        // 没有最后年
        houseLastYears += moment().year() - dateStart;
      }
    }
  });
  return { senteLastYears, houseLastYears };
};

// 获取美国法案
export const getUSBill = async (congress?: number) : Promise<Bill[]> => {
  let where: any = null;

  if (congress) {
    where = {
      congress: {
        [Op.lt]: congress,
      },
    };
  }

  return Bill.findAll({
    attributes: {
      exclude: ['summary', 'text'],
    },
    where,
    include: [
      {
        model: Country,
        attributes: ['uuid'],
        where: {
          name: '美国',
        },
      },
      {
        model: Committee,
      },
      {
        model: LegislativeSubject,
        attributes: ['uuid', 'subject'],
      },
      {
        model: Person,
        attributes: ['uuid'],
      },
      {
        model: Cosponsor,
        include: [
          {
            model: Person,
            attributes: ['uuid'],
          },
        ],
      },
      {
        model: Action,
        order: ['actionDate', 'DESC'],
      },
    ],
  });
};

// 获取美国所有人uuid
export const getUSPerson = async (congress?: number) => {
  const personSet = new Set<string>();
  let where: any = null;

  if (congress) {
    where = {
      congress: {
        [Op.lt]: congress,
      },
    };
  }

  const USBill = await Bill.findAll({
    attributes: {
      exclude: ['summary', 'text'],
    },
    where,
    include: [
      {
        model: Country,
        attributes: ['uuid'],
        where: {
          name: '美国',
        },
      },
      {
        model: Person,
        attributes: ['uuid'],
      },
      {
        model: Cosponsor,
        include: [
          {
            model: Person,
            attributes: ['uuid'],
          },
        ],
      },
    ],
  });

  for (let bill of USBill) {
    bill.sponsor?.uuid ? personSet.add(bill.sponsor.uuid) : undefined;

    if (bill.cosponsors) {
      for (let cos of bill.cosponsors) {
        cos?.cosponsor?.uuid ? personSet.add(cos.cosponsor.uuid) : undefined;
      }
    }
  }

  return Person.findAll({
    where: {
      uuid: {
        [Op.in]: Array.from(personSet.values()),
      },
    },
    include: [
      {
        model: PersonIdentity,
        order: ['congressStart', 'ASC'],
      },
    ],
  });
};

// 获取美国所有committee
export const getUSCommittee = async (congress?: number) => {
  const committeeSet = new Set<string>();

  let where: any = null;

  if (congress) {
    where = {
      congress: {
        [Op.lt]: congress,
      },
    };
  }

  const USBill = await Bill.findAll({
    attributes: {
      exclude: ['summary', 'text'],
    },
    where,
    include: [
      {
        model: Country,
        attributes: ['uuid'],
        where: {
          name: '美国',
        },
      },
      {
        model: Committee,
      },
    ],
  });

  for (let bill of USBill) {
    if (bill?.committees) {
      for (let committee of bill?.committees) {
        committee.organizationUuid
          ? committeeSet.add(committee.organizationUuid)
          : undefined;
      }
    }
  }

  return Organization.findAll({
    where: {
      uuid: {
        [Op.in]: Array.from(committeeSet.values()),
      },
    },
  });
};

// 计算M01
export const sponsorTotalNum = (personUuid: string, USBill: Bill[]) => {
  let M01 = 0;

  for (let bill of USBill) {
    if (bill.sponsor?.uuid === personUuid) {
      M01++;
    }
  }

  return M01;
};

// 计算M02
export const cosponsorTotalNum = (personUuid: string, USBill: Bill[]) => {
  let M02 = 0;

  for (let bill of USBill) {
    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          M02++;
          break;
        }
      }
    }
  }

  return M02;
};

// 计算R01
export const policyAreaTotalNum = (personUuid: string, USBill: Bill[]) => {
  const policyAreaSet = new Set<string>();

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      bill.policyArea ? policyAreaSet.add(bill.policyArea) : undefined;
    }
  }

  return policyAreaSet.size;
};

// 计算R03
export const legislativeSubjectsTotalNum = (
  personUuid: string,
  USBill: Bill[]
) => {
  const legislativeSubjectsSet = new Set<string>();

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (bill?.legislativeSubjects) {
        for (let LS of bill?.legislativeSubjects) {
          LS.subject ? legislativeSubjectsSet.add(LS.subject) : undefined;
        }
      }
    }
  }

  return legislativeSubjectsSet.size;
};

// 计算D01
export const socialInflu = (
  personName: string,
  personSocialInfluArr: { name: string; value: number }[]
) => {
  let curPerson = personSocialInfluArr.find(personSocial => {
    return personSocial.name === personName;
  });

  return curPerson ? +curPerson.value.toFixed(2) : 0.15;
};

// 计算D02
export const identityScore = async (personUuid: string, USBill: Bill[]) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let houseBillNums = 0;
  let senateBillNums = 0;
  let houseRecognizedNums = 0;
  let senateRecognizedNums = 0;

  for (let bill of USBill) {
    if (bill.originChamber === 'House') {
      houseBillNums++;
      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        houseRecognizedNums++;
      }
    } else if (bill.originChamber === 'Senate') {
      senateBillNums++;
      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        senateRecognizedNums++;
      }
    }
  }

  if (houseBillNums || senateBillNums) {
    let person = await Person.findOne({
      where: {
        uuid: personUuid,
      },
      include: [
        {
          model: PersonIdentity,
          attributes: ['dateStart', 'dateEnd', 'identity'],
        },
      ],
    });

    if (person?.personIdentities) {
      let { senteLastYears, houseLastYears } = _culSHLastYears(
        person?.personIdentities
      );

      let a = houseBillNums ? houseRecognizedNums / houseBillNums : 0;
      let b = senateBillNums ? senateRecognizedNums / senateBillNums : 0;

      if (!(houseLastYears + senteLastYears)) {
        return 0;
      }
      return +(
        (a * houseLastYears) / (houseLastYears + senteLastYears) +
        (b * senteLastYears) / (houseLastYears + senteLastYears)
      ).toFixed(2);
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};

// 计算D03
export const becameLawRate = (personUuid: string, USBill: Bill[]) => {
  let total = 0;
  let bacameLaw = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (bill?.status) {
        if (bill.status === 'BecameLaw') {
          bacameLaw++;
        }
      }
    }
  }

  return +(bacameLaw / total).toFixed(2);
};

// 计算D04
export const recognizedRate = (personUuid: string, USBill: Bill[]) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let recognized = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        recognized++;
      }
    }
  }

  return +(recognized / total).toFixed(2);
};

// LP
export const legislativeProcessScore = (personUuid: string, USBill: Bill[]) => {
  let score = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (bill?.actions) {
        bill.actions.forEach(action => {
          if (action.value) {
            score += Number(action.value);
          }
        });
      }
    }
  }

  return score;
};

// MPA
export const mainPolicyArea = (personUuid: string, USBill: Bill[]) => {
  let policyAreaMap = new Map();

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (bill?.policyArea) {
        if (policyAreaMap.has(bill?.policyArea)) {
          policyAreaMap.set(
            bill?.policyArea,
            policyAreaMap.get(bill?.policyArea) + 1
          );
        } else {
          policyAreaMap.set(bill?.policyArea, 1);
        }
      }
    }
  }

  let policyAreaArr: any[] = [];

  policyAreaMap.forEach((value, key) => {
    policyAreaArr.push({
      policyArea: key,
      times: value,
    });
  });

  if (!policyAreaArr.length) {
    return 'NULL';
  }

  if (policyAreaArr.length === 1) {
    return policyAreaArr[0];
  } else {
    policyAreaArr.sort((a, b) => b.times - a.times);

    let isEqual = true;

    policyAreaArr.reduce((a, b) => {
      if (a.times !== b.times) {
        isEqual = false;
      }

      return b;
    });

    if (isEqual) {
      return 'NULL';
    } else {
      return policyAreaArr[0].policyArea;
    }
  }
};

// 计算T01
export const influTime = (personUuid: string, USBill: Bill[]) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let time = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        if (bill.actions && bill.actions[0] && bill.actions[0].actionDate) {
          time += +new Date() - +bill.actions[0].actionDate;
        }
      }
    }
  }

  return +(time / total).toFixed(2);
};

// 计算T02
export const relativeTime = (personUuid: string, USBill: Bill[]) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let time = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill.sponsor?.uuid === personUuid) {
      isHave = true;
    }

    if (bill?.cosponsors) {
      for (let cos of bill?.cosponsors) {
        if (cos.cosponsor?.uuid === personUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        USBill.forEach(bi => {
          if (bi.categorize === bill.categorize) {
            total++;
            if (bill.actions && bill.actions[0] && bill.actions[0].actionDate) {
              time += +new Date() - +bill.actions[0].actionDate;
            }
          }
        });
      }
    }
  }

  return total ? +(time / total).toFixed(2) : 0;
};

// 管理者计算M01
export const committeeTotalNum = (organizationUuid: string, USBill: any[]) => {
  let M01 = 0;

  for (let bill of USBill) {
    if (bill.committees) {
      for (let committee of bill.committees) {
        if (committee.organizationUuid === organizationUuid) {
          M01++;
          break;
        }
      }
    }
  }

  return M01;
};

// 管理者计算R01
export const committeePolicyAreaTotalNum = (
  organizationUuid: string,
  USBill: any[]
) => {
  const policyAreaSet = new Set<string>();

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      bill.policyArea ? policyAreaSet.add(bill.policyArea) : undefined;
    }
  }

  return policyAreaSet.size;
};

// 管理者计算R03
export const committeeLegislativeSubjectsTotalNum = (
  organizationUuid: string,
  USBill: any[]
) => {
  const legislativeSubjectsSet = new Set<string>();

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (bill?.legislativeSubjects) {
        for (let LS of bill?.legislativeSubjects) {
          LS.subject ? legislativeSubjectsSet.add(LS.subject) : undefined;
        }
      }
    }
  }

  return legislativeSubjectsSet.size;
};

// 管理者计算D03
export const committeeBecameLawRate = (
  organizationUuid: string,
  USBill: any[]
) => {
  let total = 0;
  let bacameLaw = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (bill?.status) {
        if (bill.status === 'BecameLaw') {
          bacameLaw++;
        }
      }
    }
  }

  return +(bacameLaw / total).toFixed(2);
};

// 管理者计算D04
export const committeeRecognizedRate = (
  organizationUuid: string,
  USBill: any[]
) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let recognized = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        recognized++;
      }
    }
  }

  return +(recognized / total).toFixed(2);
};

// 管理者计算T01
export const committeeInfluTime = (
  organizationUuid: string,
  USBill: any[]
) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let time = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      total++;

      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        if (bill.actions && bill.actions[0] && bill.actions[0].actionDate) {
          time += +new Date() - +bill.actions[0].actionDate;
        }
      }
    }
  }

  return +(time / total).toFixed(2);
};

// 管理者计算T02
export const committeeRelativeTime = (
  organizationUuid: string,
  USBill: any[]
) => {
  const RECOGNIZED = ['BecomeLaw', 'AgreedToInSenate', 'AgreedInHouse'];
  let total = 0;
  let time = 0;

  for (let bill of USBill) {
    let isHave = false;

    if (bill?.committees) {
      for (let committee of bill?.committees) {
        if (committee.organizationUuid === organizationUuid) {
          isHave = true;
          break;
        }
      }
    }

    if (isHave) {
      if (!bill?.status || RECOGNIZED.includes(bill.status)) {
        USBill.forEach(bi => {
          if (bi.categorize === bill.categorize) {
            total++;
            if (bill.actions && bill.actions[0] && bill.actions[0].actionDate) {
              time += +new Date() - +bill.actions[0].actionDate;
            }
          }
        });
      }
    }
  }

  return total ? +(time / total).toFixed(2) : 0;
};
