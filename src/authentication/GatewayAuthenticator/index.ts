import { ApolloError } from 'apollo-server-express';
import { AxiosError, AxiosResponse } from 'axios';
import { Logger } from '../../logging';
import axios from '../../services/axios.js';
import type {
    Dictionary,
    ProtectorContext
} from '../../types';
import type {
    IGatewayAuthenticationProviderProps,
    IAuthenticationProvider,
    IAuthenticationProviderProps,
    IAuthoritiesProvider
} from '../types';
import { HTTPStatus } from '../../utils';
import { MongoAuthoritiesProvider } from '../AuthoritiesProvider';

export class GatewayAuthenticationProvider<T extends ProtectorContext> implements IAuthenticationProvider<T>{

    private logger: Logger = new Logger();
    private validateTokenEndpoint: string;
    private authoritiesProvider: IAuthoritiesProvider | undefined;
    private filterField: string = "userID";

    constructor(props: IGatewayAuthenticationProviderProps = {
        enableAuthoritiesProvider: true,
        filterField: "userID"
    }) {
        this.logger.debug('Initializing AuthenticationProvider: ', props);
        if (process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT)
            this.validateTokenEndpoint = process.env.GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT.toString();
        else if (props.validateTokenEndpoint)
            this.validateTokenEndpoint = props.validateTokenEndpoint.toString();
        else
            this.validateTokenEndpoint = 'http://localhost:8555/api/v1/validateToken';

        if (props.enableAuthoritiesProvider !== undefined && !props.enableAuthoritiesProvider) return;
        if (props.authoritiesProvider)
            this.authoritiesProvider = props.authoritiesProvider
        else if (props.mongoConfig)
            this.authoritiesProvider = new MongoAuthoritiesProvider(props.mongoConfig);
        else
            this.authoritiesProvider = new MongoAuthoritiesProvider();

        props.filterField && (this.filterField = props.filterField);
    }

    async authenticate(
        tokenDetails: IAuthenticationProviderProps<T>,
    ): Promise<ProtectorContext> {
        try {
            let response: AxiosResponse<Dictionary<Object>> = await axios.get(
                this.validateTokenEndpoint,
                {
                    headers: {
                        Authorization: tokenDetails.authorization.toString(),
                    },
                },
            )
            let authorities = response.data.authorities ? new Map(Object.entries(response.data.authorities)) : new Map();

            if (this.authoritiesProvider && response.data[this.filterField]) {
                authorities = await this.authoritiesProvider.getAuthorities(response.data.userID.toString());
            }

            return <ProtectorContext>{
                authContext: {
                    status: "200",
                    token: tokenDetails.authorization,
                    methodType: "GET",
                    authenticated: true,
                    username: response.data.username.toString(),
                    authorities,
                },
            }
        } catch (e) {
            this.logger.error('Error in AuthenticationProvider: ', e);
            if (e instanceof AxiosError && e.response) {
                let status = e.status ? e.status : (e.response.status ? e.response.status : 500);
                throw new ApolloError(HTTPStatus[status], String(status));
            }
        }
        throw new ApolloError(HTTPStatus[500], '500');
    }
}