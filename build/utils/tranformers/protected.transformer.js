"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedDirectiveTransformer = void 0;
const utils_1 = require("@graphql-tools/utils");
const graphql_1 = require("graphql");
const DataProtectorHandler_js_1 = require("./DataProtectorHandler.js");
const protectedDirectiveTransformer = ({ schema, handler = new DataProtectorHandler_js_1.DataProtectorHandler(), }) => {
    const directiveName = 'Protected';
    return (0, utils_1.mapSchema)(schema, {
        [utils_1.MapperKind.OBJECT_TYPE]: objectConfig => {
            var _a;
            const protectedDirective = (_a = (0, utils_1.getDirective)(schema, objectConfig, directiveName)) === null || _a === void 0 ? void 0 : _a[0];
            if (protectedDirective) {
                let { type, fields } = protectedDirective;
                const config = objectConfig.toConfig();
                let keys = Object.keys(config.fields);
                if (fields && fields.length > 0) {
                    for (let fieldIndex in fields) {
                        if (!fields[fieldIndex] || fields[fieldIndex] == null)
                            continue;
                        let fieldEntry = fields[fieldIndex];
                        let field = fieldEntry;
                        let isSubArray = false;
                        if (field.includes('.')) {
                            field = field.split('.')[0];
                            isSubArray = true;
                        }
                        if (keys.includes(field)) {
                            let configField = config.fields[field];
                            let { resolve = graphql_1.defaultFieldResolver } = configField;
                            configField.resolve = async function (source, args, context, info) {
                                if (isSubArray)
                                    args.directiveFields = fieldEntry
                                        .substring(fieldEntry.indexOf('.') + 1, fieldEntry.length)
                                        .split('|');
                                let result = await resolve(source, args, context, info);
                                return handler.protectData(source, {
                                    ...args,
                                    directiveType: type,
                                }, context, info, result);
                            };
                        }
                    }
                }
                else {
                    for (let key in config.fields) {
                        let field = config.fields[key];
                        let { resolve = graphql_1.defaultFieldResolver } = field;
                        field.resolve = async function (source, args, context, info) {
                            let result = await resolve(source, args, context, info);
                            return handler.protectData(source, {
                                ...args,
                                directiveType: type,
                                directiveFields: fields,
                            }, context, info, result);
                        };
                    }
                }
                return new graphql_1.GraphQLObjectType(config);
            }
            return objectConfig;
        },
        [utils_1.MapperKind.OBJECT_FIELD]: fieldConfig => {
            var _a;
            const protectedDirective = (_a = (0, utils_1.getDirective)(schema, fieldConfig, directiveName)) === null || _a === void 0 ? void 0 : _a[0];
            const { resolve = graphql_1.defaultFieldResolver } = fieldConfig;
            if (protectedDirective) {
                let { type } = protectedDirective;
                fieldConfig.resolve = async function (source, args, context, info) {
                    const result = await resolve(source, args, context, info);
                    return handler.protectData(source, {
                        ...args,
                        directiveType: type,
                    }, context, info, result);
                };
            }
            return fieldConfig;
        },
    });
};
exports.protectedDirectiveTransformer = protectedDirectiveTransformer;
//# sourceMappingURL=protected.transformer.js.map