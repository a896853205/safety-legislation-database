import Router from 'koa-router';
import send from 'koa-send';
import service from '../service';

const router = new Router({
  prefix: '/csv',
});

router.get('/committee.csv', async ctx => {
  await service.committeeCsvInit();

  const path = `dist-csv/committee.csv`;
  ctx.attachment(path);
  await send(ctx, path);
});

router.get('/person.csv', async ctx => {

  await service.personCsvInit();

  const path = `dist-csv/person.csv`;
  ctx.attachment(path);
  await send(ctx, path);
});

router.get('/person-relationship.csv/:billUuid', async ctx => {
  const billUuid = ctx.params.billUuid;

  await service.personRelationshipCsvInit(billUuid);

  const path = `dist-csv/person-relationship.csv`;
  ctx.attachment(path);
  await send(ctx, path);
});

export default router;
