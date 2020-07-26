import dbInit from './db-connect';
import countryInit from './init/country-init';
import billInit from './init/bill-init';
import subjectInit from './init/subject-init';
import wordInit from './init/word-init';
import amendBillInit from './init/amend-bill-init';
import shortTitleInit from './init/short-title-init';
import officialTitleInit from './init/official-title-init';
import amendment from './init/amendment-init';
import relatedBill from './init/related-bill-init';
import person from './init/person-init';
import action from './init/action-init';
import cosponsor from './init/cosponsor-init';
import committee from './init/committee-init';
import committeeActivity from './init/committee-activity-init';
import committeeSub from './init/committee-sub-init';
import committeeSubActivity from './init/committee-sub-activity';
import organization from './init/organization-init';

import ora from 'ora';
import moment from 'moment';

moment.locale('en');
const db = dbInit();
ora.promise(
  (async () => {
    try {
      await db.sync({
        force: true,
      });

      await countryInit();
      await person();
      await billInit();
      await organization();
      await Promise.all([
        subjectInit(),
        wordInit(),
        amendBillInit(),
        shortTitleInit(),
        officialTitleInit(),
        amendment(),
        relatedBill(),
        action(),
        cosponsor(),
        committee(),
      ]);
      await Promise.all([committeeSub(), committeeActivity()]);
      await committeeSubActivity();
    } catch (error) {
      console.error(error);
    }
  })(),
  {
    text: 'Database init',
  }
);
