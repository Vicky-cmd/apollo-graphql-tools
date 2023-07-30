import type { ContextFunction } from '@apollo/server'
import { ApolloError, AuthenticationError } from 'apollo-server-express'
import { AxiosError, AxiosResponse } from 'axios'
import type { Request, Response } from 'express'
import type { Dictionary } from 'lodash'
import axios from '../../services/axios.js'
import { Logger } from '../logging'

export interface ExpressContext {
   req: Request
   res: Response
}

type Context<T = object> = T

export interface Authority {
   authority: String
   resources: string[]
}

export interface ProtectorContext {
   authContext?: AuthenticationContext
}
export interface AuthenticationContext {
   status?: String
   methodType?: 'GET' | 'POST' | 'PUT'
   username?: String
   token: String
   authorities?: Map<string, Authority[]>
   authenticated?: boolean
   errorDetails?: ApolloError
}

// interface ErrorContext {
//    status: boolean
//    code: string
//    message: string
//    error: string[]
// }

export class AuthenticationProvider<T extends ProtectorContext> {
   private authServiceURI: string = process.env.authServiceURI
      ? process.env.authServiceURI
      : 'http://localhost:8555/api/v1/validateToken'

   private logger: Logger = new Logger()
   constructor(props: Dictionary<Object>) {
      if (props.authServiceURI)
         this.authServiceURI = props.authServiceURI.toString()
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
         if (response.status !== 200) {
            console.error('Failed to Authenticate User!')
         }

         let context: ProtectorContext = {
            authContext: response.data,
         }

         return context
      } catch (e) {
         if (e instanceof AxiosError && e.response) {
            if (e.response.status === 401) {
               throw new ApolloError('UNAUTHENTICATED', '401')
            } else if (e.status === 403) {
               throw new ApolloError('FORBIDDEN', '403')
            }
         }
         throw new ApolloError('AUTHENTICATION_FAILURE', '401')

         this.logger.error('Error Occured while calling Authentication Server')
      }

      throw new ApolloError('', '')
   }
}

export interface IAuthenticationProviderProps<T extends ProtectorContext> {
   authorization: String
   req: Request
   res?: Response
   appContext?: T
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
      let req: Request = context.req
      // get the user token from the headers
      if (!req.headers.authorization) {
         throw new ApolloError('Unathorized', '401')
      }
      const token = req.headers.authorization || ''

      try {
         let protectorContext = await provider.authenticate({
            authorization: token,
            req,
         })

         context = await getContext(props.context, context)
         context.authContext = protectorContext.authContext

         return context
      } catch (e) {
         if (e instanceof AxiosError) {
            let err: AxiosError<any> = e
            console.error(err.response?.data)
         } else {
            console.error(e)
         }
         throw new AuthenticationError('Authentication Failed!')
      }
   }
}

export const applyAuthenticationContext = async <
   T extends ExpressContext & ProtectorContext
>(
   props: IAuthProps<T>,
) => {
   let { context } = props
   let provider: AuthenticationProvider<T> = new AuthenticationProvider<T>({})
   let req: Request = context.req
   // get the user token from the headers
   if (!req.headers.authorization) {
      throw new ApolloError('Unathorized', '401')
   }
   const token = req.headers.authorization || ''

   context = await getContext(props.context, context)
   try {
      let protectorContext = await provider.authenticate({
         authorization: token,
         req,
      })

      context.authContext = protectorContext.authContext

      return context
   } catch (e) {
      if (e instanceof ApolloError) {
         // console.error(err.response?.data)
         context.authContext = {
            token: 'AUTHERROR',
            errorDetails: e,
         }
         // throw new AuthenticationError('Authentication Failed!')
      } else {
         // console.error(e)
         // throw new AuthenticationError('Authentication Failed!')
         context.authContext = {
            token: 'AUTHERROR',
            errorDetails: new AuthenticationError('Authentication Failed!'),
         }
      }

      return context
   }
}

export interface IAuthProps<T extends ExpressContext & ProtectorContext> {
   context: T
}

export interface IAuthProviderProps<
   T extends ExpressContext & ProtectorContext
> {
   context: Context | ContextFunction<any, T>
}
