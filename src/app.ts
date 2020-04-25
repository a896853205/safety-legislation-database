import Koa from 'koa';
import cors from 'koa2-cors';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
import moment from 'moment';
import logger from 'koa-logger';
import routes from './route';

const app = new Koa();

// cors
app.use(cors());

// param
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json());

for (let route of routes) {
  app.use(route.routes());
}

// log
app.use(logger(str => console.log(`${moment().format()} ${str}`)));

export default app;
