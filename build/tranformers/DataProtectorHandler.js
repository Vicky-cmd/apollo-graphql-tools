"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProtectorHandler = void 0;
const jsonpath_1 = __importDefault(require("jsonpath"));
const lodash_1 = __importDefault(require("lodash"));
const utilities_1 = require("../utilities");
const encryption_1 = require("../encryption");
const getUserAuthorityForResource = (parentType, directiveField, context) => {
    console.log('directiveField', directiveField);
    if (!context.authContext ||
        !context.authContext.authorities ||
        !context.authContext.authorities[parentType])
        return 'N/A';
    let defaultAuthority = "N/A";
    for (let authority of context.authContext.authorities[parentType]) {
        console.log('authority', authority);
        if (authority.resources.includes(directiveField))
            return authority.authority;
        else if (authority.resources.includes('*'))
            defaultAuthority = authority.authority;
    }
    return defaultAuthority;
};
let encryptionHandler = new encryption_1.EncryptionHandler();
const securedDirectivesFunctionsMap = {
    secure: (_, __, ___, ____, _____) => null,
    redact: (_, __, ___, ____, result) => {
        if (!result)
            return result;
        if ((0, utilities_1.isNumber)(result))
            return parseFloat(result.toString().substring(0, 1) +
                '0'.repeat(result.toString().length - 1));
        else
            return (((0, utilities_1.isString)(result)
                ? result.substring(0, 1)
                : String(result.substring(0, 1))) + '*'.repeat(result.length - 1));
    },
    encrypt: (_, __, ___, ____, result) => {
        if (!result)
            return result;
        if ((0, utilities_1.isNumber)(result))
            return encryptionHandler.encryptNumber(parseFloat(result));
        else
            return encryptionHandler.encryptString(result);
    },
};
class DataProtectorHandler {
    constructor(encryptor = undefined) {
        this.protectData = (source, args, context, info, result) => {
            if (!result)
                return result;
            args.parentType = this.fetchParentType(info);
            args.directiveField = this.getDirectiveField(info);
            args.selections = this.getFieldSelections(info);
            if (!lodash_1.default.isEmpty(args.directiveFields))
                return this.handleforFields(source, args, context, info, result);
            return this.handleForDataType(source, args, context, info, result);
        };
        this.getFieldSelections = (info) => {
            if (info.parentType.name.toLowerCase() !== 'query')
                return [];
            for (let field of info.fieldNodes) {
                if (field.selectionSet && info.fieldName === field.name.value) {
                    return field.selectionSet.selections;
                }
            }
            return [];
        };
        this.getDirectiveField = (info) => {
            return info.parentType.name.toLowerCase() !== 'query' ? info.fieldName : "";
        };
        this.fetchParentType = (info) => {
            return info.parentType.name.toLowerCase() !== 'query' ? info.parentType.name.toLowerCase() : info.returnType.name.toLowerCase();
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
                        directiveField: (args.directiveField
                            ? args.directiveField.concat('.')
                            : '') + args.directiveFields[args.currentField],
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
                let protectedData = this.handleForDataType(source, args, context, info, data);
                if (protectedData && protectedData !== null)
                    protectedArr.push(protectedData);
            }
            return protectedArr;
        };
        this.handleObjectData = (source, args, context, info, result) => {
            var _a;
            if (args.selections !== undefined && args.selections.length === 0)
                return result;
            let isValid = false;
            let protectedResult = result;
            for (let selectionKey in args.selections) {
                let key = args.selections[selectionKey].name.value;
                let data = result[key];
                protectedResult[key] = this.handleForDataType(source, {
                    ...args,
                    directiveField: (args.directiveField
                        ? args.directiveField.concat('.')
                        : '') + key,
                    selections: (_a = args.selections[selectionKey].selectionSet) === null || _a === void 0 ? void 0 : _a.selections
                }, context, info, data);
                if (protectedResult[key] !== null)
                    isValid = true;
            }
            return isValid ? protectedResult : null;
        };
        if (encryptor)
            encryptionHandler = encryptor;
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
        console.log('data', args.directiveField);
        if (typeof data === 'object')
            return this.handleObjectData(source, args, context, info, data);
        if (lodash_1.default.isArray(data))
            return this.handleListData(source, args, context, info, data);
        let userAuthority = getUserAuthorityForResource(args.parentType, args.directiveField, context);
        if (userAuthority === 'read' && info.parentType.name.toLowerCase() === 'query')
            return data;
        else if (userAuthority === 'write' && info.parentType.name.toLowerCase() === 'query')
            userAuthority = 'N/A';
        return securedDirectivesFunctionsMap[userAuthority !== 'N/A' ? userAuthority : args.directiveType](source, args, context, info, data);
    }
}
exports.DataProtectorHandler = DataProtectorHandler;
//# sourceMappingURL=DataProtectorHandler.js.map