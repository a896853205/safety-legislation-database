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

// const countryAndBillSchema = Joi.object({
//   countryUuid: Joi.string().required(),
//   page: Joi.number().min(1).default(1),
//   pageSize: Joi.number().min(1).required(),
// });
// router.get('/countryAndBill', async ctx => {
//   try {
//     const {
//       countryUuid,
//       page,
//       pageSize,
//     } = await countryAndBillSchema.validateAsync(ctx.query);

//     let res = await service.getCountryAndBill(countryUuid, page, pageSize);

//     ctx.body = res;
//   } catch (error) {
//     throw error;
//   }
// });

// const CBStatisticsSchema = Joi.object({
//   countryUuid: Joi.string().required(),
// });
// router.get('/CBStatistics', async ctx => {
//   try {
//     const { countryUuid } = await CBStatisticsSchema.validateAsync(ctx.query);

//     let res = await service.getCBStatistics(countryUuid);

//     ctx.body = res;
//   } catch (error) {
//     throw error;
//   }
// });

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
