#!/usr/bin/env node
/**
 * Module dependencies.
 */

import http from 'http';
import debug from 'debug';
import app from './app';
import config from './config';

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
interface HttpError extends Error {
  syscall: string;
  code: string;
}

function onError(error: HttpError) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : '端口 ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' 需要提升权限');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' 已经被使用');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (): void => {
  let addr = server.address();
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  debug('Listening on ' + bind);
};

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || config.port || '4400');

console.log(`Server running on ${port}`);
/**
 * Create HTTP server.
 */

let server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
