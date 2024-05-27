"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProtectorHandler = void 0;
const jsonpath_1 = __importDefault(require("jsonpath"));
const lodash_1 = __importDefault(require("lodash"));
const utilities_1 = require("../utilities");
const isUserAuthorizedForResource = (_, __) => {
    return true;
};
const securedDirectivesFunctionsMap = {
    secure: (_, args, context, ____, result) => {
        if (isUserAuthorizedForResource(args.directiveField, context))
            return result;
        else
            return null;
    },
    redact: (_, args, context, ____, result) => {
        if (!result)
            return result;
        else if (isUserAuthorizedForResource(args.directiveField, context))
            return result;
        if ((0, utilities_1.isNumber)(result))
            return parseFloat(result.toString().substring(0, 2) + '0'.repeat(result.toString().length - 1));
        else
            return ((0, utilities_1.isString)(result) ? result.substring(0, 1) : String(result.substring(0, 1))) + '*'.repeat(result.length - 1);
    },
    encrypt: (_, args, context, ____, result) => {
        if (!result)
            return result;
        else if (isUserAuthorizedForResource(args.directiveField, context))
            return result;
        if ((0, utilities_1.isNumber)(result))
            return parseFloat(result.toString());
        else if ((0, utilities_1.isString)(result))
            return result.toUpperCase().split('').reverse().join('');
    },
};
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
                args.currentField = field;
                jsonpath_1.default.apply(result, '$..'.concat(args.directiveFields[field]), function (value) {
                    if (!value)
                        return value;
                    return args.handler.handleForDataType(source, {
                        ...args,
                        directiveField: args.directiveFields ? args.directiveFields.concat(".") : "" + args.directiveFields[args.currentField],
                    }, context, info, value);
                });
            }
            return result;
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
    changeValueByPath(object, path, value) {
        if (Array.isArray(path) && path[0] === '$') {
            const pathWithoutFirstElement = path.slice(1);
            lodash_1.default.set(object, pathWithoutFirstElement, value);
        }
    }
    changeValuesByPath(object, nodes, lastPropertyName) {
        nodes.forEach(node => {
            this.changeValueByPath(object, node.path.toString().concat(lastPropertyName), node.value);
        });
        return object;
    }
    handleForDataType(source, args, context, info, data) {
        if (typeof data === 'object')
            return this.handleObjectData(source, args, context, info, data);
        if (lodash_1.default.isArray(data))
            return this.handleListData(source, args, context, info, data);
        return securedDirectivesFunctionsMap[args.directiveType](source, args, context, info, data);
    }
}
exports.DataProtectorHandler = DataProtectorHandler;
//# sourceMappingURL=DataProtectorHandler.js.map