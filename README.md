# Munsi
A light weight simple logger middleware for express server.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install munsi
```
## API

```js
var munsi = require('munsi')
```
### To create a new munsi logger middleware.
1. Simple Apache like logs in the format:
    ```log
    ::ffff:192.168.1.3 - 19-09-2021 18:17:45 - "GET / http 200" - 3 ms
    ```
    use:
    ```js
    let logLocation = __dirname + './../logs/master.log';
    app.use(munsi(logLocation));
    ```
2. Specify header names as an array if you want to log request headers:
    ```log
    ::ffff:192.168.1.3 - 19-09-2021 17:50:39 - "GET / http 304" - Headers: [ connection: keep-alive, host: 192.168.1.4:8000, if-none-match: W/"24-+6oWzbNNtztfHx+NWeZUJKxUIWY"] - 1 ms
    ```
    use:
    ```js
    let headers = ['connection','host','if-none-match'];
    let logLocation = __dirname + './../logs/master.log';

    app.use(munsi(logLocation, headers));
    ```
    Header names will be sarched in the req headers, if not found it won't be displayed in the logs. No errors will be produced if additional header names are provided.

## Examples
1. Simple Apache like logs for express
    ```js
    const express = require('express')
    const munsi = require('munsi')

    const app = express();
    const port = process.env.PORT || 8000;

    let logLocation = __dirname + './../logs/master.log';

    app.use(munsi(logLocation));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    })
    app.listen(port, () => {
        return console.log(`server is listening on ${port}`);
    });
    ```
2. Simple logs + Headers in the log
    ```js
    const express = require('express')
    const munsi = require('munsi')

    const app = express();
    const port = process.env.PORT || 8000;

    let headers = ['connection','host','if-none-match'];
    let logLocation = __dirname + './../logs/master.log';

    app.use(munsi(logLocation, headers));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    })
    app.listen(port, () => {
        return console.log(`server is listening on ${port}`);
    });
    ```
## License

[MIT](LICENSE)
