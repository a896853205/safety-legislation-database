import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';
import Joi from '@hapi/joi';

import server from '../../www';

describe('sys', () => {
  let agent: request.SuperTest<request.Test>;
  let personUuid = '';

  beforeEach(done => {
    agent = request.agent(server);
    agent
      .get('/sys/personList')
      .query({
        name: 'Brock Adams',
      })
      .then(res => {
        personUuid = res.body[0].uuid;
        done();
      });
  });

  describe('GET /sponsorAndCosponsor', () => {
    it('empty params', done => {
      agent.get('/relationship/sponsorAndCosponsor').expect(400, err => {
        done(err);
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
          done(err);
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
          done(err);
        });
    });
  });

  describe('GET /SCStatistics', () => {
    const resSchema = Joi.object({
      relativeBillTotal: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent.get('/relationship/SCStatistics').expect(400, err => done(err));
    });

    it('normal', done => {
      agent
        .get('/relationship/SCStatistics')
        .query({
          personUuid,
        })
        .expect(200)
        .expect(res => {
          resSchema.validate(res);
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
          resSchema.validate(res);
        })
        .end(done);
    });
  });

  afterEach(() => {
    server.close();
  });
});
