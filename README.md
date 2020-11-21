# Automation & E2E Testing For Aventum

Using [Puppeteer](https://github.com/puppeteer/puppeteer) & [Jest](https://jestjs.io/), scripts to test and automate some of the Aventum features.

## How to use it?

1. Rename `sample.env` to `.env` and put your own conjurations.
2. Setup the first super user by running `npm run test:serially -- setup.test.js`.
3. Upload the files by running `npm run test:serially -- uploads.test.js`.
4. Create Comments schema by running `npm run test:serially -- create.comments.schema.test.js`
5. Create Comment items by running `npm run test:serially -- create.comments.contents.test.js`
6. Create CustomField1 schema by running `npm run test:serially -- create.customField1.schema.test.js`
7. Create CustomField2 schema by running `npm run test:serially -- create.customField2.schema.test.js`
8. Create Schemas1 schema by running `npm run test:serially -- create.schemas1.schema.test.js`
9. Create Schemas1 items by running `npm run test:serially -- create.schemas1.contents.test.js`
10. Update Schemas1 items by running `npm run test:serially -- update.schemas1.contents.test.js`

## Docker Windows PowerShell

> Make sure [VcXsrv Windows X Server](https://sourceforge.net/projects/vcxsrv/) up and running

```
docker build -t aventum-e2e .
# Notice the IP 192.168.0.15, find your IP using ipconfig
docker run --network=host -v /app/node_modules -v ${pwd}:/app -e 'DISPLAY=192.168.0.15:0' -it aventum-e2e
```
