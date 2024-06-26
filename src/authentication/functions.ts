import type { ContextFunction } from '@apollo/server';
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { AxiosError } from 'axios';
import type { Request } from 'express';
import type {
    ExpressContext,
    ProtectorContext
} from '../types';
import type {
    Context,
    IAuthProps,
    IAuthProviderProps,
    IAuthenticationProvider,
} from './types';
import { GatewayAuthenticationProvider } from '../authentication/GatewayAuthenticator';

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
    let provider: IAuthenticationProvider<T> = props.authenticationProvider ?
        props.authenticationProvider : new GatewayAuthenticationProvider<T>()
    return async (context: T) => {
        let req: Request = context.req;
        // get the user token from the headers and throw error if header token is not there
        if (!req.headers.authorization) throw new ApolloError('Unathorized', '401');

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
            console.error((e instanceof AxiosError) ? (e as AxiosError).response?.data : e);
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
    let provider: IAuthenticationProvider<T> = props.authenticationProvider ?
        props.authenticationProvider : new GatewayAuthenticationProvider<T>()
    let req: Request = context.req;
    // get the user token from the headers
    if (!req.headers.authorization) throw new ApolloError('Unathorized', '401');

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
            errorDetails: (e instanceof ApolloError) ? e : new AuthenticationError('Authentication Failed!'),
        }
    }

    return context;
}