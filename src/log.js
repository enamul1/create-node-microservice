// const nodeLogger = require('fn-node-logger')();
// const { logger } = nodeLogger;

const errors = require('debug')('errors');
const info = require('debug')('info');

/**
 * Logs a message, either through DEBUG for dev/test or in JSON format for production/k8s.
 *
 * @param {string} scope - error|info
 * @param {string} message - explination
 * @param {object} params - key/value params for context
 * @return {null} unused
 */
module.exports = function log(scope, message, params = {}) {
  if (process.env.NODE_ENV === 'test') {
    switch (scope) {
      case 'error':
        errors(`${message}\n--${JSON.stringify(params, null, 2)}`);
        break;

      case 'info':
      default:
        info(`${message}\n--${JSON.stringify(params, null, 2)}`);
        break;
    }
  }

  // logger.log(message, params);
};
