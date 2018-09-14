/**
 * Establishes a RabbitMQ connection and reports health statuses back to
 * the /healthz endpoint.
 *
 * For RabbitMQ we use the [amqplib](https://github.com/squaremo/amqp.node) library
 * and [amqplib-mocks)[https://github.com/bunk/amqplib-mocks#readme] for mocking/testing.
 *
 * Note: if you don't plan on using RabbitMQ, you should delete this file and the code referencing
 * it's healthcheck at [src/handler/healthz.js](./handler/healthz.js).
 *
 * Note: if you plan to use RabbitMQ as a subscriber/worker model, see
 * [src/rabbitWorker.js](./src/rabbitWorkerjs)
 *
 * Note: the vhost
 * vhost strategy for servics.
 */

const amqp = require('amqplib');
const amqpmocks = require('amqplib-mocks');
const log = require('./log');

let connectionPool = [];

module.exports = {};

/**
 * Gets a connection for a specific vhost (environment, e.g.: qa1, qa2, etc.).
 * That connection will be listening for healthiness and will report unhealthy
 * if any errors cause it to be dropped which would trigger a pod restart.
 *
 * @param {string} vhost - qa1, qa2, etc. to set RabbitMQ's vhost to (will append to the url)
 * @return {object} instance of [amqplib](https://github.com/squaremo/amqp.node)
 */
module.exports.default = async function rabbit(vhost) {
  const lib = process.env.NODE_ENV === 'test'
    ? amqpmocks
    : amqp;

  const url = `${process.env.RABBITMQ_URL}/${vhost}`;
  const conn = await lib.connect(url);
  const channel = await conn.createChannel();

  connectionPool = [...connectionPool, {
    vhost,
    conn,
    channel,
    url,
    healthy: true,
  }];

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => {
      channel.close();
      connectionPool.find(({ vhost: search }) => search === vhost).healthy = false;
    });
  });

  log('info', 'Connected to RabbitMQ', {
    host: process.env.RABBITMQ_URL,
    vhost,
    url,
  });

  return channel;
};

/**
 * Returns true if a valid connection to Redis has been established without error.
 *
 * @return {boolean} healthy?
 */
module.exports.isHealthy = () => Boolean(connectionPool.find(({ healthy }) => !healthy));
