import type { ContextFunction } from '@apollo/server';
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { AxiosError, AxiosResponse } from 'axios';
import type { Request } from 'express';
import type { Dictionary } from 'lodash';
import { Logger } from '../logging/index.js';
import axios from '../services/axios.js';
import {
   AuthenticationContext,
   Context,
   ExpressContext,
   HTTPStatus,
   IAuthProps,
   IAuthProviderProps,
   IAuthenticationProviderProps,
   ProtectorContext
} from '../types/index.js';


export class AuthenticationProvider<T extends ProtectorContext> {
   private authServiceURI: string = process.env.authServiceURI
      ? process.env.authServiceURI
      : 'http://localhost:8555/api/v1/validateToken';

   private logger: Logger = new Logger();
   constructor(props: Dictionary<Object>) {
      this.logger.debug('Initializing AuthenticationProvider: ', props);
      if (props.authServiceURI)
         this.authServiceURI = props.authServiceURI.toString();
   }

   async authenticate(
      tokenDetails: IAuthenticationProviderProps<T>,
   ): Promise<ProtectorContext> {
      try {
         let response: AxiosResponse<AuthenticationContext> = await axios.get(
            this.authServiceURI,
            {
               headers: {
                  Authorization: tokenDetails.authorization.toString(),
               },
            },
         )

         return {
            authContext: response.data,
         }
      } catch (e) {
         if (e instanceof AxiosError && e.response) {
            throw new ApolloError(String(e.status?e.status:500), HTTPStatus[e.status?e.status:500]);
         }
      }
      throw new ApolloError('AUTHENTICATION_FAILURE', '500');
   }
}

const getContext = async <T extends ExpressContext & ProtectorContext>(
   context: Context | ContextFunction<any, T>,
   rootContext: T,
): Promise<T> => {
   if (context) {
      if (typeof context === 'function')
         return await (context as ContextFunction<any, T>)(rootContext)
      else return context as T
   }
   return rootContext
}

export const authenticationContextProvidor = <
   T extends ExpressContext & ProtectorContext
>(
   props: IAuthProviderProps<T>,
) => {
   let provider: AuthenticationProvider<T> = new AuthenticationProvider<T>({})
   return async (context: T) => {
      let req: Request = context.req;
      // get the user token from the headers and throw error if header token is not there
      if (!req.headers.authorization) {
         throw new ApolloError('Unathorized', '401');
      }
      const token = req.headers.authorization || '';

      try {
         let protectorContext = await provider.authenticate({
            authorization: token,
            req,
         });

         context = await getContext(props.context, context);
         context.authContext = protectorContext.authContext;

         return context;
      } catch (e) {
         if (e instanceof AxiosError) {
            let err: AxiosError<any> = e;
            console.error(err.response?.data);
         } else {
            console.error(e);
         }
         throw new AuthenticationError('Authentication Failed!');
      }
   }
}

export const applyAuthenticationContext = async <
   T extends ExpressContext & ProtectorContext
>(
   props: IAuthProps<T>,
) => {
   let { context } = props
   let provider: AuthenticationProvider<T> = new AuthenticationProvider<T>({});
   let req: Request = context.req;
   // get the user token from the headers
   if (!req.headers.authorization) {
      throw new ApolloError('Unathorized', '401')
   }
   const token = req.headers.authorization || '';

   context = await getContext(props.context, context);
   try {
      let protectorContext = await provider.authenticate({
         authorization: token,
         req,
      });

      context.authContext = protectorContext.authContext;
   } catch (e) {

      context.authContext = {
         token: 'AUTHERROR',
         errorDetails: (e instanceof ApolloError)? e: new AuthenticationError('Authentication Failed!'),
      }
   }

   return context;
}