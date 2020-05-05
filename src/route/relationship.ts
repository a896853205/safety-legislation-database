import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/relationship',
});

const sponsorAndCosponsorSchema = Joi.object({
  personUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/sponsorAndCosponsor', async ctx => {
  try {
    const {
      personUuid,
      page,
      pageSize,
    } = await sponsorAndCosponsorSchema.validateAsync(ctx.query);

    let res = await service.getSponsorAndCosponsor(personUuid, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
