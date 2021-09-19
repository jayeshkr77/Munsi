"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const getDateTime = () => {
    var date_ob = new Date();
    return `${("0" + date_ob.getDate()).slice(-2)}-${("0" + (date_ob.getMonth() + 1)).slice(-2)}-${date_ob.getFullYear()} ${date_ob.getHours()}:${date_ob.getMinutes()}:${date_ob.getSeconds()}`;
};
/**
 * Returns the sum of a and b
 * @param {string} path
 * @param {Array<string>} headers
 * @returns {function}
 */
const logger = (path, headers = []) => {
    if (headers && path) {
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
            fs_1.default.appendFile(path, log, err => {
                if (err) {
                    //error occured while writing to a file
                    throw err;
                }
            });
        };
    }
    else {
        throw new Error('log file path is undefined.');
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map