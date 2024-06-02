"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAuthenticationContext = exports.authenticationContextProvidor = exports.AuthenticationProvider = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const axios_1 = require("axios");
const index_js_1 = require("../logging/index.js");
const axios_js_1 = __importDefault(require("../services/axios.js"));
const utils_1 = require("../utils");
class AuthenticationProvider {
    constructor(props) {
        this.authServiceURI = process.env.authServiceURI
            ? process.env.authServiceURI
            : 'http://localhost:8555/api/v1/validateToken';
        this.logger = new index_js_1.Logger();
        this.logger.debug('Initializing AuthenticationProvider: ', props);
        if (props.authServiceURI)
            this.authServiceURI = props.authServiceURI.toString();
    }
    async authenticate(tokenDetails) {
        try {
            let response = await axios_js_1.default.get(this.authServiceURI, {
                headers: {
                    Authorization: tokenDetails.authorization.toString(),
                },
            });
            return {
                authContext: response.data,
            };
        }
        catch (e) {
            this.logger.error('Error in AuthenticationProvider: ', e);
            if (e instanceof axios_1.AxiosError && e.response) {
                throw new apollo_server_express_1.ApolloError(String(e.status ? e.status : 500), utils_1.HTTPStatus[e.status ? e.status : 500]);
            }
        }
        throw new apollo_server_express_1.ApolloError('AUTHENTICATION_FAILURE', '500');
    }
}
exports.AuthenticationProvider = AuthenticationProvider;
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
    let provider = new AuthenticationProvider({});
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
    let provider = new AuthenticationProvider({});
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
//# sourceMappingURL=index.js.map