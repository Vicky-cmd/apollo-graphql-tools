import type { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql'
import type { IDataProtectorHandler, TProtectArgs } from '../types'
import type { Maybe, ProtectionType } from '../types/graphql'

export const fieldResolver = <
   TSource,
   TContext,
   TArgs = any,
   TResult = unknown
>(
   handler: IDataProtectorHandler,
   resolve: GraphQLFieldResolver<TSource, TContext, TArgs, TResult>,
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
            directiveType,
            directiveFields,
         },
         context,
         info,
         result,
      ) as TResult
   }
}

export const fieldResolverForObject = <TSource, TContext, TResult = unknown>(
   handler: IDataProtectorHandler,
   isSubArray: boolean,
   fieldEntry: string,
   resolve: GraphQLFieldResolver<TSource, TContext, TProtectArgs, TResult>,
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
