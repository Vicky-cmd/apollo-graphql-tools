import type { ContextFunction } from '@apollo/server';
import type { ApolloError } from 'apollo-server-express';
import type { Request, Response } from 'express';
import type { GraphQLSchema } from 'graphql/type';
import type { PathComponent } from 'jsonpath';

export interface ExpressContext {
   req: Request
   res: Response
}

export type Context<T = object> = T

export interface Authority {
   authority: String
   resources: string[]
}

export interface ProtectorContext {
   authContext: AuthenticationContext
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

export interface IAuthenticationProviderProps<T extends ProtectorContext> {
   authorization: String
   req: Request
   res?: Response
   appContext?: T
}

export interface IAuthProps<T extends ExpressContext & ProtectorContext> {
   context: T
}

export interface IAuthProviderProps<
   T extends ExpressContext & ProtectorContext
> {
   context: Context | ContextFunction<any, T>
}



export interface Dictionary<T> {
    [Key: string]: T
}

export interface Node {
    path: PathComponent[]
    value: any
}
 
export interface TProtectedTransformerProps {
    schema: GraphQLSchema
    handler?: IDataProtectorHandler
}

export interface IDataProtectorHandler {
    protectData: (
       source: any,
       args: any,
       context: any,
       info: any,
       result: any,
    ) => any
    handleforFields: (
       source: any,
       args: any,
       context: any,
       info: any,
       result: any,
    ) => any
    changeValueByPath: (object: object, path: string, value: any) => void
    changeValuesByPath: (object: object, nodes: Node[], lastPropertyName: string) => object
    handleListData: (
       source: any,
       args: any,
       context: any,
       info: any,
       result: object[],
    ) => any
    handleObjectData: (
       source: any,
       args: any,
       context: any,
       info: any,
       result: String,
    ) => any
    handleForDataType: (
       source: any,
       args: any,
       context: any,
       info: any,
       data: any,
    ) => any
 }
  
export const HTTPStatus: Record<string,string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    511: "Network Authentication Required",
    520: "Unknown Error",
    522: "Origin Connection Time-out",
    524: "A Timeout Occurred",
    525: "SSL Handshake Failed",
}
