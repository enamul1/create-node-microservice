/**
 * Establishes a Redis connection and reports health statuses back to
 * the /healthz endpoint.
 *
 * For Redis we use the [node-redis](https://github.com/NodeRedis/node_redis) library
 * and [redis-mock](https://github.com/yeahoffline/redis-mock#readme) for local testing.
 * Both support nearly all of the Redis commands, generally named 1-to-1, found
 * on the official [Redis documentation site](https://redis.io/commands)
 *
 * Note: if you don't plan on using Redis, you should delete this file and the code referencing
 * it's healthcheck at [src/handler/healthz.js](./handler/healthz.js).
 */

const redisPure = require('redis');
const redisMock = require('redis-mock');
const log = require('./log');

let connectionPool = [];

module.exports = {};

/**
 * Gets a connection for a specific vhost (environment, e.g.: qa1, qa2, etc.).
 * That connection will be listening for healthiness and will report unhealthy
 * if any errors cause it to be dropped which would trigger a pod restart.
 *
 * @param {string} vhost - qa1, qa2, etc. to prefix keys by
 * @return {object} instance of [node-redis](https://github.com/NodeRedis/node_redis)
 */
module.exports.default = function redis(vhost) {
  const config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || undefined,
    prefix: vhost,
  };

  const client = process.env.NODE_ENV === 'test'
    ? redisMock.createClient()
    : redisPure.createClient(config);

  connectionPool = [...connectionPool, {
    vhost,
    client,
    healthy: true,
    config,
  }];

  client.on('connect', () => {
    log('info', `Connected to Redis for ${vhost}`, config);
  });

  client.on('error', (err) => {
    log('errors', `Redis failure for ${vhost}`, { config, err });
    connectionPool.find(({ vhost: search }) => search === vhost).healthy = false;
  });

  return client;
};

/**
 * Returns true if a valid connection to Redis has been established without error.
 *
 * @return {boolean} healthy?
 */
module.exports.isHealthy = () => Boolean(connectionPool.find(({ healthy }) => !healthy));
