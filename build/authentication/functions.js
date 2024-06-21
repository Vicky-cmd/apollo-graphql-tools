"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAuthenticationContext = exports.authenticationContextProvidor = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const axios_1 = require("axios");
const GatewayAuthenticator_1 = require("../authentication/GatewayAuthenticator");
const getContext = async (context, rootContext) => {
    if (context) {
        if (typeof context === 'function')
            return await context(rootContext);
        else
            return context;
    }
    return rootContext;
};
const authenticationContextProvidor = (props) => {
    let provider = props.authenticationProvider ?
        props.authenticationProvider : new GatewayAuthenticator_1.GatewayAuthenticationProvider();
    return async (context) => {
        var _a;
        let req = context.req;
        if (!req.headers.authorization)
            throw new apollo_server_express_1.ApolloError('Unathorized', '401');
        const token = req.headers.authorization || '';
        try {
            let protectorContext = await provider.authenticate({
                authorization: token,
                req,
            });
            context = await getContext(props.context, context);
            context.authContext = protectorContext.authContext;
            return context;
        }
        catch (e) {
            console.error((e instanceof axios_1.AxiosError) ? (_a = e.response) === null || _a === void 0 ? void 0 : _a.data : e);
            throw new apollo_server_express_1.AuthenticationError('Authentication Failed!');
        }
    };
};
exports.authenticationContextProvidor = authenticationContextProvidor;
const applyAuthenticationContext = async (props) => {
    let { context } = props;
    let provider = props.authenticationProvider ?
        props.authenticationProvider : new GatewayAuthenticator_1.GatewayAuthenticationProvider();
    let req = context.req;
    if (!req.headers.authorization)
        throw new apollo_server_express_1.ApolloError('Unathorized', '401');
    const token = req.headers.authorization || '';
    context = await getContext(props.context, context);
    try {
        let protectorContext = await provider.authenticate({
            authorization: token,
            req,
        });
        context.authContext = protectorContext.authContext;
    }
    catch (e) {
        context.authContext = {
            token: 'AUTHERROR',
            errorDetails: (e instanceof apollo_server_express_1.ApolloError) ? e : new apollo_server_express_1.AuthenticationError('Authentication Failed!'),
        };
    }
    return context;
};
exports.applyAuthenticationContext = applyAuthenticationContext;
//# sourceMappingURL=functions.js.map