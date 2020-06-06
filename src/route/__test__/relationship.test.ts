import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';
import Joi from '@hapi/joi';

import server from '../../www';

describe('relationship', () => {
  let agent: request.SuperTest<request.Test>;
  let personUuid = '';
  let organizationUuid = '';

  beforeEach(done => {
    agent = request.agent(server);
    (async () => {
      let [personRes, organizationRes] = await Promise.all([
        agent.get('/sys/personList').query({
          name: 'Brock Adams',
        }),
        agent.get('/sys/organizationList').query({
          name: 'House Foreign Affairs',
        }),
      ]);
      personUuid = personRes.body[0].uuid;
      organizationUuid = organizationRes.body[0].uuid;
      done();
    })();
  });

  describe('GET /sponsorAndCosponsor', () => {
    it('empty params', done => {
      agent.get('/relationship/sponsorAndCosponsor').expect(400, err => {
        done();
      });
    });

    it('one "personUuid" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body.data));
          assert(res.body.data.length >= 0);
          assert(res.body.totalNum >= 0);
        })
        .end(done);
    });

    it('"page" number is too large', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid,
          page: 999999,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body.data));
          assert(res.body.data.length === 0);
          assert(res.body.totalNum === 0);
        })
        .end(done);
    });

    it('"page" number is too small', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"personUuid" is not in person', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid: 'asdajskajfhaksdad65123asd89cascxczaf',
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body.data));
          assert(res.body.data.length === 0);
          assert(res.body.totalNum === 0);
        })
        .end(done);
    });

    it('"pageSize" is too small', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /SCStatistics', () => {
    const resSchema = Joi.object({
      relativeBillTotal: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/SCStatistics').expect(400, err => done());
    });

    it('normal', done => {
      agent
        .get('/relationship/SCStatistics')
        .query({
          personUuid,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"personUuid" not in person', done => {
      agent
        .get('/relationship/SCStatistics')
        .query({
          personUuid: 'abcdefghijklmn',
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });
  });

  describe('GET /OBCommittee', () => {
    // 需要拆成4个路由
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/OBCommittee').expect(400, err => {
        done();
      });
    });

    it('one "organizationUuid" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/OBCommittee')
        .query({
          organizationUuid,
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
        .get('/relationship/OBCommittee')
        .query({
          organizationUuid,
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
        .get('/relationship/OBCommittee')
        .query({
          organizationUuid,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"organizationUuid" is not in organization', done => {
      agent
        .get('/relationship/OBCommittee')
        .query({
          organizationUuid: 'asdajskajfhaksdad65123asd89cascxczaf',
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
        .get('/relationship/OBCommittee')
        .query({
          organizationUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /OBConstraint', () => {
    // 需要拆成4个路由
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/OBConstraint').expect(400, err => {
        done();
      });
    });

    it('one "organizationUuid" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/OBConstraint')
        .query({
          organizationUuid,
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
        .get('/relationship/OBConstraint')
        .query({
          organizationUuid,
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
        .get('/relationship/OBConstraint')
        .query({
          organizationUuid,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"organizationUuid" is not in organization', done => {
      agent
        .get('/relationship/OBConstraint')
        .query({
          organizationUuid: 'asdajskajfhaksdad65123asd89cascxczaf',
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
        .get('/relationship/OBConstraint')
        .query({
          organizationUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /OBExecutor', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/OBExecutor').expect(400, err => {
        done();
      });
    });

    it('one "organizationUuid" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/OBExecutor')
        .query({
          organizationUuid,
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
        .get('/relationship/OBExecutor')
        .query({
          organizationUuid,
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
        .get('/relationship/OBExecutor')
        .query({
          organizationUuid,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"organizationUuid" is not in organization', done => {
      agent
        .get('/relationship/OBExecutor')
        .query({
          organizationUuid: 'asdajskajfhaksdad65123asd89cascxczaf',
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
        .get('/relationship/OBExecutor')
        .query({
          organizationUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });
  describe('GET /OBRelatedObject', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/OBRelatedObject').expect(400, err => {
        done();
      });
    });

    it('one "organizationUuid" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/OBRelatedObject')
        .query({
          organizationUuid,
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
        .get('/relationship/OBRelatedObject')
        .query({
          organizationUuid,
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
        .get('/relationship/OBRelatedObject')
        .query({
          organizationUuid,
          page: -1,
          pageSize: 20,
        })
        .expect(400, err => {
          done();
        });
    });

    it('"organizationUuid" is not in organization', done => {
      agent
        .get('/relationship/OBRelatedObject')
        .query({
          organizationUuid: 'asdajskajfhaksdad65123asd89cascxczaf',
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
        .get('/relationship/OBRelatedObject')
        .query({
          organizationUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done();
        });
    });
  });

  describe('GET /OBStatistics', () => {
    const resSchema = Joi.object({
      relativeBillNum: Joi.number().min(0).required(),
      committeeNum: Joi.number().min(0).required(),
      constraintNum: Joi.number().min(0).required(),
      executorNum: Joi.number().min(0).required(),
      relatedObjectNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/OBStatistics').expect(400, err => done());
    });

    it('normal', done => {
      agent
        .get('/relationship/OBStatistics')
        .query({
          organizationUuid,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });

    it('"organizationUuid" not in organization', done => {
      agent
        .get('/relationship/OBStatistics')
        .query({
          organizationUuid: 'abcdefghijklmn',
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });
  });

  describe('GET /billAndOrganization', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/billAndOrganization').expect(400, err => {
        done();
      });
    });

    it('one "billNumber" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/billAndOrganization')
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
        .get('/relationship/billAndOrganization')
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
        .get('/relationship/billAndOrganization')
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
        .get('/relationship/billAndOrganization')
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
        .get('/relationship/billAndOrganization')
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

  describe('GET /BOStatistics', () => {
    const resSchema = Joi.object({
      committeeNum: Joi.number().min(0).required(),
      constraintNum: Joi.number().min(0).required(),
      executorNum: Joi.number().min(0).required(),
      relatedObjectNum: Joi.number().min(0).required(),
      cosponsorNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/BOStatistics').expect(400, err => done());
    });

    it('normal', done => {
      agent
        .get('/relationship/BOStatistics')
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

    it('"billNumber" not in bill', done => {
      agent
        .get('/relationship/BOStatistics')
        .query({
          billNumber: 'asdasfasfwqeqwd',
          billCongress: 114,
        })
        .expect(200)
        .expect(res => {
          Joi.assert(res.body, resSchema);
        })
        .end(done);
    });
  });

  afterEach(() => {
    server.close();
  });
});
