import type { ProtectorContext } from '../../types';
import type { IGatewayAuthenticationProviderProps, IAuthenticationProvider, IAuthenticationProviderProps } from '../types';
export declare class GatewayAuthenticationProvider<T extends ProtectorContext> implements IAuthenticationProvider<T> {
    private logger;
    private validateTokenEndpoint;
    private authoritiesProvider;
    private filterField;
    constructor(props?: IGatewayAuthenticationProviderProps);
    authenticate(tokenDetails: IAuthenticationProviderProps<T>): Promise<ProtectorContext>;
}
//# sourceMappingURL=index.d.ts.map