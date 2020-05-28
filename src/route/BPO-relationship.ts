import Router from 'koa-router';
import service from '../service';
import Joi from '@hapi/joi';

const router = new Router({
  prefix: '/relationship',
});

const billAndLegislativeOrganizationSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/billAndLegislativeOrganization', async ctx => {
  try {
    const {
      billNumber,
      billCongress,
      page,
      pageSize,
    } = await billAndLegislativeOrganizationSchema.validateAsync(ctx.query);

    let res = await service.getBillAndLegislativeOrganization(
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

const policyOrganizationAndBillSchema = Joi.object({
  policyOrganizationUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/policyOrganizationAndBill', async ctx => {
  try {
    const {
      policyOrganizationUuid,
      page,
      pageSize,
    } = await policyOrganizationAndBillSchema.validateAsync(ctx.query);

    let res = await service.getPolicyOrganizationAndBill(
      policyOrganizationUuid,
      page,
      pageSize
    );

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const POBStatisticsSchema = Joi.object({
  policyOrganizationUuid: Joi.string().required(),
});
router.get('/POBStatistics', async ctx => {
  try {
    const { policyOrganizationUuid } = await POBStatisticsSchema.validateAsync(
      ctx.query
    );

    let res = await service.getPOBStatistics(policyOrganizationUuid);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const BPOStatisticsSchema = Joi.object({
  billNumber: Joi.string().required(),
  billCongress: Joi.number().required(),
});
router.get('/BPOStatistics', async ctx => {
  try {
    const {
      billNumber,
      billCongress,
    } = await BPOStatisticsSchema.validateAsync(ctx.query);

    let res = await service.getBPOStatistics(billNumber, billCongress);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
