import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/relationship',
});

const billAndPolicyAreaSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/billAndPolicyArea', async ctx => {
  try {
    const {
      billNumber,
      billCongress,
      page,
      pageSize,
    } = await billAndPolicyAreaSchema.validateAsync(ctx.query);

    let res = await service.getBillAndPolicyArea(
      billNumber,
      billCongress,
      page,
      pageSize
    );

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const policyAreaAndBillSchema = Joi.object({
  policyArea: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/policyAreaAndBill', async ctx => {
  try {
    const {
      policyArea,
      page,
      pageSize,
    } = await policyAreaAndBillSchema.validateAsync(ctx.query);

    let res = await service.getPolicyAreaAndBill(policyArea, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const PBStatisticsSchema = Joi.object({
  policyArea: Joi.string().required(),
});
router.get('/PBStatistics', async ctx => {
  try {
    const {
      policyArea
    } = await PBStatisticsSchema.validateAsync(ctx.query);

    let res = await service.getPBStatistics(policyArea);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
