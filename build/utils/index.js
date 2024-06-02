"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPStatus = exports.constructResponseFromContext = exports.constructErrorResponseFromContext = void 0;
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
exports.HTTPStatus = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    511: "Network Authentication Required",
    520: "Unknown Error",
    522: "Origin Connection Time-out",
    524: "A Timeout Occurred",
    525: "SSL Handshake Failed",
};
//# sourceMappingURL=index.js.map