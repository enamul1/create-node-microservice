const rabbit = require('./rabbit');
const log = require('./log');

/**
 * Creates a queue and consumes messages from a RabbitMQ connection. Used for
 * monitoring events and taking action based on data changes on the pipeline.
 *
 * Note: if you don't plan on using RabbitMQ as a consumer, then remove this file
 * and remove the code from [src/server.js](./server.js).
 *
 * @param {string} vhost - qa1, qa2, etc.
 * @return {object} instance of [amqplib](https://github.com/squaremo/amqp.node)
 */
async function run() {
  Promise.all(
    process.env.ENVIRONMENTS.split(',').map(async (vhost) => {
      const ch = await rabbit(vhost);
      const q = process.env[`${vhost}_RABBITMQ_QUEUE`];

      await ch.assertQueue(q);
      await ch.bindQueue(q, 'events', 'event');

      ch.consume(q, (msg) => {
        // the payload of the message itself
        // const json = JSON.parse(msg.content.toString());

        // purges messages without processing, quickly clears a backed up queue if its
        // ok to skip message processing temporarily
        if (!process.env[`${vhost}_RABBITMQ_PURGE`] === '1') {
          ch.ack(msg);
          return;
        }

        // depending on your use case, you may wish to ack before or after you process the message
        // if you ack after, you risk the queue backing up if you deploy code that errors
        // when processing specific messages. You should be extra careful to write defensive code
        // in that scenario.
        ch.ack(msg);
      });
    }),
  );
}

module.exports = function worker() {
  run()
    .then(() => {})
    .catch((err) => {
      log('Rabbit MQ error', err, {});
      process.exit(1);
    });
};
