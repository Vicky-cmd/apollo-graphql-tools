"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAuthoritiesProvider = void 0;
const logging_1 = require("../../logging");
const mongodb_1 = require("mongodb");
class MongoAuthoritiesProvider {
    constructor(props = {}) {
        this.logger = new logging_1.Logger();
        this.datasourceConnection = 'mongodb://localhost:27017';
        this.databaseName = "test";
        this.collectionName = "authorities";
        if (props.client) {
            this.client = props.client;
        }
        else {
            if (process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_CONNECTION)
                this.datasourceConnection = process.env.GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_CONNECTION;
            else if (props.datasourceConnection)
                this.datasourceConnection = props.datasourceConnection;
            this.client = new mongodb_1.MongoClient(this.datasourceConnection);
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
    getAuthorities(userId) {
        return this.collection.findOne({ userId: userId }).then((document) => {
            if (document && document.authorities) {
                return new Map(Object.entries(document.authorities));
            }
            return new Map();
        }).catch((err) => {
            this.logger.error('Error fetching authorities for user: ', userId, err);
            return new Map();
        });
    }
}
exports.MongoAuthoritiesProvider = MongoAuthoritiesProvider;
//# sourceMappingURL=index.js.map