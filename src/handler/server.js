const restify = require('restify');
const errors = require('restify-errors');
const handlers = require('./index');
const contextMiddleware = require('./contextMiddleware');
// const rabbitWorker = require('../rabbitWorker');
const log = require('../log');

// [Restify - creating a server](http://restify.com/docs/home/)
const server = restify.createServer({
  /*
  formatters: {
    'application/json': (request, response, body) => {
      if (body instanceof Error) {
        response.statusCode = body.statusCode || 500;
        console.error(body.message);
        return { message: body.message };
      }

      return body;
    },
  },
  */
});

server.pre(restify.plugins.pre.dedupeSlashes());
server.pre(restify.plugins.pre.context());
server.pre(restify.plugins.pre.userAgentConnection());

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.dateParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.requestLogger());
server.use(restify.plugins.gzipResponse());

if (process.env.NODE_ENV === 'production') {
  server.use(
    restify.plugins.throttle({
      burst: 10, // Max 10 concurrent requests (if tokens)
      rate: 0.5, // Steady state: 1 request / 2 seconds
      ip: true, // throttle per IP
      overrides: {
        '127.0.0.1': {
          burst: 0,
          rate: 0, // unlimited
        },
      },
    }),
  );

  server.use(
    restify.plugins.inflightRequestThrottle({
      limit: 100,
      server,
      err: new errors.InternalServerError(
        'server overwhelmed, please try again in a few moments',
      ),
    }),
  );
}

server.use(contextMiddleware);

handlers(server);

// Cleanly terminate on response to CTRL-C or OS kills
['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => {
  server.close();
}));

server.listen(process.env.NODE_ENV === 'test' ? 9999 : process.env.PORT, () => log('info', `Listening on port ${process.env.PORT}`, {
  port: process.env.PORT,
}));

// Remove this if you don't plan on using RabbitMQ as a consumer of events
// rabbitWorker();
