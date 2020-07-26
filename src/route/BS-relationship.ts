import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/relationship',
});

const billAndStatusSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/billAndStatus', async ctx => {
  try {
    const {
      billNumber,
      billCongress,
      page,
      pageSize,
    } = await billAndStatusSchema.validateAsync(ctx.query);

    let res = await service.getBillAndStatus(
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

const statusValueAndBillSchema = Joi.object({
  statusValue: Joi.number().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/statusValueAndBill', async ctx => {
  try {
    const {
      statusValue,
      page,
      pageSize,
    } = await statusValueAndBillSchema.validateAsync(ctx.query);

    let res = await service.getStatusValueAndBill(statusValue, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
