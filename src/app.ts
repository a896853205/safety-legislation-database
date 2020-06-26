import Koa from 'koa';
import cors from 'koa2-cors';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
import moment from 'moment';
import logger from 'koa-logger';
import routes from './route';
import errorCatch from './middle/error';
import dbInit from './db-connect';

dbInit();
const app = new Koa();

// cors
app.use(cors());

app.use(errorCatch);

// param
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json());

// log

if (process.env.NODE_ENV !== 'test') {
  app.use(logger(str => console.log(`${moment().format()} ${str}`)));
}

for (let route of routes) {
  app.use(route.routes());
}

app.on('error', async err => {
  // console.error(err.stack);
});

export default app;
