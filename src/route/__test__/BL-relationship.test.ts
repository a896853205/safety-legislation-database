import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';
import Joi from '@hapi/joi';

import server from '../../www';

describe('BL-relationship', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(done => {
    agent = request.agent(server);

    done();
  });

  describe('GET /billAndLegislativeSubjects', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/billAndLegislativeSubjects').expect(400, err => {
        done();
      });
    });

    it('one "billNumber" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/billAndLegislativeSubjects')
        .query({
          billNumber: 'H.Con.Res.78',
          billCongress: 114,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"page" number is too large', done => {
      agent
        .get('/relationship/billAndLegislativeSubjects')
        .query({
          billNumber: 'H.Con.Res.78',
          billCongress: 114,
          page: 999999,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"page" number is too small', done => {
      agent
        .get('/relationship/billAndLegislativeSubjects')
        .query({
          billNumber: 'H.Con.Res.78',
          billCongress: 114,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"billNumber" is not in bills', done => {
      agent
        .get('/relationship/billAndLegislativeSubjects')
        .query({
          billNumber: 'H.Con.Res.ASDAKJLSDLK',
          billCongress: 114,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"pageSize" is too small', done => {
      agent
        .get('/relationship/billAndLegislativeSubjects')
        .query({
          billNumber: 'H.Con.Res.78',
          billCongress: 114,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /legislativeSubjectsAndBill', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/legislativeSubjectsAndBill').expect(400, err => {
        done();
      });
    });

    it('one "legislativeSubjects" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/legislativeSubjectsAndBill')
        .query({
          legislativeSubjects: 'Computer security and identity theft',
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"page" number is too large', done => {
      agent
        .get('/relationship/legislativeSubjectsAndBill')
        .query({
          legislativeSubjects: 'Computer security and identity theft',
          page: 999999,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"page" number is too small', done => {
      agent
        .get('/relationship/legislativeSubjectsAndBill')
        .query({
          legislativeSubjects: 'Computer security and identity theft',
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"legislativeSubjects" is not in legislativeSubjects', done => {
      agent
        .get('/relationship/legislativeSubjectsAndBill')
        .query({
          legislativeSubjects: 'asdasdasdasdasfasfad',
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"pageSize" is too small', done => {
      agent
        .get('/relationship/legislativeSubjectsAndBill')
        .query({
          legislativeSubjects: 'Computer security and identity theft',
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /BLStatistics', () => {
    describe('GET /BLStatistics', () => {
      const resSchema = Joi.object({
        totalNum: Joi.number().min(0).required(),
      });

      it('empty params', done => {
        agent.get('/relationship/BLStatistics').expect(400, err => done());
      });

      it('normal', done => {
        agent
          .get('/relationship/BLStatistics')
          .query({
            billNumber: 'H.Con.Res.78',
            billCongress: 114,
          })
          .expect(200)
          .expect(res => {
            Joi.assert(res.body, resSchema);
          })
          .end(done);
      });

      it('"billCongress" not in bill', done => {
        agent
          .get('/relationship/BLStatistics')
          .query({
            billNumber: 'H.Con.Res.78',
            billCongress: 1231231,
          })
          .expect(200)
          .expect(res => {
            Joi.assert(res.body, resSchema);
          })
          .end(done);
      });
    });
  });
});
