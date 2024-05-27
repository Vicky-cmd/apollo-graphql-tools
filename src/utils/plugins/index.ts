import type {
   ApolloServerPlugin,
   GraphQLRequestContext,
   GraphQLRequestContextDidResolveOperation,
   GraphQLRequestListener,
} from 'apollo-server-plugin-base'
import type { GraphQLResponse } from 'apollo-server-types'
import { execute } from 'graphql/execution/execute.js'
import {
   applyAuthenticationContext,
   ExpressContext,
   ProtectorContext,
} from '../auth/authentication.js'
import { protectedDirectiveTransformer } from '../tranformers/protected.transformer.js'
export class AuthenticationManagerPlugin<
   T extends ProtectorContext & ExpressContext
> implements ApolloServerPlugin<T> {
   constructor(_: IAuthPluginOptions = {}) {}

   async requestDidStart(
      _: GraphQLRequestContext<T>,
   ): Promise<void | GraphQLRequestListener<T>> {
      return {
         async responseForOperation(ctx) {
            const { request, document } = ctx
            if (
               ctx.context.authContext &&
               ctx.context.authContext.token &&
               ctx.context.authContext.token.startsWith('AUTHERROR')
            ) {
               return {
                  ...ctx.response,
                  errors: [
                     {
                        message: ctx.context.authContext.errorDetails!.message,
                        extensions: {
                           code: ctx.context.authContext.errorDetails!
                              .extensions.code,
                           exception: ctx.context.authContext.errorDetails!
                              .extensions.exception,
                        },
                     },
                  ],
                  http: {
                     status: isNaN(
                        Number(
                           ctx.context.authContext.errorDetails!.extensions
                              .code,
                        ),
                     )
                        ? 500
                        : Number(
                             ctx.context.authContext.errorDetails!.extensions
                                .code,
                          ),
                     headers: ctx.response!.http!.headers,
                  },
               }
            }
            if (
               request.operationName === 'IntrospectionQuery' ||
               request.operationName === '__ApolloGetServiceDefinition__'
            )
               return null
            let transformedSchema = protectedDirectiveTransformer({
               schema: ctx.schema,
            })
            const result = await execute({
               schema: transformedSchema,
               document,
               contextValue: ctx.context,
               variableValues: request.variables,
               operationName: request.operationName,
            })
            const response: GraphQLResponse = {
               ...ctx.response,
               ...result,
               http: {
                  status: result.errors
                     ? parseInt(String(result.errors[0].extensions.code))
                     : 200,
                  headers: ctx.response!.http!.headers,
               },
            }
            return response
         },
         async didResolveOperation(
            reqContext: GraphQLRequestContextDidResolveOperation<T>,
         ) {
            console.log(reqContext.operationName)
            if (
               reqContext.operationName === 'IntrospectionQuery' ||
               reqContext.operationName === '__ApolloGetServiceDefinition__'
            ) return;

            console.log(reqContext.request.http?.headers.get('authorization'))
            let context = await applyAuthenticationContext<T>({
               context: reqContext.context,
            })
            if (context)
               reqContext = {
                  ...reqContext,
                  context,
               }
            console.log(reqContext.request.http?.headers.get('authorization'))
         },
      }
   }
}

export interface IAuthPluginOptions {}
