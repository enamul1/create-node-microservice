TEST_FILES=$(wildcard test/unit/*.js)
NODE_ENV=production
VERSION=`git describe --tags`

.PHONY: clean build test-ci

default:
	docker-compose up

clean:
	docker-compose down

build:
	echo "Building $(NODE_ENV) build version $(VERSION)"
	bash -c 'echo -n "$(VERSION)" > .version'
	git rev-parse HEAD > GIT_COMMIT

test-ci:
	npm run lint
	npm run test
