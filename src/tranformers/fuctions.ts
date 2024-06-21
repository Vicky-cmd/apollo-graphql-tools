import type { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql'
import type { IDataProtectorHandler, ProtectorContext, TProtectArgs } from '../types'
import type { Maybe, ProtectionType } from '../types/graphql'

export const fieldResolver = <
   TSource,
   TContext extends ProtectorContext = any,
   TArgs = any,
   TResult = unknown
>(
   handler: IDataProtectorHandler<TContext>,
   resolve: GraphQLFieldResolver<TSource, TContext, TArgs, TResult>,
   resource: string,
   directiveType: Maybe<ProtectionType>,
   directiveFields: string[] = [],
): GraphQLFieldResolver<TSource, TContext, TArgs, Promise<TResult>> => {
   return async function (
      source: TSource,
      args: TArgs,
      context: TContext,
      info: GraphQLResolveInfo,
   ): Promise<TResult> {
      const result = await resolve(source, args, context, info)
      return handler.protectData(
         source,
         {
            ...args,
            resource,
            directiveType,
            directiveFields,
         },
         context,
         info,
         result,
      ) as TResult
   }
}

export const fieldResolverForObject = <TSource, TContext extends ProtectorContext, TResult = unknown>(
   handler: IDataProtectorHandler<TContext>,
   isSubArray: boolean,
   fieldEntry: string,
   resolve: GraphQLFieldResolver<TSource, TContext, TProtectArgs, TResult>,
   resource: string,
   directiveType: Maybe<ProtectionType>,
): GraphQLFieldResolver<TSource, TContext, TProtectArgs, Promise<TResult>> => {
   return async function (
      source: TSource,
      args: TProtectArgs,
      context: TContext,
      info: GraphQLResolveInfo,
   ): Promise<TResult> {
      if (isSubArray)
         args.directiveFields = fieldEntry
            .substring(fieldEntry.indexOf('.') + 1, fieldEntry.length)
            .split('|')
      let result = await resolve(source, args, context, info)
      return handler.protectData(
         source,
         {
            ...args,
            resource,
            directiveType,
         },
         context,
         info,
         result,
      )
   }
}

export const extractFields = (field: string) => {
   if (field.includes('.'))
      return {
         field: field.split('.')[0],
         isSubArray: true,
      }

   return {
      field,
      isSubArray: false,
   }
}
