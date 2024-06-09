"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFields = exports.fieldResolverForObject = exports.fieldResolver = void 0;
const fieldResolver = (handler, resolve, resource, directiveType, directiveFields = []) => {
    return async function (source, args, context, info) {
        const result = await resolve(source, args, context, info);
        return handler.protectData(source, {
            ...args,
            resource,
            directiveType,
            directiveFields,
        }, context, info, result);
    };
};
exports.fieldResolver = fieldResolver;
const fieldResolverForObject = (handler, isSubArray, fieldEntry, resolve, resource, directiveType) => {
    return async function (source, args, context, info) {
        if (isSubArray)
            args.directiveFields = fieldEntry
                .substring(fieldEntry.indexOf('.') + 1, fieldEntry.length)
                .split('|');
        let result = await resolve(source, args, context, info);
        return handler.protectData(source, {
            ...args,
            resource,
            directiveType,
        }, context, info, result);
    };
};
exports.fieldResolverForObject = fieldResolverForObject;
const extractFields = (field) => {
    if (field.includes('.'))
        return {
            field: field.split('.')[0],
            isSubArray: true,
        };
    return {
        field,
        isSubArray: false,
    };
};
exports.extractFields = extractFields;
//# sourceMappingURL=fuctions.js.map