import type { ContextFunction } from '@apollo/server';
import type { ApolloError } from 'apollo-server-express';
import type { Request, Response } from 'express';
import type { GraphQLSchema } from 'graphql/type';
import type { PathComponent } from 'jsonpath';
export interface ExpressContext {
    req: Request;
    res: Response;
}
export type Context<T = object> = T;
export interface Authority {
    authority: String;
    resources: string[];
}
export interface ProtectorContext {
    authContext: AuthenticationContext;
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
export interface IAuthenticationProviderProps<T extends ProtectorContext> {
    authorization: String;
    req: Request;
    res?: Response;
    appContext?: T;
}
export interface IAuthProps<T extends ExpressContext & ProtectorContext> {
    context: T;
}
export interface IAuthProviderProps<T extends ExpressContext & ProtectorContext> {
    context: Context | ContextFunction<any, T>;
}
export interface Dictionary<T> {
    [Key: string]: T;
}
export interface Node {
    path: PathComponent[];
    value: any;
}
export interface TProtectedTransformerProps {
    schema: GraphQLSchema;
    handler?: IDataProtectorHandler;
}
export interface IDataProtectorHandler {
    protectData: (source: any, args: any, context: any, info: any, result: any) => any;
    handleforFields: (source: any, args: any, context: any, info: any, result: any) => any;
    changeValueByPath: (object: object, path: string, value: any) => void;
    changeValuesByPath: (object: object, nodes: Node[], lastPropertyName: string) => object;
    handleListData: (source: any, args: any, context: any, info: any, result: object[]) => any;
    handleObjectData: (source: any, args: any, context: any, info: any, result: String) => any;
    handleForDataType: (source: any, args: any, context: any, info: any, data: any) => any;
}
export declare const HTTPStatus: Record<string, string>;
//# sourceMappingURL=index.d.ts.map