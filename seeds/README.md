This directory contains any Knex.js [Seeds](https://knexjs.org/#Seeds-CLI),
which insert data into a relational database tables. Primarily used for setting
up data for integration tests; but can also be used for setup data if your
service has its own MySQL database.

* Create a seed using `npm run knex seed:make SEED_NAME`
* You should name the seed the same as the target table
* You should do one seed per table

Or, if you'd prefer, here's an example of a seed:

```
exports.seed = function workorder(knex) {
  // Deletes ALL existing entries
  return knex('geocache')
    .del()
    .then(() =>
      // Inserts seed entries
      knex('geocache').insert([
        {
          geocache_itemtype: 'l',
          geocache_itemid: 1,
          geocache_lat: 44.960340,
          geocache_lng: -93.264542,
        },
        {
          geocache_itemtype: 'l',
          geocache_itemid: 2,
          geocache_lat: 44.791056,
          geocache_lng: -93.169836,
        },
        {
          geocache_itemtype: 'l',
          geocache_itemid: 3,
          geocache_lat: 45.260181,
          geocache_lng: -93.054286,
        },
        {
          geocache_itemtype: 'l',
          geocache_itemid: 4,
          geocache_lat: 44261122960340,
          geocache_lng: -93.356984,
        },
        {
          geocache_itemtype: 'w',
          geocache_itemid: 5,
          geocache_lat: 46.553029,
          geocache_lng: -120.652737,
        },
      ]));
};
```

# Integration testing
If your service uses MySQL for reads such as to generate caches; a good pattern is to
use SQLlite3 locally and run Knex.js migrations/seeds to setup a database to "mimic"
what the eventual MySQL replica you connect to would serve. For this purpose, you don't
need 100% of the rows or columns; just enough to satisfy all of your tests.
