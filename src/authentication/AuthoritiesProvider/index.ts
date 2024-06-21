import { Logger } from "../../logging";
import { Collection, MongoClient } from "mongodb";
import type { Authority, IAuthoritiesProvider, MongoAuthoritiesProviderProps } from "../types";


// export const authoritiesProviderFactory = ()

export class MongoAuthoritiesProvider implements IAuthoritiesProvider {

    private logger: Logger = new Logger();
    private datasourceConnection: string = 'mongodb://localhost:27017';
    private client: MongoClient;
    private databaseName: string = "test";
    private collectionName: string = "authorities";
    private collection!: Collection;

    constructor(props: MongoAuthoritiesProviderProps = {}) {
        if (props.client) {
            this.client = props.client;
        } else {
            if (process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_CONNECTION)
                this.datasourceConnection = process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_CONNECTION;
            else if (props.datasourceConnection)
                this.datasourceConnection = props.datasourceConnection;

            this.client = new MongoClient(this.datasourceConnection);
        }

        if (process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_COLLECTION)
            this.collectionName = process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_COLLECTION;
        else if (props.collectionName)
            this.collectionName = props.collectionName;

        if (process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_DATABASE)
            this.databaseName = process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_DATABASE;
        else if (props.databaseName)
            this.databaseName = props.databaseName;

        this.client.connect().then(() => {
            this.logger.info('Connected to Mongo datasource');
            this.collection = this.client.db(this.databaseName).collection(this.collectionName);
        }).catch((err) => {
            this.logger.error('Error connecting to Mongo Authentication provider: ', err);
            throw new Error('Error connecting to Mongo Authentication provider');
        });

    }

    getAuthorities(userId: String): Promise<Map<string, Authority[]>> {
        return this.collection.findOne({ userId: userId }).then((document) => {
            if (document && document.authorities) {
                return new Map<string, Authority[]>(Object.entries(document.authorities));
            }
            return new Map<string, Authority[]>();
        }).catch((err) => {
            this.logger.error('Error fetching authorities for user: ', userId, err);
            return new Map<string, Authority[]>();
        });
    }

}
