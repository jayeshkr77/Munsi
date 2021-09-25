# Munsi
A light weight simple logger middleware for express server. 

## 1. Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install munsi
```
## 2. API Usage
### 2.1 Import
```js
var munsi = require('munsi')
```
### 2.2 Create event logs.
Use `logger` function to create event logs middleware function:
#### Parameters:
1. `path` - Path where you want to create your logs. Read log file location section for more info.
2. `config` - Configuration for the logger.
    * `headers` - **Array of HTTP header names** - **Optional**
        * If *headersIncluded* is true:\
        Logger will log only the headers mentioned in config.headers. If headers array is empty no headers will be logged.
        * If  *headersIncluded* is false:\
        logger will log all the headers except the ones mentioned in config.headers. If headers array is empty all the headers will be logged.
    * `headersIncluded` - **boolean** - **Optional** -Default value is true.
        * If *true* *[Default value]*:\
        Headers will be included in the logs.
        * If *false*:\
        Headers will be exculded from the logs.
    * `dateFormat` - Takes two values **'ddmmyyyy'** or **'mmddyyyy'**
        * This date format will be used to create log file name. see *4. Log file location* section.
        * Dates in the log file will be logged in this format.
        * If you set the dateFormat in config for error.logger() function it will overwride this dateFormat. Hence use only once, If you are using both the loggers set in events logs and not in error logs.

#### Function signature:
```ts
const logger = (path: string, config?: { headers?: Array<string>, headersIncluded?: boolean, dateFormat?: string })
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
    ::ffff:192.168.1.3 - 09-19-2021 17:50:39 - "GET / http 200" - Headers: [ connection: keep-alive, host: 192.168.1.4:8000, if-none-match: W/"24-+6oWzbNNtztfHx+NWeZUJKxUIWY"] - 1 ms
    ```
    use:
    ```js
    let eventLogLocation = path.join(__dirname, './../logs/event.log');
    let eventConfig = {
        headers: ['connection','host','if-none-match'],
        dateFormat: 'mmddyyyy'
    }

    app.use(munsi.logger(eventLogLocation,eventConfig));
    ```
    `Note`: No errors will be produced if additional header names are provided which are not found in req.headers.

### 2.3 Create error logs.
Use `errorLogger` function to create error logs:
#### Parameters:
1. `path` - Path where you want to create your error logs. Read x.x log file location section for more info.
2. `config` - Configuration for the error logger.
    * `responseMessage` - **Response to be sent back when unhandled error has occured** - **Optional**
        * If not provided - Blank response will be sent. **Not Recommended.**
        * If you want to send json, set responseMessage and responseType as:
            ```js
            {
                responseMessage: JSON.stringify({message: 'Error Occured'}),
                responseType: "JSON"
            }
            ```
            If responseType is set to JSON logger will send the response with
            ```js
            res.statusCode(500).json(JSON.parse(config.responseMessage));
            ```
        * If you want to send HTML, set responseMessage and responseType as:
            ```js
            {
                responseMessage: "<h1> Error </h1>",
                responseType: "HTML"
            }
            ```
            If responseType is set to HTML logger will send the response with
            ```js
            res.statusCode(500).send(config.responseMessage);
            ```
        * If you want to send file, set responseMessage and responseType as:
            ```js
            {
                responseMessage: fs.join(__dirname,'<file path>'),
                responseType: "FILE"
            }
            ```
            If responseType is set to HTML logger will send the response with
            ```js
            res.statusCode(500).sendFile(config.responseMessage);
            ```
    * `responseType` - Value **JSON | HTML | FILE**. See responseMessage section learn the usage. Default value is HTML
    * `dateFormat` - Takes two values **'ddmmyyyy'** or **'mmddyyyy'**
        * This date format will be used to create log file names. see *4. Log file location* section.
        * Dates in the log file will be logged in this format.
        * Date format set in logger() will be overriden by errorLogger(). There can only be one date format.

#### Function signature:
```ts
const errorLogger = (path: string, config: { responseMessage?: string, responseType?: string, dateFormat?: string })
```
Sample:
1. change response string (error message) accordingly.
    ```js
    let errorConfig = {
        responseMessage: JSON.stringify({message: 'hi hello'}),
        responseType: 'JSON'
    }
    app.use(munsi.errorLogger(errorLogLocation,errorConfig));
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

## 3. Examples
1. Simple Apache like logs for express
    ```js
    const express = require('express')
    const munsi = require('munsi')

    const app = express();
    const port = process.env.PORT || 8000;

    let eventLogLocation = path.join(__dirname, './../logs/event.log');
    let errorLogLocation = path.join(__dirname, './../logs/error.log');

    let errorConfig = {
        responseMessage: JSON.stringify({message: 'hi hello'}),
        responseType: 'JSON'
    }
    app.use(munsi.logger(eventLogLocation));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    });
    app.use(munsi.errorLogger(errorLogLocation, errorConfig));
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

    let eventLogLocation = path.join(__dirname, './../logs/event.log');
    let errorLogLocation = path.join(__dirname, './../logs/error.log');

    let eventConfig = {
    headers: ["user-agent"],
    headersIncluded: true,
    dateFormat: 'mmddyyyy'
    }
    let errorConfig = {
        responseMessage: JSON.stringify({message: 'hi hello'}),
        responseType: 'JSON'
    }
    app.use(munsi.logger(eventLogLocation, eventConfig));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('*',(req,res) =>{
        res.status(404).send('Route not found.')
    });
    app.use(munsi.errorLogger(errorLogLocation, errorConfig));
    app.listen(port, () => {
        return console.log(`server is listening on ${port}`);
    });
    ```
## 4. Log file location
* If you have provided file name in logLocation as `__dirname + './../logs/event.log'` it will be changed to `__dirname + './../logs/09122021event.log'` where 09122021 is ddmmyyyy. The same will be followed for error log.
* If you have provided just the directory for logLocation as `__dirname + './../logs/'` it will create a log file with default name **event.log**/**error.log** and will suffix ddmmyyyy as `__dirname + './../logs/09122021event.log'` or `__dirname + './../logs/09122021error.log'`.
* If the log file is greater than 2MB it will create a new log file.
    Rules for new log file:
    + If the new file name that was to be given to the log file is already there it will append number after that eg: `__dirname + './../logs/09122021event1.log'`. The same will be followed for error log.
## 5. Suggestions
1. If you are logging any additional logs from any other middleware or function, you should use the same event log file using the `munsi.getEventLogLocation()`.
2. You can use `munsi.getErrorLogLocation()` for error log file path.
3. Do not change the maximum size of the log file. It's recomended that the logs should not be more than 2MB. You can decrease the size if you want by setting the `MAX_LOG_FILE_SIZE_MB` to any number like 1 for 1MB, 0.5 for 0.5MB.
    ```js
    setMaximumLogFileSize(1) // for setting it to 1MB
    setMaximumLogFileSize(3) // for setting it to 3MB
    ```
4. You can also have date and time in dd-mm-yyyy hh:mm:ss string format by using `munsi.getDateTime()` function.
5. There can only be one date format in the project so set dateFormat only in `logger()` function. If you are not using event logger then set the dateFormat in `errorLogger()`.

## License

[MIT](LICENSE)
