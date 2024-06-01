import type { ExpressContext } from "apollo-server-express";
import type { GraphQLRequestContextResponseForOperation, GraphQLResponse } from 'apollo-server-plugin-base';
import type { ExecutionResult } from "graphql";
import type { ProtectorContext } from "../types";
export declare const constructErrorResponseFromContext: <T extends ProtectorContext & ExpressContext>(ctx: GraphQLRequestContextResponseForOperation<T>) => GraphQLResponse;
export declare const constructResponseFromContext: <T extends ProtectorContext & ExpressContext>(ctx: GraphQLRequestContextResponseForOperation<T>, result: ExecutionResult) => GraphQLResponse;
//# sourceMappingURL=index.d.ts.map