import server from '../../www';
import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';

describe('sys', () => {
  let agent: request.SuperTest<request.Test>;
  let sponsorUuid = '';

  beforeEach(done => {
    agent = request.agent(server);
    agent
      .get('/sys/personList')
      .query({
        name: 'Brock Adams',
      })
      .then(res => {
        sponsorUuid = res.body[0].uuid;
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
          personUuid: sponsorUuid,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length >= 0);
        })
        .end(done);
    });

    it('"page" number is too large', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid: sponsorUuid,
          page: 999999,
          pageSize: 20,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length >= 0);
        })
        .end(done);
    });

    it('"page" number is too small', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid: sponsorUuid,
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
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('"pageSize" is too small', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid: sponsorUuid,
          pageSize: -1,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"pageSize" is too large', done => {
      agent
        .get('/relationship/sponsorAndCosponsor')
        .query({
          personUuid: sponsorUuid,
          pageSize: 9999999,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length >= 0);
        })
        .end(done);
    });
  });

  afterEach(() => {
    server.close();
  });
});
