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
let suffixDateFormat;
/**
 * Return the date and time according to the format.
 * @returns {string} dd-mm-yyyy hh:mm:ss format date time
 */
const getDateTime = () => {
    var date_ob = new Date();
    if (suffixDateFormat === 'mmddyyyyy') {
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
 * @param {string} filePath
 * @param {"event" | "error"} type
 * @returns {string}
 */
const createLogFilePath = (filePath, type) => {
    let lastIndex = filePath.lastIndexOf('\\');
    if (lastIndex === -1) {
        throw new Error('Invalid path name.');
    }
    let folderPath = filePath.slice(0, lastIndex);
    let fileName = filePath.slice(lastIndex + 1);
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
 * Retruns the middleware function which will log the events in the path provided.
 * @param {string} path
 * @param {Array<string>} headers
 * @returns {function}
 */
const logger = (path, headers = [], format = 'ddmmyyyy') => {
    if (headers && path) {
        suffixDateFormat = format;
        return (req, res, next) => {
            let reqStart = Date.now();
            let log = `${req.socket.remoteAddress} - ${getDateTime()} - "${req.method} ${req.url} ${req.protocol} `;
            next();
            log += `${res.statusCode}" - `;
            if (headers.length) {
                log += 'Headers: [ ';
                headers.map(key => {
                    if (req.headers[key]) {
                        log += `${key}: ${req.headers[key]}, `;
                    }
                });
                log = `${log.slice(0, -2)}] - `;
            }
            log += `${Date.now() - reqStart} ms\n`;
            eventLogLocation = createLogFilePath(path, "event");
            fs_1.default.appendFile(eventLogLocation, log, err => {
                if (err) {
                    //error occured while writing to a file
                    next(err);
                }
            });
        };
    }
    else {
        throw new Error('log file path is undefined.');
    }
};
/**
 * Retruns the middleware function which will log the errors in the path provided.
 * @param {string} path
 * @param {string} errorMessage
 * @returns {function}
 */
const errorLogger = (path, errorMessage, format = 'ddmmyyyy') => {
    if (path) {
        errorLogLocation = path;
        suffixDateFormat = format;
        return (err, req, res, next) => {
            let reqStart = Date.now();
            let log = `${req.socket.remoteAddress} - ${getDateTime()} - "${req.method} ${req.url} ${req.protocol} " - ${err.stack}\n`;
            errorLogLocation = createLogFilePath(path, 'error');
            fs_1.default.appendFile(errorLogLocation, log, err => {
                if (err) {
                    //error occured while writing to a file
                    throw err;
                }
                res.send(errorMessage);
            });
        };
    }
    else {
        throw new Error('Error log file path is undefined.');
    }
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