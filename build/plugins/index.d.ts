import type { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import type { ExpressContext, ProtectorContext } from '../types';
import type { IAuthPluginOptions } from '../types';
export declare class AuthenticationManagerPlugin<T extends ProtectorContext & ExpressContext> implements ApolloServerPlugin<T> {
    constructor(_?: IAuthPluginOptions);
    requestDidStart(_: GraphQLRequestContext<T>): Promise<void | GraphQLRequestListener<T>>;
}
//# sourceMappingURL=index.d.ts.map