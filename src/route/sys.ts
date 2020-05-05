import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/sys',
});

const personListSchema = Joi.object({
  name: Joi.string().max(255).empty(''),
  max: Joi.number().min(1),
});
router.get('/personList', async ctx => {
  try {
    const { name, max } = await personListSchema.validateAsync(ctx.query);

    let res = await service.getPersonList(name, max);

    ctx.body = res;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export default router;
