"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAuthoritiesProvider = exports.Oauth2AuthenticatorProvider = exports.GatewayAuthenticationProvider = exports.authenticationContextProvidor = exports.applyAuthenticationContext = void 0;
var functions_1 = require("./functions");
Object.defineProperty(exports, "applyAuthenticationContext", { enumerable: true, get: function () { return functions_1.applyAuthenticationContext; } });
Object.defineProperty(exports, "authenticationContextProvidor", { enumerable: true, get: function () { return functions_1.authenticationContextProvidor; } });
var GatewayAuthenticator_1 = require("./GatewayAuthenticator");
Object.defineProperty(exports, "GatewayAuthenticationProvider", { enumerable: true, get: function () { return GatewayAuthenticator_1.GatewayAuthenticationProvider; } });
var Oauth2Authenticator_1 = require("./Oauth2Authenticator");
Object.defineProperty(exports, "Oauth2AuthenticatorProvider", { enumerable: true, get: function () { return Oauth2Authenticator_1.Oauth2AuthenticatorProvider; } });
var AuthoritiesProvider_1 = require("./AuthoritiesProvider");
Object.defineProperty(exports, "MongoAuthoritiesProvider", { enumerable: true, get: function () { return AuthoritiesProvider_1.MongoAuthoritiesProvider; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map