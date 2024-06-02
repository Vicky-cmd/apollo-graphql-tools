"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationManagerPlugin = void 0;
const execute_js_1 = require("graphql/execution/execute.js");
const authentication_1 = require("../authentication");
const logging_1 = require("../logging");
const protected_transformer_js_1 = require("../tranformers/protected.transformer.js");
const utils_1 = require("../utils");
const DataProtectorHandler_1 = require("../tranformers/DataProtectorHandler");
const encryption_1 = require("../encryption");
const restrictedOperations = ['IntrospectionQuery', '__ApolloGetServiceDefinition__'];
let config = {
    handler: new DataProtectorHandler_1.DataProtectorHandler()
};
class AuthenticationManagerPlugin {
    constructor(pluginConfig = {
        enabled: true,
        enableSchemaTransform: true,
    }) {
        this.initializeConfig = () => {
            if (config.enabled === undefined) {
                config.enabled = true;
            }
            else if (config.enabled === false) {
                logging_1.logger.debug('AuthenticationManagerPlugin disabled');
            }
            else {
                if (config.enableSchemaTransform === undefined) {
                    config.enableSchemaTransform = true;
                }
                else if (config.enableSchemaTransform === false) {
                    logging_1.logger.debug('Schema Transform Disabled');
                }
                else {
                    if (!config.handler) {
                        if (config.encryptionHandler)
                            config.handler = new DataProtectorHandler_1.DataProtectorHandler(config.encryptionHandler);
                        else if (config.encryptionProps)
                            config.handler = new DataProtectorHandler_1.DataProtectorHandler(new encryption_1.EncryptionHandler(config.encryptionProps));
                        else
                            config.handler = new DataProtectorHandler_1.DataProtectorHandler();
                    }
                    else {
                        logging_1.logger.debug('Data Protector Handler Initialized');
                        if (config.encryptionHandler)
                            logging_1.logger.error("Invalid configuration for DataProtectorHandler... Skipping encryption handler configuration");
                    }
                }
            }
        };
        config = pluginConfig;
        this.initializeConfig();
    }
    async requestDidStart(_) {
        return {
            async responseForOperation(ctx) {
                var _a, _b;
                const { request, document } = ctx;
                if ((_b = (_a = ctx.context.authContext) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.startsWith('AUTHERROR')) {
                    return (0, utils_1.constructErrorResponseFromContext)(ctx);
                }
                if (request.operationName && restrictedOperations.includes(request.operationName))
                    return null;
                let transformedSchema = (config === null || config === void 0 ? void 0 : config.enabled) && (config === null || config === void 0 ? void 0 : config.enableSchemaTransform) ? (0, protected_transformer_js_1.protectedDirectiveTransformer)({
                    schema: ctx.schema,
                    handler: config.handler,
                }) : ctx.schema;
                const result = await (0, execute_js_1.execute)({
                    schema: transformedSchema,
                    document,
                    contextValue: ctx.context,
                    variableValues: request.variables,
                    operationName: request.operationName,
                });
                return (0, utils_1.constructResponseFromContext)(ctx, result);
            },
            async didResolveOperation(reqContext) {
                logging_1.logger.debug("Operation Name: ", reqContext.operationName);
                if ((reqContext.operationName && restrictedOperations.includes(reqContext.operationName)) || !(config === null || config === void 0 ? void 0 : config.enabled))
                    return;
                let context = await (0, authentication_1.applyAuthenticationContext)({
                    context: reqContext.context,
                });
                if (context)
                    reqContext = {
                        ...reqContext,
                        context,
                    };
            },
        };
    }
}
exports.AuthenticationManagerPlugin = AuthenticationManagerPlugin;
//# sourceMappingURL=index.js.map