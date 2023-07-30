import type { GraphQLSchema } from 'graphql/type';
import { DataProtectorHandler } from './DataProtectorHandler.js';
declare const protectedDirectiveTransformer: ({ schema, handler, }: TProtectedTransformerProps) => GraphQLSchema;
interface TProtectedTransformerProps {
    schema: GraphQLSchema;
    handler?: DataProtectorHandler;
}
export { protectedDirectiveTransformer };
//# sourceMappingURL=protected.transformer.d.ts.map