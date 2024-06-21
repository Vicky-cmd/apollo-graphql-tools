import axios from "../../services/axios";
import { Logger } from "../../logging";
import type { Dictionary, ProtectorContext } from "../../types";
import { MongoAuthoritiesProvider } from "../AuthoritiesProvider";
import type { IAuthenticationProvider, IAuthenticationProviderProps, IAuthoritiesProvider, IOauth2AuthenticatorProviderProps } from "../types";
import { AxiosError, AxiosResponse } from "axios";
import { ApolloError } from "apollo-server-express";
import { HTTPStatus } from "../../utils";

export class Oauth2AuthenticatorProvider<T extends ProtectorContext> implements IAuthenticationProvider<T>{

    private userinfo_endpoint: string = "";
    private openidConfiguration: Dictionary<Object> = {};
    private logger: Logger = new Logger();
    private authoritiesProvider: IAuthoritiesProvider;

    constructor(props: IOauth2AuthenticatorProviderProps = {}) {
        if (process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT)
            this.userinfo_endpoint = process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT.toString();
        else if (props.userinfo_endpoint)
            this.userinfo_endpoint = props.userinfo_endpoint.toString();
        else if (props.issuer && props.domain) {
            axios.get(`https://${props.domain}/oauth2/${props.issuer}/.well-known/openid-configuration`).then((response) => {
                this.openidConfiguration = response.data;
                this.userinfo_endpoint = this.openidConfiguration.userinfo_endpoint.toString();
            }).catch((err) => {
                throw new Error("Error fetching token endpoint from issuer: " + err);
            });
        } else
            throw new Error("Missing Oauth2 Mandatory Configuration. Please provide either userinfo_endpoint or issuer and domain.");

        if (props.authoritiesProvider)
            this.authoritiesProvider = props.authoritiesProvider
        else if (props.mongoConfig)
            this.authoritiesProvider = new MongoAuthoritiesProvider(props.mongoConfig);
        else
            this.authoritiesProvider = new MongoAuthoritiesProvider();
    }

    async authenticate(tokenDetails: IAuthenticationProviderProps<T>): Promise<ProtectorContext> {
        try {
            let response: AxiosResponse<Dictionary<Object>> = await axios.get(this.userinfo_endpoint, {
                headers: {
                    Authorization: tokenDetails.authorization.toString()
                }
            });
            if (!response.data.sub) {
                throw new ApolloError(HTTPStatus[401], "401");
            }

            let authorities = await this.authoritiesProvider.getAuthorities(response.data.sub.toString());
            return <ProtectorContext>{
                authContext: {
                    status: "200",
                    token: tokenDetails.authorization,
                    methodType: "GET",
                    authenticated: true,
                    username: response.data.preferred_username ? response.data.preferred_username.toString() : response.data.sub.toString(),
                    authorities,
                },
            }
        } catch (error) {
            this.logger.error("Error fetching userinfo from token: ", error);
            if (error instanceof AxiosError && error.response) {
                let status = error.status ? error.status : (error.response.status ? error.response.status : 500);
                throw new ApolloError(HTTPStatus[status], String(status));
            }
        }
        throw new ApolloError(HTTPStatus[500], '500');
    }

}