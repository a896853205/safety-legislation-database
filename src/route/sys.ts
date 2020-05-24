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

const organizationListSchema = Joi.object({
  name: Joi.string().max(255).empty(''),
  max: Joi.number().min(1),
});
router.get('/organizationList', async ctx => {
  try {
    const { name, max } = await organizationListSchema.validateAsync(ctx.query);

    let res = await service.getOrganizationList(name, max);

    ctx.body = res;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

const policyAreaListSchema = Joi.object({
  name: Joi.string().max(255).empty(''),
  max: Joi.number().min(1),
});
router.get('/policyAreaList', async ctx => {
  try {
    const { name, max } = await policyAreaListSchema.validateAsync(ctx.query);

    let res = await service.getPolicyAreaList(name, max);

    ctx.body = res;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

const legislativeSubjectsListSchema = Joi.object({
  name: Joi.string().max(255).empty(''),
  max: Joi.number().min(1),
});
router.get('/legislativeSubjectsList', async ctx => {
  try {
    const { name, max } = await legislativeSubjectsListSchema.validateAsync(
      ctx.query
    );

    let res = await service.getLegislativeSubjectsList(name, max);

    ctx.body = res;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

const countryListSchema = Joi.object({
  countryType: Joi.string().required().empty(),
  name: Joi.string().max(255).empty(''),
  max: Joi.number().min(1),
});
router.get('/countryList', async ctx => {
  try {
    const { name, max, countryType } = await countryListSchema.validateAsync(ctx.query);

    let res = await service.getCountryList(name, max, countryType);

    ctx.body = res;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export default router;
