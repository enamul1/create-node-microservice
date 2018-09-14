const healthz = require('./healthz');

module.exports = (server) => {
  healthz(server);
};
