"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let MAX_LOG_FILE_SIZE_MB = 1;
let eventLogLocation;
let errorLogLocation;
let suffixDateFormat = 'ddmmyyyy';
// If set to true the headers array will only be logged
// If set to false the except headers in the array everything else will be logged.  
let includeHeaders = true;
/**
 * Return the date and time according to the format.
 * @returns {string} dd-mm-yyyy hh:mm:ss format date time
 */
const getDateTime = () => {
    var date_ob = new Date();
    if (suffixDateFormat === 'mmddyyyy') {
        return `${("0" + (date_ob.getMonth() + 1)).slice(-2)}-${("0" + date_ob.getDate()).slice(-2)}-${date_ob.getFullYear()} ${date_ob.getHours()}:${date_ob.getMinutes()}:${date_ob.getSeconds()}`;
    }
    return `${("0" + date_ob.getDate()).slice(-2)}-${("0" + (date_ob.getMonth() + 1)).slice(-2)}-${date_ob.getFullYear()} ${date_ob.getHours()}:${date_ob.getMinutes()}:${date_ob.getSeconds()}`;
};
/**
 * Return ddmmyyyy or mmddyyyy format date string which will be used to create file names.
 * @returns {string}
 */
const createSuffix = () => {
    let date = new Date();
    if (suffixDateFormat === 'mmddyyyy') {
        return `${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}${date.getFullYear()}`;
    }
    //for rest formats return 'ddmmyyyy'
    return `${("0" + date.getDate()).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${date.getFullYear()}`;
};
/**
 * Creates the log file path, If file size grows bigger than MAX_LOG_FILE_SIZE_MB it will
 * create a new file by appending number at the end of the files.
 * @param {string} filePath File path where the logs will be kept.
 * @param {"event" | "error"} type Values: 'events' or 'logs'
 * @returns {string} Log file path
 */
const createLogFilePath = (filePath, type) => {
    let folderPath;
    let fileName;
    let lastIndex = filePath.lastIndexOf('\\');
    if (lastIndex === -1) {
        throw new Error('Invalid path name.');
    }
    if (filePath.lastIndexOf('.') > -1) {
        folderPath = filePath.slice(0, lastIndex);
        fileName = filePath.slice(lastIndex + 1);
    }
    else {
        folderPath = filePath;
    }
    //Create folder if not present
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath);
    }
    let suffix = createSuffix();
    // If file name is provided
    if (fileName && fileName.length) {
        fileName = `${suffix}${fileName}`;
    }
    else { // If file name is not provided.
        if (type === 'event') {
            fileName = `${suffix}event.log`;
        }
        else {
            fileName = `${suffix}error.log`;
        }
    }
    // Check if the log file is greater than 2MB
    try {
        let i = 0;
        while (++i) {
            if ((fs_1.default.statSync(path_1.default.join(folderPath, fileName)).size / (1024 * 1024)) > MAX_LOG_FILE_SIZE_MB) {
                let fileNameSections = fileName.split('.');
                fileName = `${fileNameSections[0]}${i}.${fileNameSections[1]}`;
            }
            else {
                break;
            }
        }
    }
    catch (_a) {
        // For the first run no such file or directory error because the file is not yet created.
    }
    return path_1.default.join(folderPath, fileName);
};
/**
 * Retruns the middleware function which will log the errors in the path provided.
 * @param {string} path Path of the error log file.
 * @param {Object} config {
 *                          headers: Array of header names to be exclude or included,
 *                          headersIncluded: true -> To include only the headers in config.headers else exclude the headers,
 *                          dateFormat: Log date format ['ddmmyyyy' or 'mmddyyyy']. default is 'ddmmyyyy'
 *                        }
 * @returns {function} Returns a middleware function.
 */
