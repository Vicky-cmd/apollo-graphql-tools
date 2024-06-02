import type {
   ApolloServerPlugin,
   GraphQLRequestContext,
   GraphQLRequestContextDidResolveOperation,
   GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { execute } from 'graphql/execution/execute.js';
import {
   applyAuthenticationContext,
} from '../authentication';
import { logger } from '../logging';
import { protectedDirectiveTransformer } from '../tranformers/protected.transformer.js';
import type {
   ExpressContext,
   ProtectorContext,
} from '../types';
import { constructErrorResponseFromContext, constructResponseFromContext } from '../utils';
import type { IAuthPluginOptions } from '../types';


const restrictedOperations = ['IntrospectionQuery', '__ApolloGetServiceDefinition__']

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
            if (ctx.context.authContext?.token?.startsWith('AUTHERROR')) {
               return constructErrorResponseFromContext(ctx);
            }
            if (request.operationName && restrictedOperations.includes(request.operationName)) return null
            
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

            return constructResponseFromContext(ctx, result)
         },

         async didResolveOperation(
            reqContext: GraphQLRequestContextDidResolveOperation<T>,
         ) {
            logger.debug("Operation Name: ", reqContext.operationName)
            if (reqContext.operationName && restrictedOperations.includes(reqContext.operationName)) return;

            let context = await applyAuthenticationContext<T>({
               context: reqContext.context,
            })
            if (context)
               reqContext = {
                  ...reqContext,
                  context,
               }
         },
      }
   }
}
