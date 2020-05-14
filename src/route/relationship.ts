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

const SCStatisticsSchema = Joi.object({
  personUuid: Joi.string().required(),
});
router.get('/SCStatistics', async ctx => {
  try {
    const { personUuid } = await SCStatisticsSchema.validateAsync(ctx.query);

    let res = await service.getSCStatistics(personUuid);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const OBCommitteeSchema = Joi.object({
  organizationUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/OBCommittee', async ctx => {
  try {
    const {
      organizationUuid,
      page,
      pageSize,
    } = await OBCommitteeSchema.validateAsync(ctx.query);

    let res = await service.getOBCommittee(organizationUuid, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const OBConstraintSchema = Joi.object({
  organizationUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/OBConstraint', async ctx => {
  try {
    const {
      organizationUuid,
      page,
      pageSize,
    } = await OBConstraintSchema.validateAsync(ctx.query);

    let res = await service.getOBConstraint(organizationUuid, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const OBRelatedObjectSchema = Joi.object({
  organizationUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/OBRelatedObject', async ctx => {
  try {
    const {
      organizationUuid,
      page,
      pageSize,
    } = await OBRelatedObjectSchema.validateAsync(ctx.query);

    let res = await service.getOBRelatedObject(
      organizationUuid,
      page,
      pageSize
    );

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const OBExecutorSchema = Joi.object({
  organizationUuid: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).required(),
});
router.get('/OBExecutor', async ctx => {
  try {
    const {
      organizationUuid,
      page,
      pageSize,
    } = await OBExecutorSchema.validateAsync(ctx.query);

    let res = await service.getOBExecutor(organizationUuid, page, pageSize);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

const OBStatisticsSchema = Joi.object({
  organizationUuid: Joi.string().required(),
});
router.get('/OBStatistics', async ctx => {
  try {
    const { organizationUuid } = await OBStatisticsSchema.validateAsync(
      ctx.query
    );

    let res = await service.getOBStatistics(organizationUuid);

    ctx.body = res;
  } catch (error) {
    throw error;
  }
});

export default router;
