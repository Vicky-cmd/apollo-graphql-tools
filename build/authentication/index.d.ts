import type { Dictionary } from 'lodash';
import { ExpressContext, IAuthProps, IAuthProviderProps, IAuthenticationProviderProps, ProtectorContext } from '../types/index.js';
export declare class AuthenticationProvider<T extends ProtectorContext> {
    private authServiceURI;
    private logger;
    constructor(props: Dictionary<Object>);
    authenticate(tokenDetails: IAuthenticationProviderProps<T>): Promise<ProtectorContext>;
}
export declare const authenticationContextProvidor: <T extends ExpressContext & ProtectorContext>(props: IAuthProviderProps<T>) => (context: T) => Promise<T>;
export declare const applyAuthenticationContext: <T extends ExpressContext & ProtectorContext>(props: IAuthProps<T>) => Promise<T>;
//# sourceMappingURL=index.d.ts.map