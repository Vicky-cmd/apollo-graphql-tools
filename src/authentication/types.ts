import type { ContextFunction } from "@apollo/server";
import type { ApolloError } from "apollo-server-express";
import type { Request, Response } from 'express';
import type { ExpressContext, ProtectorContext } from "../types";
import type { MongoClient } from "mongodb";

export type Context<T = object> = T

export interface Authority {
    authority: String
    resources: string[]
}

export interface AuthenticationContext {
    status?: String
    methodType?: 'GET' | 'POST' | 'PUT'
    username?: String
    token: String
    authorities?: Map<string, Authority[]>
    authenticated?: boolean
    errorDetails?: ApolloError
}

export interface IAuthenticationProvider<T extends ProtectorContext> {
    authenticate: (tokenDetails: IAuthenticationProviderProps<T>) => Promise<ProtectorContext>;
}

export interface IAuthProps<T extends ExpressContext & ProtectorContext> {
    context: T,
    authenticationProvider?: IAuthenticationProvider<T>
}

export interface IAuthProviderProps<
    T extends ExpressContext & ProtectorContext
> {
    authenticationProvider?: IAuthenticationProvider<T>
    context: Context | ContextFunction<any, T>
}

export interface IAuthenticationProviderProps<T extends ProtectorContext> {
    authorization: String
    req: Request
    res?: Response
    appContext?: T
}

export type AuthenticationProviderProps = {
    authoritiesProvider?: IAuthoritiesProvider
    mongoConfig?: MongoAuthoritiesProviderProps
}

export type IGatewayAuthenticationProviderProps = AuthenticationProviderProps & {
    filterField?: string
    validateTokenEndpoint?: string
    enableAuthoritiesProvider?: boolean
}

export type IOauth2AuthenticatorProviderProps = AuthenticationProviderProps & {
    userinfo_endpoint?: string
    domain?: string
    issuer?: string
}

export interface IAuthoritiesProvider {
    getAuthorities: (userId: String) => Promise<Map<string, Authority[]>>
}

export interface AuthoritiesProviderProps { }

export interface MongoAuthoritiesProviderProps extends AuthoritiesProviderProps {
    client?: MongoClient
    datasourceConnection?: string
    databaseName?: string
    collectionName?: string
}