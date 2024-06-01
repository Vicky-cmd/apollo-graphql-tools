import type { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql'
import type { IDataProtectorHandler } from '../types'

export const fieldResolver =  <
   TSource,
   TContext,
   TArgs = any,
   TResult = unknown
> (
   handler: IDataProtectorHandler,
   resolve: GraphQLFieldResolver<TSource, TContext, TArgs, TResult>,
   type: string,
):  GraphQLFieldResolver<TSource, TContext, TArgs, Promise<TResult>> => {
   return async function(source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo):
    Promise<TResult> {
      const result = await resolve(source, args, context, info)
      return handler.protectData(
         source,
         {
            ...args,
            directiveType: type,
         },
         context,
         info,
         result,
      ) as TResult;
   }
}
