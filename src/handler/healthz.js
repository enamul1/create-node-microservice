const isRedisHealthy = require('../redis').isHealthy;
const isRabbitHealthy = require('../rabbit').isHealthy;

async function routeGet(req, res, next) {
  const redisHealthy = isRedisHealthy();
  const rabbitHealthy = isRabbitHealthy();

  if (!redisHealthy || !rabbitHealthy) {
    res.json(503, {
      healthy: false,
      redis: redisHealthy,
      rabbit: rabbitHealthy,
    });
    return next();
  }

  res.json({
    healthy: true,
    redis: true,
    rabbit: true,
  });

  return next();
}

module.exports = (server) => {
  server.get('/healthz', routeGet);
};
