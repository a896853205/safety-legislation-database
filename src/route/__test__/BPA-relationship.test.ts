import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';
import Joi from '@hapi/joi';

import server from '../../www';

describe('BPA-relationship', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(done => {
    agent = request.agent(server);

    done();
  });

  describe('GET /billAndPolicyArea', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/billAndPolicyArea').expect(400, err => {
        done();
      });
    });

    it('one "billNumber" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/billAndPolicyArea')
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
        .get('/relationship/billAndPolicyArea')
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
        .get('/relationship/billAndPolicyArea')
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
        .get('/relationship/billAndPolicyArea')
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
        .get('/relationship/billAndPolicyArea')
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

  describe('GET /policyAreaAndBill', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/policyAreaAndBill').expect(400, err => {
        done();
      });
    });

    it('one "policyArea" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/policyAreaAndBill')
        .query({
          policyArea: 'GovernmentOperationsandPolitics',
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
        .get('/relationship/policyAreaAndBill')
        .query({
          policyArea: 'GovernmentOperationsandPolitics',
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
        .get('/relationship/policyAreaAndBill')
        .query({
          policyArea: 'GovernmentOperationsandPolitics',
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"policyArea" is not in bills', done => {
      agent
        .get('/relationship/policyAreaAndBill')
        .query({
          policyArea: 'asdasdwqf',
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
        .get('/relationship/policyAreaAndBill')
        .query({
          policyArea: 'GovernmentOperationsandPolitics',
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /PBStatistics', () => {
    describe('GET /PBStatistics', () => {
      const resSchema = Joi.object({
        relativeBillTotal: Joi.number().min(0).required(),
      });

      it('empty params', done => {
        agent.get('/relationship/PBStatistics').expect(400, err => done());
      });

      it('normal', done => {
        agent
          .get('/relationship/PBStatistics')
          .query({
            policyArea: 'GovernmentOperationsandPolitics',
          })
          .expect(200)
          .expect(res => {
            Joi.assert(res.body, resSchema);
          })
          .end(done);
      });

      it('"policyArea" not in policyArea', done => {
        agent
          .get('/relationship/PBStatistics')
          .query({
            policyArea: 'asdasdasdadsad',
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
