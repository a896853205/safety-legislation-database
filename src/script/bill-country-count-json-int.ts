import fs from 'fs';
import path from 'path';

import dbInit from '../db-connect';
import Bill from '../models/bill';
import Country from '../models/country';
import politicalOrganization from '../models/political-organization';

class SState {
  name: string = '';
  count: number = 1;

  constructor(name: string) {
    this.name = name;
  }
}

class SSPOF {
  name: string = '';
  count: number = 1;

  constructor(name: string) {
    this.name = name;
  }
}

class RelativeJson {
  data: string[][] = [];
  state: SState[][] = [];
  politicalOrganization: SSPOF[][] = [];

  constructor(name: string) {
    let buffer = fs.readFileSync(path.resolve(__dirname, '../json/', name));
    this.data = JSON.parse(buffer.toString());
  }

  addPOData(PO: SSPOF, arrIndex: number) {
    let foundPO;
    let curArr = this.politicalOrganization[arrIndex];

    if (curArr) {
      foundPO = this.politicalOrganization[arrIndex].find((item: SSPOF) => {
        return item.name === PO.name;
      });
    }

    if (foundPO) {
      foundPO.count++;
    } else {
      if (curArr) {
        curArr.push(PO);
      } else {
        this.politicalOrganization[arrIndex] = [PO];
      }
    }
  }

  addStateData(state: SState, arrIndex: number) {
    let foundState;
    let curArr = this.state[arrIndex];

    if (curArr) {
      foundState = this.state[arrIndex].find((item: SState) => {
        return item.name === state.name;
      });
    }

    if (foundState) {
      foundState.count++;
    } else {
      if (curArr) {
        curArr.push(state);
      } else {
        this.state[arrIndex] = [state];
      }
    }
  }

  statisticsCountryInfo(billArr: Bill[]) {
    let errArr: string[] = [];
    this.data.forEach((relativeArr, arrIndex) => {
      relativeArr.forEach(relative => {
        let number: string,
          congress: string | null = null;
        let relativeItemArr: string[] = relative.split('-');

        if (relativeItemArr.length === 1) {
          number = relativeItemArr[0];
        } else {
          let relativeItem = relativeItemArr.pop();
          congress = relativeItem ? relativeItem : null;

          number = relativeItemArr.join('-');
        }

        let foundBill = billArr.find(bill => {
          return (
            bill.number === number &&
            bill.congress === (congress ? Number(congress) : congress)
          );
        });

        if (foundBill) {
          if (foundBill.country?.territory) {
            this.addStateData(
              new SState(foundBill.country?.territory),
              arrIndex
            );
          }

          if (foundBill.country?.politicalOrganizations?.length) {
            foundBill.country.politicalOrganizations.forEach(PO => {
              if (PO?.name) {
                this.addPOData(new SSPOF(PO.name), arrIndex);
              }
            });
          }
        } else {
          errArr.push(`法案number: ${number} congress: ${congress}找不到`);
        }
      });
    });

    if (errArr.length) {
      console.table(errArr);
      throw new Error(`一共${errArr.length}对不上的.`);
    }
  }
}

dbInit();

(async () => {
  try {
    let bill = await Bill.findAll({
      attributes: ['number', 'congress'],
      include: [
        {
          model: Country,
          attributes: ['territory'],
          include: [
            {
              model: politicalOrganization,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    let relativeJson = new RelativeJson('country-in.json');
    relativeJson.statisticsCountryInfo(bill);

    fs.writeFileSync(
      path.resolve(__dirname, '../../dist-json/country-statistics.json'),
      JSON.stringify(relativeJson)
    );
  } catch (error) {
    console.error(error);
  }
})();
