import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/relationship',
});

const billAndLegislativeSubjectsSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/billAndLegislativeSubjects', async ctx => {
  try {
    const {
      billNumber,
      billCongress,
      page,
      pageSize,
    } = await billAndLegislativeSubjectsSchema.validateAsync(ctx.query);

    let res = await service.getBillAndLegislativeSubjects(
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

const legislativeSubjectsAndBillSchema = Joi.object({
  legislativeSubjects: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/legislativeSubjectsAndBill', async ctx => {
  try {
    const {
      legislativeSubjects,
      page,
      pageSize,
    } = await legislativeSubjectsAndBillSchema.validateAsync(ctx.query);

    let res = await service.getLegislativeSubjectsAndBill(
      legislativeSubjects,
      page,
      pageSize
    );

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const BLStatisticsSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
});
router.get('/BLStatistics', async ctx => {
  try {
    const { billNumber, billCongress } = await BLStatisticsSchema.validateAsync(
      ctx.query
    );

    let res = await service.getBLStatistics(billNumber, billCongress);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
