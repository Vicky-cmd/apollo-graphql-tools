"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProtectorHandler = void 0;
const jsonpath_1 = __importDefault(require("jsonpath"));
const lodash_1 = __importDefault(require("lodash"));
class DataProtectorHandler {
    constructor() {
        this.protectData = (source, args, context, info, result) => {
            if (!result)
                return result;
            if (!lodash_1.default.isEmpty(args.directiveFields))
                return this.handleforFields(source, args, context, info, result);
            return this.handleForDataType(source, args, context, info, result);
        };
        this.handleforFields = (source, args, context, info, result) => {
            for (let field in args.directiveFields) {
                if (lodash_1.default.isEmpty(field))
                    continue;
                args.handler = this;
                jsonpath_1.default.apply(result, '$..'.concat(args.directiveFields[field]), function (value) {
                    if (!value)
                        return value;
                    return args.handler.handleForDataType(source, args, context, info, value);
                });
            }
            return result;
        };
        this.handleStringData = (_, args, __, ___, result) => {
            if (!args || !args.directiveType)
                return result;
            if (args.directiveType === 'PROTECT')
                return result
                    .toUpperCase()
                    .split('')
                    .reverse()
                    .join('');
            else
                return result.substring(0, 1) + '*'.repeat(result.length - 1);
        };
        this.handleNumberData = (_, args, __, ___, result) => {
            if (args.directiveType === 'PROTECT')
                return parseFloat(result.toString());
            else
                return parseFloat(result.toString().substring(0, 2) +
                    '0'.repeat(result.toString().length - 1));
        };
        this.handleListData = (source, args, context, info, result) => {
            if (lodash_1.default.isEmpty(result))
                return result;
            let protectedArr = [];
            for (let data in result) {
                protectedArr.push(this.handleForDataType(source, args, context, info, data));
            }
            return protectedArr;
        };
        this.handleObjectData = (source, args, context, info, result) => {
            let protectedResult = {};
            for (let key in result) {
                let data = result[key];
                protectedResult[key] = this.handleForDataType(source, args, context, info, data);
            }
            return protectedResult;
        };
    }
    chnageValueByPath(object, path, value) {
        if (Array.isArray(path) && path[0] === '$') {
            const pathWithoutFirstElement = path.slice(1);
            lodash_1.default.set(object, pathWithoutFirstElement, value);
        }
    }
    changeValuesByPath(object, nodes, lastPropertyName) {
        nodes.forEach(node => {
            this.chnageValueByPath(object, node.path.toString().concat(lastPropertyName), node.value);
        });
        return object;
    }
    handleForDataType(source, args, context, info, data) {
        if (!isNaN(data) && !isNaN(parseFloat(data)))
            return this.handleNumberData(source, args, context, info, data);
        if (typeof data === 'string')
            return this.handleStringData(source, args, context, info, data);
        if (typeof data === 'object')
            return this.handleObjectData(source, args, context, info, data);
        if (lodash_1.default.isArray(data))
            return this.handleListData(source, args, context, info, data);
        return data;
    }
}
exports.DataProtectorHandler = DataProtectorHandler;
//# sourceMappingURL=DataProtectorHandler.js.map