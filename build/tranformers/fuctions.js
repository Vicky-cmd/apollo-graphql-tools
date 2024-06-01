"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldResolver = void 0;
const fieldResolver = (handler, resolve, type) => {
    return async function (source, args, context, info) {
        const result = await resolve(source, args, context, info);
        return handler.protectData(source, {
            ...args,
            directiveType: type,
        }, context, info, result);
    };
};
exports.fieldResolver = fieldResolver;
//# sourceMappingURL=fuctions.js.map