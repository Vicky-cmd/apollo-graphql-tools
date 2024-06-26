<div align="center">
    <p>
        <a href="https://www.apollographql.com/"><img src="https://raw.githubusercontent.com/apollographql/apollo-client-devtools/main/assets/apollo-wordmark.svg" height="100" alt="Apollo Client"></a>
    </p>
    <h1>Apollo GraphQL Tools</h1>
</div>

[![License][license-image]][license-url]
[![version][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

<hr/>

The Apollo GraphQL Tools provides a centralized solution to authentication and fine-grained access control to GraphQL resources. 
This is built on top of the Plugin Based framework provided by Apollo GraphQL Servers and can be used for managing authentication with support for Apollo Federation also.

## Features
* Centralized authentication using authentication server.
* Support for Oauth 2.0/Okta integration.
* Fine Grained access control to the GraphQL resources as well as the individual fields of the resources.
* Additional flavours for fine-grained access control with Encryption and redaction of sensitive fields.

![Authentication Flow][AUTH-FLOW]
<div align="center"><i>Sample Flow of GraphQL Authentication using the plugin</i></div>
<hr/>

## Installation
The latest version of the project are published in the npm registry and can be installed using the npm package manager.
```shell
> npm i @infotrends/apollo-graphql-tools
```

<hr/>

## Components

### AuthenticationManagerPlugin
This is the main component of the authentication mechanism and will contain all the logic for initializing and maintaining the various functionalities as needed.

#### Authentication Plugin Configuration

The AuthenticationManagerPlugin takes the below parameters as input:

| Parameter                | type                      | Default                        | Description                                                                                                                                                                                                                                                                                                 |
|--------------------------|---------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled                  | boolean                   | true                           | Controls if the authentication manager is enabled or not                                                                                                                                                                                                                                                    |
| enableSchemaTransform    | boolean                   | true                           | Controls if the schema transformation/Secured Directives scanning is enabled. <br/>If set to false, the plugin does not scan for the @Secured directive usage in the graphQL schema. <br/>**Default**: *secure* for the standard/default implementation of IDataProtectorHandler provided in the package.   |
| handler                  | IDataProtectorHandler     | DataProtectorHandler           | The implementation of the IDataProtectorHandler to be used for securing the data based on the configurations and flavours selected. This implementation contains the logic for securing the data for the different data types.                                                                              |
| encryptionHandler        | IEncryptionManager        | EncryptionHandler              | The implementation of the IEncryptionManager to be used for encryption of the data under the *encrypt* configuration.                                                                                                                                                                                       |
| encryptionProps          | EncryptionManagerProps    | N/A                            | This contains the various configurations to be utilized by the encryption manager.<br/>                                                                                                                                                                                                                     |
| authenticationProvider   | IAuthenticationProvider   | GatewayAuthenticationProvider  | The implementation of the IAuthenticationProvider for authenticating the user request and fetching the authorities/access rights of the user to the resources.                                                                                                                                              |

### IEncryptionManager
This is the standard definition of the encryption manager component that will be used by the *DataProtectorHandler* for encrypting the data having the policy/security type marked for encryption. The user can override the default implementation for this encryption manager to customize the encryption logic being used.

**Default Implementation**: EncryptionHandler

#### EncryptionHandler
This implementation takes care of encryption and decryption of the data. However, it uses tokenization and de-tokenization for numerical values inorder to conserve the type of the values instead of encrypting them.

**Configuration**

* *secretKey* - Secret key to be used during the encryption process using the AES Cipher. By default, it will look for the **GRAPHQL_TOOLS_AUTH_SECRET_KEY** environment key configuration if no value is passed.
* *additionFactor* - Numerical value to be used during tokenization and de-tokenization of numbers. This will be used as an additive value to induce randomness in the values being generated. By default, it will look for the **GRAPHQL_TOOLS_AUTH_AFACTOR** environment key configuration or generate a random number if no value is passed as input to the class.
* *multiplicationFactor* - Numerical value to be used during tokenization and de-tokenization of numbers. This will be used as a multiplier value to induce randomness in the values being generated. By default, it will look for the **GRAPHQL_TOOLS_AUTH_MFACTOR** environment key configuration or generate a random number if no value is passed as input to the class.
* tokenizationFactors: A map of the tokenization factor to be used during tokenization of the numbers. This map will contain 10 entries with key values between 0-9 with the values containing a Dictionary with value for additionFactor and multiplicationFactor. The default value will be utilizing the two multiplier configurations mentioned above to induce randomness, 

**Note**: Refer to the [EncryptionHandler] class for further details on the implementation.

### IDataProtectorHandler

**Default Implementation**: DataProtectorHandler

#### DataProtectorHandler
This implementation contains the logic for validating and securing the data based on the classifications. The default implementation provided can support three types of security configurations. This is used for fine-grained access control to manage the access to the resources in the GraphQL Queries.

**Supported Types**
* **secure** - For securing the data for users without access.
* **redact** - For redacting the sensitive data for users without access. The text values are redacted such that only the first character is visible and rest of the characters are replaced with **'*'** while in case of numeric values, they are replaced with 0 to preserve the type.
* **encrypt** - For encrypting the data for users without access. The encryption manager provided is utilized to encrypt the data.
    
**Default Type** - *secure*

**Configuration** 

* *encryptor* - The instance of the IEncryptionManager to be used. This will be utilized in the encryption of the data which are classified under *encrypt* type configuration.

### IAuthoritiesProvider
This contains the method definitions for a standard Authorities Provider utilized by the application to fetch the authorities of the user from a backend system. 

#### MongoAuthoritiesProvider
This implementation of the *IAuthoritiesProvider* is used to fetch the authorities for the user from a backend mongo database. The authority details are stored as a Collection with each document containing the authority details for the user. 

**Configuration**

* *client* - An implementation of the mongo client to be utilized for fetching the authority details for a user. This value is given the primary preference for the client object.
* *datasourceConnection* - The database connection URI for the mongo db database with the collection having the authorities details. By default, it will look for the **GRAPHQL_TOOLS_MONGO_AUTH_PROVIDER_CONNECTION** environment key configuration if no value is passed as an input. This is ignored if mongodb client object is passed.
    * **Default**: mongodb://localhost:27017
* *databaseName* - The name of the database storing the authorities details.
    * **Default**: test
* *collectionName* - The collection containing the authorities details for the users.
    * **Default**: authorities

### IAuthenticationProvider

**Default Implementation**: GatewayAuthenticationProvider

**Common Configurations**

* *enableAuthoritiesProvider* - Controls the setup and use of the Authorities Provider that is used to fetch the authorities of the user. If this is configured as false, the application skips fetching the authorities details for the user.
    * **Default**: false
* *mongoConfig* - These are the configurations needed for initializing an instance of the MongoAuthoritiesProvider with custom configurations.
* *authoritiesProvider* - A customized instance of the Authorities Provider.
    * **Default**: MongoAuthoritiesProvider (with the default database configurations if no *mongoConfig* is provided.)

#### GatewayAuthenticationProvider
This implementation is used for validating the user token against an external Authentication API that will return the token, username and optionally the authorities that are granted to the current user. This will also support integration with the Authorities Provider that can be used to fetch the authorities for the user from a backend system.

**Configuration**

* *validateTokenEndpoint* - The endpoint of the Authentication Service/API that can be used to validate the user access token in the header. By default, it will look for the **GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT** environment key configuration if no value is provided to the Provider.
    * **Default**: http://localhost:8555/api/v1/validateToken
* *filterField* - The parameter to be used from the response of Validate Token API for fetching the authorities details for the user.
    * **Default**: userID

#### Oauth2AuthenticatorProvider
This implementation is used for OAuth 2.0 integration oauth2.0 providers. This can be configured to use the User Info Endpoint directly or fetch the endpoint dynamically by providing the issuer and domain parameters as inputs.

**Configuration**

* *userinfo_endpoint* - The endpoint of the Authentication Service/API that can be used to validate the user access token in the header. By default, it will look for the **GRAPHQL_TOOLS_VALIDATE_TOKEN_ENDPOINT** environment key configuration if no value is provided to the Provider. **NOTE**: The environment key configuration is given the least priority and is only used if there is no issuer and domain configuration also.
    * **Default**: false
* *issuer*, *domain* - This is used to fetch the User Info Endpoint from the OAuth 2.0 provider using the *openid-configuration* endpoint (*https://${props.domain}/oauth2/${props.issuer}/.well-known/openid-configuration*). This value is used if no user_info endpoint is provided in input.
    * **Default**: userID

<hr/>

## Usage

The authentication functionality is provided by the AuthenticationManagerPlugin defined in the apollo-graphql-tools and can be intialized by simply defining an instance of it under the plugins section while configuring the Apollo Server.

```typescript
import { AuthenticationManagerPlugin, GatewayAuthenticationProvider, MongoAuthoritiesProvider, ProtectorContext } from '@infotrends/apollo-graphql-tools';
// ...
// ...
interface ApplicationContext extends ExpressContext, ProtectorContext {};
// ...
// ...
const app = express();
let schema = buildSubgraphSchema({ typeDefs: typeDefs, resolvers: resolvers });
const server = new ApolloServer<ApplicationContext>({
    schema,
    context: (context: ApplicationContext) => {
        //...
        //...
        return context
    },
    validationRules: [depthLimit(5)],
    formatError: (err: GraphQLError) => {
        if (err.extensions.exception && err.extensions.exception.stacktrace)
            err.extensions.exception.stacktrace = undefined
        return err
    },
    introspection: true,
    plugins: [
        /**
         * This is the plugin that is added for implementing the Authorization logic by calling
         * the Authorization Server as well as implement Fine Grained Access Control
         */
        new AuthenticationManagerPlugin({
            authenticationProvider: new GatewayAuthenticationProvider({
                // Specifies whether the authorities provider must be enabled or not. 
                enableAuthoritiesProvider: true,
                authoritiesProvider: new MongoAuthoritiesProvider({
                    /**
                     *  The database connection string to be used by authorities provider for fetching the Authorities for the user.
                     *  databaseName: The database having the collection with the authorities of the user.
                     *  collectionName: The collection having the autorities details for the users.
                     */
                    datasourceConnection: "mongodb://localhost:27017/Infotrends",
                    databaseName: "Infotrends",
                    collectionName: "userAccess"
                })
            }),
        }),
    ],
})
// ...
await server.start()
// ...
```

### Fine Grained Access Control using Custom Directives

The below declaration for **@Secured** directive must be added to the GraphQL schema so that they can be utilized within the GraphQL schema for the application.

```graphql
enum ProtectionType {
   secure,
   encrypt,
   redact
}

directive @Secured(
   resource: String
   type: ProtectionType
   fields: [String]
) on  FIELD_DEFINITION | OBJECT | INTERFACE | UNION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
```

Now, the schema directive can be utilized within the GraphQL schema of the application to identify fields that need to be protected/secured.

```graphql
type User @key(fields: "userId") {
   userId: String
   firstName: String 
   lastName: String
   maidenName: String
   age: Int
}
#...
type UserConnection implements Connection {
   paginationDetails: PaginationDetails
   users: [User] @Secured(type: secure, resource: "user")
}
#...
type Query {
   allUsers(pageDetails: PaginationInput): UserConnection
   user(id: String, username: String, email: String): User  @Secured(type: secure)
   users(filter: UserFilter, pageDetails: PaginationInput): UserConnection
}
```

### Directive Configuration
| Parameter | type           | Default   | Description                                                                                                                                                                                                                                                                                                                                                                 |
|-----------|----------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource  | string         | N/A       | The name of the type of the resource that is being secured. This is used while fetching the access access details for the data being returned to the user (Secured).                                                                                                                                                                                                        |
| type      | ProtectionType | secured   | The type of security to be provided to the resource.<br/> **Values:**<br/>*secure* - For securing the resource. Returns null if the user does not have permission to the resource.<br/>*encrypt* - For encrypting the resource if the user does not have permission to view it.<br/>*redact* - For redacting the resource if the user does not have permission to view it.  |
| fields    | \[string\]     | N/A       | Theis parameter can be used for  fine grained access control for managing access to specific fields of a resource.                                                                                                                                                                                                                                                          | 


### High Level Authentication Flow
![High Level Authentication Flow][HIGH-LEVEL-AUTH-FLOW]

### Flow for access errors
![401 Authentication Flow][401-AUTH-FLOW]

[license-url]: LICENSE
[license-image]: https://img.shields.io/badge/License-GPLv3-green.svg?style=for-the-badge&logo=appveyor

[npm-url]: https://www.npmjs.com/package/@infotrends/apollo-graphql-tools
[npm-image]: https://img.shields.io/npm/v/@infotrends/apollo-graphql-tools.svg?style=for-the-badge&logo=npm

[npm/init]: https://docs.npmjs.com/cli/init#description

[downloads-url]: https://www.npmjs.com/package/@infotrends/apollo-graphql-tools
[downloads-image]: https://img.shields.io/npm/dt/@infotrends/apollo-graphql-tools.svg?style=for-the-badge

[EncryptionHandler]: ./src/encryption/index.ts#L63

[HIGH-LEVEL-FLOW]: ./assets/high-level-flow.png

[AUTH-FLOW]: ./assets/flow-diagram.png
[401-AUTH-FLOW]: ./assets/401-flow-diagram.png
[HIGH-LEVEL-AUTH-FLOW]: ./assets/high-level-flow.png