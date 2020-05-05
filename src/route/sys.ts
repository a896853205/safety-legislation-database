import Router from 'koa-router';
import Res from '../util/response';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/sys',
});

const personListSchema = Joi.object({
  name: Joi.string().max(255),
});
router.get('/personList', async ctx => {
  try {
    const value = await personListSchema.validateAsync(ctx.query);

    let res = await service.getPersonList(value.name);

    ctx.body = new Res({
      data: res,
    });
  } catch (error) {
    throw(error);
  }
});

export default router;
