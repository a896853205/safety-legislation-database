import { RESPONSE_CODE } from '../constants/domain-constants';
import { Middleware } from 'koa';

// 判断是否是参数错误
const isJoiError = (err: any) => err.isJoi;

// 判断是不是权限错误
// const isUnauthorizedError = err => err.status === RESPONSE_CODE.unauthorized;

let errorCatch: Middleware;
export default errorCatch = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isJoiError(err)) {
      const msg = err.message || '网络错误,请稍后再试';
      ctx.throw(RESPONSE_CODE.error, msg);
    }

    // if (isUnauthorizedError(err)) {
    //   const msg = '请重新登录';
    //   ctx.throw(RESPONSE_CODE.unauthorized, msg);
    // }

    ctx.throw(RESPONSE_CODE.serviceError, '网络错误,请稍后再试');
  }
};
