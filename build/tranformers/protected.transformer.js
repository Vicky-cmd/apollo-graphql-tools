"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedDirectiveTransformer = void 0;
const utils_1 = require("@graphql-tools/utils");
const graphql_1 = require("graphql");
const DataProtectorHandler_js_1 = require("./DataProtectorHandler.js");
const fuctions_js_1 = require("./fuctions.js");
const lodash_1 = __importDefault(require("lodash"));
const protectedDirectiveTransformer = ({ schema, handler = new DataProtectorHandler_js_1.DataProtectorHandler(), }) => {
    const directiveName = 'Secured';
    return (0, utils_1.mapSchema)(schema, {
        [utils_1.MapperKind.OBJECT_TYPE]: objectConfig => {
            var _a;
            const securedDirective = (_a = (0, utils_1.getDirective)(schema, objectConfig, directiveName)) === null || _a === void 0 ? void 0 : _a[0];
            if (!securedDirective)
                return objectConfig;
            let { type, fields } = securedDirective;
            const config = objectConfig.toConfig();
            let keys = Object.keys(config.fields);
            if (lodash_1.default.isEmpty(fields)) {
                for (let key in config.fields) {
                    let { resolve = graphql_1.defaultFieldResolver } = config.fields[key];
                    config.fields[key].resolve = (0, fuctions_js_1.fieldResolver)(handler, resolve, type, fields);
                }
                return new graphql_1.GraphQLObjectType(config);
            }
            for (let fieldIndex in fields) {
                if (!fields[fieldIndex] || fields[fieldIndex] == null)
                    continue;
                let fieldEntry = fields[fieldIndex];
                let { field, isSubArray } = (0, fuctions_js_1.extractFields)(fieldEntry);
                if (keys.includes(field)) {
                    let { resolve = graphql_1.defaultFieldResolver } = config.fields[field];
                    config.fields[field].resolve = (0, fuctions_js_1.fieldResolverForObject)(handler, isSubArray, fieldEntry, resolve, type);
                }
            }
            return new graphql_1.GraphQLObjectType(config);
        },
        [utils_1.MapperKind.OBJECT_FIELD]: fieldConfig => {
            var _a;
            const securedDirective = (_a = (0, utils_1.getDirective)(schema, fieldConfig, directiveName)) === null || _a === void 0 ? void 0 : _a[0];
            if (!securedDirective)
                return fieldConfig;
            const { resolve = graphql_1.defaultFieldResolver } = fieldConfig;
            let { type } = securedDirective;
            fieldConfig.resolve = (0, fuctions_js_1.fieldResolver)(handler, resolve, type);
            return fieldConfig;
        },
    });
};
exports.protectedDirectiveTransformer = protectedDirectiveTransformer;
//# sourceMappingURL=protected.transformer.js.map