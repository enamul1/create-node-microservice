This directory contains any Knex.js [Migrations](https://knexjs.org/#Migrations-CLI),
which creates, alters, drops, etc. tables in a relational database primary used for
integration tests; but can also be used for setup data if your service has its
own MySQL database.

* Create a seed using `npm run knex migration:make MIGRATION_NAME
* You should restrict a migration to a single DDL operation, you don't want a migration to partially run
* Migrations are run based on their generated file name, which is FIFO, you may need to rename the file if you need a different order
* Try not to do INSERTs in migrations, better to use [seeds](../seeds)

Or, if you'd prefer, here's an example of a migration in code:

```
export function up(knex) {
  return knex.schema.createTable('workorder', (t) => {
    t.increments('workorder_id').unsigned().primary();
    t.integer('company_id').notNullable();
    t.integer('scheduled_time_start').notNullable().unsigned().defaultTo(0);
    t.integer('location_id').notNullable().unsigned().defaultTo(0);
    t.integer('status_id').notNullable().unsigned().defaultTo(1);
    t.integer('is_remote_work').notNullable().unsigned().defaultTo(0);
    t.integer('template').defaultTo(0);
    t.string('address1');
    t.string('address2');
    t.string('city');
    t.string('state');
    t.string('zip');
    t.string('country');
  });
}

export function down(knex) {
  return knex.schema.dropTable('workorder');
}
```

# Integration testing
If your service uses MySQL for reads such as to generate caches; a good pattern is to
use SQLlite3 locally and run Knex.js migrations/seeds to setup a database to "mimic"
what the eventual MySQL replica you connect to would serve. For this purpose, you don't 
need 100% of the rows or columns; just enough to satisfy all of your tests.
