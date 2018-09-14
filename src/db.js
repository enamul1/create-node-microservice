const Knex = require('knex');

if (!process.env.MYSQL_HOST) {
  require('dotenv').config(); // eslint-disable-line
}

const connectionPool = [];

/**
 * Connects to a database for a given environment (e.g.: qa1). Reuses a previous
 * connection if available, or use forceReconnect to guarantee a fresh connection.
 *
 * @param {string} environment = qa1, qa2, test1, etc.
 * @param {boolean} forceReconnect - forces a new connection
 * @return {object} knex.js instance
 */
module.exports = async function db(environment, forceReconnect = false) {
  if (typeof process.env[`${environment}_MYSQL_DATABASE`] === 'undefined') {
    throw new Error(
      `Environment ${environment} does not specify a MYSQL_DATABASE configuration!`,
    );
  }

  if (connectionPool[environment] && !forceReconnect) {
    return connectionPool[environment];
  }

  const config = {
    client: process.env.NODE_ENV === 'test' ? 'sqlite3' : 'mysql2',
    connection:
      process.env.NODE_ENV === 'test'
        ? {
          filename: ':memory:',
        }
        : {
          database: process.env[`${environment}_MYSQL_DATABASE`],
          user: process.env[`${environment}_MYSQL_USER`],
          password: process.env[`${environment}_MYSQL_PASSWORD`],
          host: process.env[`${environment}_MYSQL_HOST`],
        },
    useNullAsDefault: process.env.NODE_ENV === 'test',
    migrations: {
      tableName: 'migrations',
    },
    seeds: {
      directory: './seeds',
    },
    pool:
      process.env.NODE_ENV === 'test'
        ? {}
        : {
          min: 2,
          max: 10,
        },
  };

  const conn = new Knex(config);

  connectionPool[environment] = conn;

  return conn;
};
