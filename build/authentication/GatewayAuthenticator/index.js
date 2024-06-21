"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayAuthenticationProvider = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const axios_1 = require("axios");
const logging_1 = require("../../logging");
const axios_js_1 = __importDefault(require("../../services/axios.js"));
const utils_1 = require("../../utils");
const AuthoritiesProvider_1 = require("../AuthoritiesProvider");
class GatewayAuthenticationProvider {
    constructor(props = {
        enableAuthoritiesProvider: true,
        filterField: "userID"
    }) {
        this.logger = new logging_1.Logger();
        this.filterField = "userID";
        this.logger.debug('Initializing AuthenticationProvider: ', props);
        if (process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT)
            this.validateTokenEndpoint = process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT.toString();
        else if (props.validateTokenEndpoint)
            this.validateTokenEndpoint = props.validateTokenEndpoint.toString();
        else
            this.validateTokenEndpoint = 'http://localhost:8555/api/v1/validateToken';
        if (props.enableAuthoritiesProvider !== undefined && !props.enableAuthoritiesProvider)
            return;
        if (props.authoritiesProvider)
            this.authoritiesProvider = props.authoritiesProvider;
        else if (props.mongoConfig)
            this.authoritiesProvider = new AuthoritiesProvider_1.MongoAuthoritiesProvider(props.mongoConfig);
        else
            this.authoritiesProvider = new AuthoritiesProvider_1.MongoAuthoritiesProvider();
        props.filterField && (this.filterField = props.filterField);
    }
    async authenticate(tokenDetails) {
        try {
            let response = await axios_js_1.default.get(this.validateTokenEndpoint, {
                headers: {
                    Authorization: tokenDetails.authorization.toString(),
                },
            });
            let authorities = response.data.authorities ? new Map(Object.entries(response.data.authorities)) : new Map();
            if (this.authoritiesProvider && response.data[this.filterField]) {
                authorities = await this.authoritiesProvider.getAuthorities(response.data.userID.toString());
            }
            return {
                authContext: {
                    status: "200",
                    token: tokenDetails.authorization,
                    methodType: "GET",
                    authenticated: true,
                    username: response.data.username.toString(),
                    authorities,
                },
            };
        }
        catch (e) {
            this.logger.error('Error in AuthenticationProvider: ', e);
            if (e instanceof axios_1.AxiosError && e.response) {
                let status = e.status ? e.status : (e.response.status ? e.response.status : 500);
                throw new apollo_server_express_1.ApolloError(utils_1.HTTPStatus[status], String(status));
            }
        }
        throw new apollo_server_express_1.ApolloError(utils_1.HTTPStatus[500], '500');
    }
}
exports.GatewayAuthenticationProvider = GatewayAuthenticationProvider;
//# sourceMappingURL=index.js.map