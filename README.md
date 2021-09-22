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
### Create event logs.
Use `logger` function to create event logs:
| Params  | Description | Mandatory |
|---------|--------------------|-------|
| path    | event log location | Yes |
| headers | Array of header names | No |
| format  | date format either `ddmmyyyy` (default) or `mmddyyyy` | No |

#### Function signature:
```js
/**
 * Retruns the middleware function which will log the events in the path provided.
 * @param {string} path
 * @param {Array<string>} headers
 * @returns {function}
 */
const logger = (path: string, headers: Array<string> = [], format: string = 'ddmmyyyy')
```
Samples:
1. Simple Apache like logs in the format:
    ```log
    ::ffff:192.168.1.3 - 19-09-2021 18:17:45 - "GET / http 200" - 3 ms
    ```
    use:
    ```js
    let logLocation = __dirname + './../logs/event.log';
    app.use(munsi.logger(eventLogLocation));
    ```
2. Simple Apache logs + Headers in the log - Specify headers as an array of header names which you want to log:
    ```log
    ::ffff:192.168.1.3 - 19-09-2021 17:50:39 - "GET / http 200" - Headers: [ connection: keep-alive, host: 192.168.1.4:8000, if-none-match: W/"24-+6oWzbNNtztfHx+NWeZUJKxUIWY"] - 1 ms
    ```
    use:
    ```js
    let headers = ['connection','host','if-none-match'];
    let logLocation = __dirname + './../logs/event.log';

    app.use(munsi.logger(eventLogLocation,headers));
    ```
    Header names will be sarched in the req headers, if not found it won't be displayed in the logs. No errors will be produced if additional header names are provided.

### Create error logs.
Use `errorLogger` function to create error logs:
| Params  | Description | Mandatory |
|---------|--------------------|-------|
| path    | error log location | Yes |
| errorMessage | Response to be sent in case of error | Yes |
| format  | date format either `ddmmyyyy` (default) or `mmddyyyy` | No |

#### Function signature:
```js
/**
 * Retruns the middleware function which will log the errors in the path provided.
 * @param {string} path
 * @param {string} errorMessage
 * @returns {function}
 */
const errorLogger = (path: string, errorMessage: string, format: string = 'ddmmyyyy') 
```
Sample:
1. change response string (error message) accordingly.
    ```js
    app.use(munsi.errorLogger(errorLogLocation,'<h1> We are Unable toprocess your request</h1>','ddmmyyyy'));
    ```
    Error log:
    ```log
    ::ffff:192.168.1.4 - 22-09-2021 11:23:25 - "GET /error http " - Error: custom error
        at doSomething (D:\workspace\node\nodets\dist\utitlities\doSomething.js:9:11)
        at D:\workspace\node\nodets\dist\index.js:21:31
        at Layer.handle [as handle_request] (D:\workspace\node\nodets\node_modules\express\lib\router\layer.js:95:5)
        at next (D:\workspace\node\nodets\node_modules\express\lib\router\route.js:137:13)
        at Route.dispatch (D:\workspace\node\nodets\node_modules\express\lib\router\route.js:112:3)
        at Layer.handle [as handle_request] (D:\workspace\node\nodets\node_modules\express\lib\router\layer.js:95:5)
        at D:\workspace\node\nodets\node_modules\express\lib\router\index.js:281:22
        at Function.process_params (D:\workspace\node\nodets\node_modules\express\lib\router\index.js:335:12)
        at next (D:\workspace\node\nodets\node_modules\express\lib\router\index.js:275:10)
        at D:\workspace\node\nodets\dist\logger\logger.js:80:13
    ```

## Examples
1. Simple Apache like logs for express
    ```js
    const express = require('express')
    const munsi = require('munsi')

    const app = express();
    const port = process.env.PORT || 8000;

    let logLocation = __dirname + './../logs/event.log';

    app.use(munsi.logger(eventLogLocation));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    });
    app.use(munsi.errorLogger(errorLogLocation,'<h1> We are Unable to process your request</h1>'));
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
    let logLocation = __dirname + './../logs/event.log';

    app.use(munsi.logger(eventLogLocation,headers));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    });
    app.use(munsi.errorLogger(errorLogLocation,'<h1> We are Unable to process your request</h1>'));
    app.listen(port, () => {
        return console.log(`server is listening on ${port}`);
    });
    ```
## Log file location
* If you have provided file name in logLocation as `__dirname + './../logs/event.log'` it will be changed to `__dirname + './../logs/09122021event.log'` where 09122021 is ddmmyyyy. The same will be followed for error log.
* If you have provided just the directory for logLocation as `__dirname + './../logs/'` it will create a log file with default name **event.log**/**error.log** and will suffix ddmmyyyy as `__dirname + './../logs/09122021event.log'` or `__dirname + './../logs/09122021error.log'`.
* If the log file is greater than 2MB it will create a new log file.
    Rules for new log file:
    + If the new file name that was to be given to the log file is already there it will append number after that eg: `__dirname + './../logs/09122021event1.log'`. The same will be followed for error log.
# Suggestions
1. If you are logging any additional logs from any other middleware or function, you should use the same event log file using the `munsi.getEventLogLocation()`.
2. You can use `munsi.getErrorLogLocation()` for error log file path.
3. Do not change the maximum size of the log file. It's recomended that the logs should not be more than 2MB. You can decrease the size if you want by setting the `MAX_LOG_FILE_SIZE_MB` to any number like 1 for 1MB, 0.5 for 0.5MB.
    ```js
    setMaximumLogFileSize(1) // for setting it to 1MB
    setMaximumLogFileSize(3) // for setting it to 3MB
    ```
4. You can also have date and time in dd-mm-yyyy hh:mm:ss format by using `munsi.getDateTime()` function

## License

[MIT](LICENSE)
