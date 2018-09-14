# RESTful routes
Uses [Restify](http://restify.com/) to handle API traffic by default. Routes are configured
in the src/handler directory. End-to-end integrations tests are .spec. files in that directory.
For an example, see [src/handler/healthz.js](src/handler/healthz.js).

Routes must be registered in `src/handler/index.js`. Think of files in src/handler as
controllers that should map to one path (e.g.: /healthz). The file can register listeners
for one or more modes (GET, PUT, POST, etc.).

# Vhost
Services that consume APIs or data from other services should operate in a vhost
pattern, allowing configurations for multiple "targets". For example, if your service
connects to a MySQL database and writes to a local store (e.g.: a caching service), you
should build it to allow targets for qa1, qa2, test1, test2, etc. so that it can be
setup once in our Kubernetes cluster for all lower environments.

This allows us to be more flexible and not have to run multiple versions of the service
per environment. It's safe to assume once we talk about production there would likely
only be one target.

# Checklist
- [x] Create the Dockerfile and Node.js requirement (8.12.0)
- [x] Function for connecting to Redis w/vhost prefixing
- [ ] Example Redis unit test w/redis-mock
- [x] Function for connecting to RabbitMQ w/vhost
- [ ] Example RabbitMQ unit test w/amqplib-mocks
- [x] Function for running a RabbitMQ queue consumer
- [ ] Example RabbitMQ consumer unit test w/mock
- [ ] Prometheus example for outputting metrics
- [ ] Implement fn-node-logger and logging function
- [x] Implement Restify server example and health checking route
- [ ] Integration test Restrify health checking route
- [x] Implement context parsing middleware and pattern for un-authed routes like /healthz
- [x] Implement Airbnb eslint rules with lint, lint:autofix npm scripts
- [ ] Implement Husky to require passing tests/lints prior to commit
- [ ] Implement Jest and test-running via Docker and `npm run test`
- [x] Implement function for connecting to MySQL/SQLite3 via Knex.js w/vhost
- [x] Implement example migrations for setting up SQLite3 locally for tests
- [x] Implement example seeds for setting up SQLite3 locally for tests
- [ ] Example MySQL unit test using SQLite3 to mock locally
- [x] Implement concept for specifying vhosts in configuration (.env) and document it
- [ ] Implement our private npm repository so we can use internal libraries
- [ ] Implement Husky pre-commit hook to auto-build documentation
- [ ] Include example helmvar, helms or cli code generators
- [ ] Create Makefile and Jenkinsfile for CI support
