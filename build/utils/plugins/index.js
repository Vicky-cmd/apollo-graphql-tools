"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationManagerPlugin = void 0;
const execute_js_1 = require("graphql/execution/execute.js");
const authentication_js_1 = require("../auth/authentication.js");
const protected_transformer_js_1 = require("../tranformers/protected.transformer.js");
class AuthenticationManagerPlugin {
    constructor(_ = {}) { }
    async requestDidStart(_) {
        return {
            async responseForOperation(ctx) {
                const { request, document } = ctx;
                if (ctx.context.authContext &&
                    ctx.context.authContext.token &&
                    ctx.context.authContext.token.startsWith('AUTHERROR')) {
                    return {
                        ...ctx.response,
                        errors: [
                            {
                                message: ctx.context.authContext.errorDetails.message,
                                extensions: {
                                    code: ctx.context.authContext.errorDetails
                                        .extensions.code,
                                    exception: ctx.context.authContext.errorDetails
                                        .extensions.exception,
                                },
                            },
                        ],
                        http: {
                            status: isNaN(Number(ctx.context.authContext.errorDetails.extensions
                                .code))
                                ? 500
                                : Number(ctx.context.authContext.errorDetails.extensions
                                    .code),
                            headers: ctx.response.http.headers,
                        },
                    };
                }
                if (request.operationName === 'IntrospectionQuery' ||
                    request.operationName === '__ApolloGetServiceDefinition__')
                    return null;
                let transformedSchema = (0, protected_transformer_js_1.protectedDirectiveTransformer)({
                    schema: ctx.schema,
                });
                const result = await (0, execute_js_1.execute)({
                    schema: transformedSchema,
                    document,
                    contextValue: ctx.context,
                    variableValues: request.variables,
                    operationName: request.operationName,
                });
                const response = {
                    ...ctx.response,
                    ...result,
                    http: {
                        status: result.errors
                            ? parseInt(String(result.errors[0].extensions.code))
                            : 200,
                        headers: ctx.response.http.headers,
                    },
                };
                return response;
            },
            async didResolveOperation(reqContext) {
                var _a, _b;
                console.log(reqContext.operationName);
                if (reqContext.operationName === 'IntrospectionQuery' ||
                    reqContext.operationName === '__ApolloGetServiceDefinition__')
                    return;
                console.log((_a = reqContext.request.http) === null || _a === void 0 ? void 0 : _a.headers.get('authorization'));
                let context = await (0, authentication_js_1.applyAuthenticationContext)({
                    context: reqContext.context,
                });
                if (context)
                    reqContext = {
                        ...reqContext,
                        context,
                    };
                console.log((_b = reqContext.request.http) === null || _b === void 0 ? void 0 : _b.headers.get('authorization'));
            },
        };
    }
}
exports.AuthenticationManagerPlugin = AuthenticationManagerPlugin;
//# sourceMappingURL=index.js.map