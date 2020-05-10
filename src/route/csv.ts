import Router from 'koa-router';
import send from 'koa-send';
import service from '../service';

const router = new Router({
  prefix: '/csv',
});

router.get('/:name', async ctx => {
  const name = ctx.params.name;

  switch (name) {
    case 'committee.csv':
      await service.committeeCsvInit();
      break;
    case 'person.csv':
      // await service.committeeCsvInit();
      break;
    default:
      console.error('没有相关csv文件');
  }

  const path = `dist-csv/${name}`;
  ctx.attachment(path);
  await send(ctx, path);
});

export default router;
