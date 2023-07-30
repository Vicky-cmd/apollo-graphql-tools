import type { ContextFunction } from '@apollo/server';
import { ApolloError } from 'apollo-server-express';
import type { Request, Response } from 'express';
import type { Dictionary } from 'lodash';
export interface ExpressContext {
    req: Request;
    res: Response;
}
type Context<T = object> = T;
export interface Authority {
    authority: String;
    resources: string[];
}
export interface ProtectorContext {
    authContext?: AuthenticationContext;
}
export interface AuthenticationContext {
    status?: String;
    methodType?: 'GET' | 'POST' | 'PUT';
    username?: String;
    token: String;
    authorities?: Map<string, Authority[]>;
    authenticated?: boolean;
    errorDetails?: ApolloError;
}
export declare class AuthenticationProvider<T extends ProtectorContext> {
    private authServiceURI;
    private logger;
    constructor(props: Dictionary<Object>);
    authenticate(tokenDetails: IAuthenticationProviderProps<T>): Promise<ProtectorContext>;
}
export interface IAuthenticationProviderProps<T extends ProtectorContext> {
    authorization: String;
    req: Request;
    res?: Response;
    appContext?: T;
}
export declare const authenticationContextProvidor: <T extends ExpressContext & ProtectorContext>(props: IAuthProviderProps<T>) => (context: T) => Promise<T>;
export declare const applyAuthenticationContext: <T extends ExpressContext & ProtectorContext>(props: IAuthProps<T>) => Promise<T>;
export interface IAuthProps<T extends ExpressContext & ProtectorContext> {
    context: T;
}
export interface IAuthProviderProps<T extends ExpressContext & ProtectorContext> {
    context: Context | ContextFunction<any, T>;
}
export {};
//# sourceMappingURL=authentication.d.ts.map