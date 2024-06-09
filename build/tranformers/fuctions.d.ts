import type { GraphQLFieldResolver } from 'graphql';
import type { IDataProtectorHandler, TProtectArgs } from '../types';
import type { Maybe, ProtectionType } from '../types/graphql';
export declare const fieldResolver: <TSource, TContext, TArgs = any, TResult = unknown>(handler: IDataProtectorHandler, resolve: GraphQLFieldResolver<TSource, TContext, TArgs, TResult>, resource: string, directiveType: Maybe<ProtectionType>, directiveFields?: string[]) => GraphQLFieldResolver<TSource, TContext, TArgs, Promise<TResult>>;
export declare const fieldResolverForObject: <TSource, TContext, TResult = unknown>(handler: IDataProtectorHandler, isSubArray: boolean, fieldEntry: string, resolve: GraphQLFieldResolver<TSource, TContext, {
    directiveFields: string[];
}, TResult>, resource: string, directiveType: Maybe<ProtectionType>) => GraphQLFieldResolver<TSource, TContext, {
    directiveFields: string[];
}, Promise<TResult>>;
export declare const extractFields: (field: string) => {
    field: string;
    isSubArray: boolean;
};
//# sourceMappingURL=fuctions.d.ts.map