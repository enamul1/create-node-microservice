# Source files
The src/ directory is the container for all your project source code. This can be further
structured using directories; but all linting and tests (.spec.js files) should be located
in or under this directory and nowhere else.

* [Restify.js](http://restify.com/) routes are located in the handler [handler](./handler) directory
* Unit/integration tests should match the filename but append a .spec extension (e.g.: index.js -> index.spec.js)
