install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

setup:
	npm ci
