import type { GraphQLFieldResolver } from 'graphql';
import type { IDataProtectorHandler } from '../types';
export declare const fieldResolver: <TSource, TContext, TArgs = any, TResult = unknown>(handler: IDataProtectorHandler, resolve: GraphQLFieldResolver<TSource, TContext, TArgs, TResult>, type: string) => GraphQLFieldResolver<TSource, TContext, TArgs, Promise<TResult>>;
//# sourceMappingURL=fuctions.d.ts.map