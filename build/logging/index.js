"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
class Logger {
    constructor() {
        this.loggingLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        this.getLoggingLevel = (level) => {
            if (level && this.loggingLevels.includes(level))
                return this.loggingLevels.indexOf(level);
            return 1;
        };
        this.level = this.getLoggingLevel(process.env.GRAPHQL_TOOLS_LOGGING_LEVEL);
        this.debug = (...message) => {
            if (this.level > 0)
                return;
            console.debug(message);
        };
        this.info = (...message) => {
            if (this.level > 1)
                return;
            console.info(message);
        };
        this.warn = (...message) => {
            if (this.level > 2)
                return;
            console.warn(message);
        };
        this.error = (...message) => {
            if (this.level > 3)
                return;
            console.error(message);
        };
    }
}
exports.Logger = Logger;
exports.logger = new Logger();
//# sourceMappingURL=index.js.map