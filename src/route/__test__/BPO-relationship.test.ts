import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';
import Joi from '@hapi/joi';

import server from '../../www';

describe('BC-relationship', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(done => {
    agent = request.agent(server);

    done();
  });

  describe('GET /billAndLegislativeOrganization', () => {
    const resSchema = Joi.object({
      data: Joi.array().required(),
      totalNum: Joi.number().min(0).required(),
    });

    it('empty params', done => {
      agent
        .get('/relationship/billAndLegislativeOrganization')
        .expect(400, err => {
          done();
        });
    });

    it('one "billNumber" and no "page" (default is 1)', done => {
      agent
        .get('/relationship/billAndLegislativeOrganization')
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
        .get('/relationship/billAndLegislativeOrganization')
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
        .get('/relationship/billAndLegislativeOrganization')
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
        .get('/relationship/billAndLegislativeOrganization')
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
        .get('/relationship/billAndLegislativeOrganization')
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

  // describe('GET /countryAndBill', () => {
  //   const resSchema = Joi.object({
  //     data: Joi.array().required(),
  //     totalNum: Joi.number().min(0).required(),
  //   });

  //   it('empty params', done => {
  //     agent.get('/relationship/countryAndBill').expect(400, err => {
  //       done();
  //     });
  //   });

  //   it('one "countryUuid" and no "page" (default is 1)', done => {
  //     agent
  //       .get('/relationship/countryAndBill')
  //       .query({
  //         countryUuid: 'd78281b4-96b6-11ea-bcbc-b3fdec34ea84',
  //         pageSize: 20,
  //       })
  //       .expect(200)
  //       .expect(res => {
  //         Joi.assert(res.body, resSchema);
  //       })
  //       .end(done);
  //   });

  //   it('"page" number is too large', done => {
  //     agent
  //       .get('/relationship/countryAndBill')
  //       .query({
  //         countryUuid: 'd78281b4-96b6-11ea-bcbc-b3fdec34ea84',
  //         page: 999999,
  //         pageSize: 20,
  //       })
  //       .expect(200)
  //       .expect(res => {
  //         Joi.assert(res.body, resSchema);
  //       })
  //       .end(done);
  //   });

  //   it('"page" number is too small', done => {
  //     agent
  //       .get('/relationship/countryAndBill')
  //       .query({
  //         countryUuid: 'd78281b4-96b6-11ea-bcbc-b3fdec34ea84',
  //         page: -1,
  //         pageSize: 20,
  //       })
  //       .expect(400, err => {
  //         done();
  //       });
  //   });

  //   it('"countryUuid" is not in countries', done => {
  //     agent
  //       .get('/relationship/countryAndBill')
  //       .query({
  //         countryUuid: 'asdasdasdafasd',
  //         pageSize: 20,
  //       })
  //       .expect(200)
  //       .expect(res => {
  //         Joi.assert(res.body, resSchema);
  //       })
  //       .end(done);
  //   });

  //   it('"pageSize" is too small', done => {
  //     agent
  //       .get('/relationship/countryAndBill')
  //       .query({
  //         countryUuid: 'd78281b4-96b6-11ea-bcbc-b3fdec34ea84',
  //         pageSize: -1,
  //       })
  //       .expect(400, err => {
  //         done();
  //       });
  //   });
  // });

  describe('GET /BPOStatistics', () => {
    describe('GET /BPOStatistics', () => {
      const resSchema = Joi.object({
        totalNum: Joi.number().min(0).required(),
      });

      it('empty params', done => {
        agent.get('/relationship/BPOStatistics').expect(400, err => done());
      });

      it('normal', done => {
        agent
          .get('/relationship/BPOStatistics')
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
          .get('/relationship/BPOStatistics')
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

  // describe('GET /CBStatistics', () => {
  //   describe('GET /CBStatistics', () => {
  //     const resSchema = Joi.object({
  //       relativeBillTotal: Joi.number().min(0).required(),
  //     });

  //     it('empty params', done => {
  //       agent.get('/relationship/CBStatistics').expect(400, err => done());
  //     });

  //     it('normal', done => {
  //       agent
  //         .get('/relationship/CBStatistics')
  //         .query({
  //           countryUuid: 'd78281b4-96b6-11ea-bcbc-b3fdec34ea84',
  //         })
  //         .expect(200)
  //         .expect(res => {
  //           Joi.assert(res.body, resSchema);
  //         })
  //         .end(done);
  //     });

  //     it('"countryUuid" not in countries', done => {
  //       agent
  //         .get('/relationship/CBStatistics')
  //         .query({
  //           countryUuid: 'asdczxcasdqweasd',
  //         })
  //         .expect(200)
  //         .expect(res => {
  //           Joi.assert(res.body, resSchema);
  //         })
  //         .end(done);
  //     });
  //   });
  // });
});
