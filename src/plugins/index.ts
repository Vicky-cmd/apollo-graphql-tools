import type {
   ApolloServerPlugin,
   GraphQLRequestContext,
   GraphQLRequestContextDidResolveOperation,
   GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { execute } from 'graphql/execution/execute.js';
import {
   GatewayAuthenticationProvider,
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
import { DataProtectorHandler } from '../tranformers/DataProtectorHandler';
import { EncryptionHandler } from '../encryption';


const restrictedOperations = ['IntrospectionQuery', '__ApolloGetServiceDefinition__']

type G = any;

let config: IAuthPluginOptions<G extends ProtectorContext ? G : ProtectorContext> = {
   handler: new DataProtectorHandler(),
};

export class AuthenticationManagerPlugin<
   T extends ProtectorContext & ExpressContext
> implements ApolloServerPlugin<T> {

   constructor(pluginConfig: IAuthPluginOptions<T> = {
      enabled: true,
      enableSchemaTransform: true,
   }) {
      config = pluginConfig;
      this.initializeConfig();
   }

   initializeConfig = () => {
      if (config.enabled === false) {
         logger.debug('AuthenticationManagerPlugin disabled');
      } else {
         config.enabled = true;
         if (!config.authenticationProvider) {
            config.authenticationProvider = new GatewayAuthenticationProvider();
         }
         if (config.enableSchemaTransform === false) {
            logger.debug('Schema Transform Disabled');
         } else {
            config.enableSchemaTransform = true;
            if (!config.handler) {
               if (config.encryptionHandler) config.handler = new DataProtectorHandler(config.encryptionHandler);
               else if (config.encryptionProps) config.handler = new DataProtectorHandler(new EncryptionHandler(config.encryptionProps));
               else config.handler = new DataProtectorHandler();
            } else {
               logger.debug('Data Protector Handler Initialized');
               if (config.encryptionHandler)
                  logger.error("Invalid configuration for DataProtectorHandler... Skipping encryption handler configuration");
            }
         }
      }
   }

   async requestDidStart(
      _: GraphQLRequestContext<T>,
   ): Promise<void | GraphQLRequestListener<T>> {
      return {
         async responseForOperation(ctx) {
            const { request, document } = ctx;
            if (ctx.context.authContext?.token?.startsWith('AUTHERROR')) {
               return constructErrorResponseFromContext(ctx);
            }
            if (request.operationName && restrictedOperations.includes(request.operationName)) return null;

            let transformedSchema = config?.enabled && config?.enableSchemaTransform ? protectedDirectiveTransformer({
               schema: ctx.schema,
               handler: config.handler!,
            }) : ctx.schema;
            const result = await execute({
               schema: transformedSchema,
               document,
               contextValue: ctx.context,
               variableValues: request.variables,
               operationName: request.operationName,
            });

            return constructResponseFromContext(ctx, result);
         },

         async didResolveOperation(
            reqContext: GraphQLRequestContextDidResolveOperation<T>,
         ) {
            logger.debug("Operation Name: ", reqContext.operationName);
            if ((reqContext.operationName && restrictedOperations.includes(reqContext.operationName)) || !config?.enabled) return;

            let context = await applyAuthenticationContext<T>({
               context: reqContext.context,
               authenticationProvider: config.authenticationProvider,
            });
            if (context)
               reqContext = {
                  ...reqContext,
                  context,
               }
         },
      }
   }
}
