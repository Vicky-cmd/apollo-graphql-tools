"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Oauth2AuthenticatorProvider = void 0;
const axios_1 = __importDefault(require("../../services/axios"));
const logging_1 = require("../../logging");
const AuthoritiesProvider_1 = require("../AuthoritiesProvider");
const axios_2 = require("axios");
const apollo_server_express_1 = require("apollo-server-express");
const utils_1 = require("../../utils");
class Oauth2AuthenticatorProvider {
    constructor(props = {}) {
        this.userinfo_endpoint = "";
        this.openidConfiguration = {};
        this.logger = new logging_1.Logger();
        if (process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT)
            this.userinfo_endpoint = process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT.toString();
        else if (props.userinfo_endpoint)
            this.userinfo_endpoint = props.userinfo_endpoint.toString();
        else if (props.issuer && props.domain) {
            axios_1.default.get(`https://${props.domain}/oauth2/${props.issuer}/.well-known/openid-configuration`).then((response) => {
                this.openidConfiguration = response.data;
                this.userinfo_endpoint = this.openidConfiguration.userinfo_endpoint.toString();
            }).catch((err) => {
                throw new Error("Error fetching token endpoint from issuer: " + err);
            });
        }
        else
            throw new Error("Missing Oauth2 Mandatory Configuration. Please provide either userinfo_endpoint or issuer and domain.");
        if (props.authoritiesProvider)
            this.authoritiesProvider = props.authoritiesProvider;
        else if (props.mongoConfig)
            this.authoritiesProvider = new AuthoritiesProvider_1.MongoAuthoritiesProvider(props.mongoConfig);
        else
            this.authoritiesProvider = new AuthoritiesProvider_1.MongoAuthoritiesProvider();
    }
    async authenticate(tokenDetails) {
        try {
            let response = await axios_1.default.get(this.userinfo_endpoint, {
                headers: {
                    Authorization: tokenDetails.authorization.toString()
                }
            });
            if (!response.data.sub) {
                throw new apollo_server_express_1.ApolloError(utils_1.HTTPStatus[401], "401");
            }
            let authorities = await this.authoritiesProvider.getAuthorities(response.data.sub.toString());
            return {
                authContext: {
                    status: "200",
                    token: tokenDetails.authorization,
                    methodType: "GET",
                    authenticated: true,
                    username: response.data.preferred_username ? response.data.preferred_username.toString() : response.data.sub.toString(),
                    authorities,
                },
            };
        }
        catch (error) {
            this.logger.error("Error fetching userinfo from token: ", error);
            if (error instanceof axios_2.AxiosError && error.response) {
                let status = error.status ? error.status : (error.response.status ? error.response.status : 500);
                throw new apollo_server_express_1.ApolloError(utils_1.HTTPStatus[status], String(status));
            }
        }
        throw new apollo_server_express_1.ApolloError(utils_1.HTTPStatus[500], '500');
    }
}
exports.Oauth2AuthenticatorProvider = Oauth2AuthenticatorProvider;
//# sourceMappingURL=index.js.map