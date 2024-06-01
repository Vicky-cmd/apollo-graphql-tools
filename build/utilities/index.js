"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = exports.isNumber = void 0;
const isNumber = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
};
exports.isNumber = isNumber;
const isString = (value) => {
    return typeof value === 'string';
};
exports.isString = isString;
//# sourceMappingURL=index.js.map