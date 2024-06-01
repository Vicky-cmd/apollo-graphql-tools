import type { ExpressContext } from "apollo-server-express"
import type {
    GraphQLRequestContextResponseForOperation,
    GraphQLResponse,
} from 'apollo-server-plugin-base'
import type { ExecutionResult } from "graphql"
import type { ProtectorContext } from "../types"
 

export const constructErrorResponseFromContext = 
    <T extends ProtectorContext & ExpressContext>(ctx: GraphQLRequestContextResponseForOperation<T>): GraphQLResponse => {
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

export const constructResponseFromContext = <T extends ProtectorContext & ExpressContext>
    (ctx: GraphQLRequestContextResponseForOperation<T>, result: ExecutionResult): GraphQLResponse => {
    return {
        ...ctx.response,
        ...result,
        http: {
           status: result.errors
              ? parseInt(String(result.errors[0].extensions.code))
              : 200,
           headers: ctx.response!.http!.headers,
        },
     }
}