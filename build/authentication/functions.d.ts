import type { ExpressContext, ProtectorContext } from '../types';
import type { IAuthProps, IAuthProviderProps } from './types';
export declare const authenticationContextProvidor: <T extends ExpressContext & ProtectorContext>(props: IAuthProviderProps<T>) => (context: T) => Promise<T>;
export declare const applyAuthenticationContext: <T extends ExpressContext & ProtectorContext>(props: IAuthProps<T>) => Promise<T>;
//# sourceMappingURL=functions.d.ts.map