const logger = (path, config) => {
    if (typeof (path) !== 'string') {
        throw new Error(`Invalid file path. Expected: string. Provided: ${typeof (path)} `);
    }
    if (!path.length) {
        throw new Error(`Invalid file path. Expected: non empty string. Prodvided: empty string`);
    }
    if (typeof (config) !== 'undefined') {
        try {
            if (config.headers) {
                if (!config.headers.every(key => typeof (key) === 'string')) {
                    throw new Error(`Invalid headers. Expected: Array<string>.`);
                }
            }
        }
        catch (_a) {
            throw new Error(`Invalid headers. Expected: Array<string>. Provided: ${config.headers}`);
        }
        if (typeof (config.headersIncluded) !== 'boolean' && typeof (config.headersIncluded) !== 'undefined') {
            throw new Error(`Invalid flag for headersIncluded. Expected: boolean. Provided: ${config.headersIncluded}`);
        }
        else {
            includeHeaders = config.headersIncluded;
        }
        // Validations for dateFormat
        if (typeof (config.dateFormat) === 'undefined') {
            suffixDateFormat = config.dateFormat;
        }
        else if (typeof (config.dateFormat) !== 'string') {
            throw new Error(`Invalid config.dateFormat. Expected: string type. Provided: ${typeof (config.dateFormat)}`);
        }
        else if (!(config.dateFormat === 'ddmmyyyy' || config.dateFormat === 'mmddyyyy')) {
            throw new Error(`Invalid config.dateFormat. Expected: 'ddmmyyyy' or 'mmddyyyy'. Provided: ${config.dateFormat}`);
        }
        else {
            suffixDateFormat = config.dateFormat;
        }
    }
    return (req, res, next) => {
        let reqStart = Date.now();
        let log = `${req.socket.remoteAddress} - ${getDateTime()} - "${req.method} ${req.url} ${req.protocol} `;
        next();
        log += `${res.statusCode}" - `;
        if (config && config.headers) {
            // Will include only supplied headers in the log.
            if (includeHeaders) {
                if (config.headers.length > 0) {
                    log += 'Headers: [ ';
                    config.headers.map(key => {
                        if (req.headers[key]) {
                            log += `${key}: ${req.headers[key]}, `;
                        }
                    });
                    log = `${log.slice(0, -2)}] - `;
                }
            }
            // Will exclude all supplied headers in the log.
            else {
                log += 'Headers: [ ';
                Object.keys(req.headers).map(key => {
                    if (!config.headers.includes(key)) {
                        log += `${key}: ${req.headers[key]}, `;
                    }
                });
                log = `${log.slice(0, -2)}] - `;
            }
        }
        log += `${Date.now() - reqStart} ms\n`;
        eventLogLocation = createLogFilePath(path, "event");
        console.log(eventLogLocation);
        fs_1.default.appendFile(eventLogLocation, log, err => {
            if (err) {
                //error occured while writing to a file
                console.log('file error');
                next(err);
            }
        });
    };
};
/**
 * Retruns the middleware function which will log the errors in the path provided.
 * @param {string} path Path of the error log file.
 * @param {Object} config {
 *                          responseMessage: Error response to be sent back to client,
 *                          responseType: HTML | JSON | FILE,
 *                          dateFormat: Log date format ['ddmmyyyy' or 'mmddyyyy']. default is 'ddmmyyyy'
 *                        }
 * @returns {function} Returns a middleware function.
 */
const errorLogger = (path, config) => {
    if (typeof (path) !== 'string') {
        throw new Error(`Invalid file path. Expected: string. Provided: ${typeof (path)} `);
    }
    if (!path.length) {
        throw new Error(`Invalid file path. Expected: non empty string. Prodvided: empty string`);
    }
    if (typeof (config) !== 'undefined') {
        // Validations for responseMessage
        if (typeof (config.responseMessage) !== 'string') {
            throw new Error(`Invalid config.responseMessage. Expected: string or JSON type. Provided: ${typeof (config.responseMessage)}`);
        }
        // Validations for responseType
        if (typeof (config.responseType) !== 'undefined') {
            if (typeof (config.responseType) !== 'string') {
                throw new Error(`Invalid config.responseType. Expected: string type. Provided: ${typeof (config.responseType)}`);
            }
            else if (!(config.responseType.toUpperCase() === 'JSON' || config.responseType.toUpperCase() === 'HTML' || config.responseType.toUpperCase() === 'FILE')) {
                throw new Error(`Invalid config.responseType. Expected: 'JSON', 'HTML' or 'FILE. Provided: ${config.responseType}`);
            }
        }
        else {
            config.responseType = 'HTML';
        }
        // Validations for dateFormat
        if (typeof (config.dateFormat) === 'undefined') {
            suffixDateFormat = config.dateFormat;
        }
        else if (typeof (config.dateFormat) !== 'string') {
            throw new Error(`Invalid config.dateFormat. Expected: string type. Provided: ${typeof (config.dateFormat)}`);
        }
        else if (!(config.dateFormat === 'ddmmyyyy' || config.dateFormat === 'mmddyyyy')) {
            throw new Error(`Invalid config.dateFormat. Expected: 'ddmmyyyy' or 'mmddyyyy'. Provided: ${config.dateFormat}`);
        }
        else {
            suffixDateFormat = config.dateFormat;
        }
    }
    errorLogLocation = path;
    return (err, req, res, next) => {
        let log = `${req.socket.remoteAddress} - ${getDateTime()} - "${req.method} ${req.url} ${req.protocol} " - ${err.stack}\n`;
        errorLogLocation = createLogFilePath(path, 'error');
        fs_1.default.appendFile(errorLogLocation, log, err => {
            if (err) {
                // Error occured while writing to a file
                throw err;
            }
            switch (config.responseType.toUpperCase()) {
                case 'JSON':
                    res.statusCode(500).json(JSON.parse(config.responseMessage));
                    break;
                case 'FILE':
                    res.statusCode(500).sendFile(config.responseMessage);
                    break;
                default:
                    res.statusCode(500).send(config.responseMessage);
                    break;
            }
        });
    };
};
/**
 * Retruns the events log location file path.
 * @returns {string} eventLogLocation
 */
const getEventLogLocation = () => {
    return eventLogLocation;
};
/**
 * Retruns the errors log location file path.
 * @returns {string} errorLogLocation
 */
const getErrorLogLocation = () => {
    return errorLogLocation;
};
/**
 * Sets the maximum size of the log file. Default set to 2 i.e 2MB.
 * @param {number} sizeInMB
 * @returns {void}
 */
const setMaximumLogFileSize = (sizeInMB = 2) => {
    MAX_LOG_FILE_SIZE_MB = sizeInMB;
};
exports.default = {
    "logger": logger,
    "errorLogger": errorLogger,
    "getDateTime": getDateTime,
    "getEventLogLocation": getEventLogLocation,
    "getErrorLogLocation": getErrorLogLocation,
    "setMaximumLogFileSize": setMaximumLogFileSize
};
//# sourceMappingURL=logger.js.map