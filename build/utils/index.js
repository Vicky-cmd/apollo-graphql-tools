"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructResponseFromContext = exports.constructErrorResponseFromContext = void 0;
const constructErrorResponseFromContext = (ctx) => {
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
};
exports.constructErrorResponseFromContext = constructErrorResponseFromContext;
const constructResponseFromContext = (ctx, result) => {
    return {
        ...ctx.response,
        ...result,
        http: {
            status: result.errors
                ? parseInt(String(result.errors[0].extensions.code))
                : 200,
            headers: ctx.response.http.headers,
        },
    };
};
exports.constructResponseFromContext = constructResponseFromContext;
//# sourceMappingURL=index.js.map