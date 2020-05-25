import server from '../../www';
import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';

describe('sys', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(() => {
    agent = request.agent(server);
  });
  describe('GET /personList', () => {
    it('param empty', done => {
      agent
        .get('/sys/personList')
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .end(done);
    });

    it('"" name', done => {
      agent
        .get('/sys/personList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'Brock Adams',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"a" and max is 5', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/personList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  describe('GET /organizationList', () => {
    it('param empty', done => {
      agent
        .get('/sys/organizationList')
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .end(done);
    });

    it('"" name', done => {
      agent
        .get('/sys/organizationList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/organizationList')
        .query({
          name: 'House Foreign Affairs',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"a" and max is 5', done => {
      agent
        .get('/sys/organizationList')
        .query({
          name: 'H',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/organizationList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/organizationList')
        .query({
          name: 'H',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/organizationList')
        .query({
          name: 'H',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  describe('GET /policyAreaList', () => {
    it('param empty', done => {
      agent
        .get('/sys/policyAreaList')
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .end(done);
    });

    it('"" name', done => {
      agent
        .get('/sys/policyAreaList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/policyAreaList')
        .query({
          name: 'Education',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"a" and max is 5', done => {
      agent
        .get('/sys/policyAreaList')
        .query({
          name: 'A',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/policyAreaList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/policyAreaList')
        .query({
          name: 'A',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/policyAreaList')
        .query({
          name: 'A',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  describe('GET /legislativeSubjectsList', () => {
    it('param empty', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .end(done);
    });

    it('"" name', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name: 'Military command and structure',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"a" and max is 5', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name: 'A',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name: 'A',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/legislativeSubjectsList')
        .query({
          name: 'A',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  describe('GET /countryList', () => {
    it('param empty', done => {
      agent.get('/sys/countryList').expect(400, err => {
        done();
      });
    });

    it('"" name', done => {
      agent
        .get('/sys/countryList')
        .query({
          countryType: '1',
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/countryList')
        .query({
          countryType: 'countryName',
          name: '美国',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"国" and max is 5', done => {
      agent
        .get('/sys/countryList')
        .query({
          countryType: 'countryName',
          name: '国',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/countryList')
        .query({
          countryType: 'countryName',
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/countryList')
        .query({
          countryType: 'countryName',
          name: '国',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/countryList')
        .query({
          countryType: 'countryName',
          name: '国',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  describe('GET /policyOrganizationList', () => {
    it('param empty', done => {
      agent.get('/sys/policyOrganizationList').expect(400, err => {
        done();
      });
    });

    it('"" name', done => {
      agent
        .get('/sys/policyOrganizationList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/policyOrganizationList')
        .query({
          name: '欧盟（欧洲经济、政治共同体）',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"盟" and max is 5', done => {
      agent
        .get('/sys/policyOrganizationList')
        .query({
          name: '盟',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/policyOrganizationList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/policyOrganizationList')
        .query({
          name: '盟',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/policyOrganizationList')
        .query({
          name: '盟',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  afterEach(() => {
    server.close();
  });
});
