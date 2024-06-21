import type { Request, Response } from 'express';
import type { GraphQLSchema } from 'graphql/type';
import type { PathComponent } from 'jsonpath';
import type { AuthenticationContext, IAuthenticationProvider } from '../authentication/types';


export interface IAuthPluginOptions<T extends ProtectorContext> {
   enabled?: boolean
   enableSchemaTransform?: boolean
   handler?: IDataProtectorHandler<T>
   encryptionHandler?: IEncryptionManager
   encryptionProps?: EncryptionManagerProps
   authenticationProvider?: IAuthenticationProvider<ProtectorContext>
}

export interface ExpressContext {
   req: Request
   res: Response
}

export interface ProtectorContext {
   authContext: AuthenticationContext
}

export interface Dictionary<T> {
   [Key: string]: T
}

export interface Node {
   path: PathComponent[]
   value: any
}

export interface TProtectedTransformerProps<T extends ProtectorContext> {
   schema: GraphQLSchema
   handler: IDataProtectorHandler<T>
}

export interface IDataProtectorHandler<T extends ProtectorContext> {
   protectData: (
      source: any,
      args: any,
      context: T,
      info: any,
      result: any,
   ) => any
   handleforFields: (
      source: any,
      args: any,
      context: T,
      info: any,
      result: any,
   ) => any
   changeValueByPath: (object: object, path: string, value: any) => void
   changeValuesByPath: (object: object, nodes: Node[], lastPropertyName: string) => object
   handleListData: (
      source: any,
      args: any,
      context: T,
      info: any,
      result: object[],
   ) => any
   handleObjectData: (
      source: any,
      args: any,
      context: T,
      info: any,
      result: String,
   ) => any
   handleForDataType: (
      source: any,
      args: any,
      context: T,
      info: any,
      data: any,
   ) => any
}

export type TProtectArgs<TArgs extends object = {}> = TArgs & {
   directiveFields: string[];
};

export type TokenizationFactor = {
   additionFactor: number
   multiplicationFactor: number
}


export interface EncryptionManagerProps {
   secretKey?: string
   additionFactor?: number
   multiplicationFactor?: number
   tokenizationFactors?: Record<number, TokenizationFactor>
}

export interface IEncryptionManager {
   encryptNumber: (value: number) => number
   decryptNumber: (value: number) => number
   encryptString: (value: string) => string
   decryptString: (value: string) => string
}