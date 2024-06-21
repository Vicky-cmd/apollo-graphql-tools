import type { Authority, IAuthoritiesProvider, MongoAuthoritiesProviderProps } from "../types";
export declare class MongoAuthoritiesProvider implements IAuthoritiesProvider {
    private logger;
    private datasourceConnection;
    private client;
    private databaseName;
    private collectionName;
    private collection;
    constructor(props?: MongoAuthoritiesProviderProps);
    getAuthorities(userId: String): Promise<Map<string, Authority[]>>;
}
//# sourceMappingURL=index.d.ts.map