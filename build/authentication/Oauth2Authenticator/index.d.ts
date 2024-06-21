import type { ProtectorContext } from "../../types";
import type { IAuthenticationProvider, IAuthenticationProviderProps, IOauth2AuthenticatorProviderProps } from "../types";
export declare class Oauth2AuthenticatorProvider<T extends ProtectorContext> implements IAuthenticationProvider<T> {
    private userinfo_endpoint;
    private openidConfiguration;
    private logger;
    private authoritiesProvider;
    constructor(props?: IOauth2AuthenticatorProviderProps);
    authenticate(tokenDetails: IAuthenticationProviderProps<T>): Promise<ProtectorContext>;
}
//# sourceMappingURL=index.d.ts.map