import Router from 'koa-router';
import send from 'koa-send';

const router = new Router({
  prefix: '/csv',
});

router.get('/:name', async ctx => {
  const name = ctx.params.name;
  const path = `dist-csv/${name}`;
  ctx.attachment(path);
  await send(ctx, path);
});

export default router;
