import Sequelize from 'sequelize';

import Bill from '../../models/bill';
import Country from '../../models/country';
import Cosponsor from '../../models/cosponsor';
import LegislativeSubject from '../../models/legislative-subject';
import Person from '../../models/person';

const Op = Sequelize.Op;

// 获取美国法案
export const getUSBill = async () =>
  Bill.findAll({
    include: [
      {
        model: Country,
        attributes: ['uuid'],
        where: {
          name: '美国',
        },
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
    ],
  });

// 获取美国所有人uuid
export const getUSPerson = async () => {
  const personSet = new Set<string>();

  const USBill = await Bill.findAll({
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
