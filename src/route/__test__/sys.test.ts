import server from '../../www';
import request = require('supertest');
import assert = require('assert');

describe('sys', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(() => {
    agent = request(server);
  });
  describe('GET /personList', () => {
    it('param empty', () => {
      agent.get('/sys/personList').end((_err, res) => {
        assert(Array.isArray(res.body.data));
      });
    });

    it('one name', () => {
      agent
        .get('/sys/personList')
        .query({
          name: 'A',
        })
        .end((_err, res) => {
          assert(Array.isArray(res.body.data));
        });
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
        .expect(400)
        .end(err => {
          done(err);
        })
    });
  });

  afterEach(() => {
    server.close();
  });
});
