"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionHandler = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class DefaultEncryptionManagerProps {
    constructor() {
        this.defaultAdditionFactor = process.env.GRAPHQL_AUTH_AFACTOR
            ? parseInt(process.env.GRAPHQL_AUTH_AFACTOR)
            : Math.floor(Math.random() * 100) + 15;
        this.defaultMultiplicationFactor = process.env.GRAPHQL_AUTH_MFACTOR
            ? parseInt(process.env.GRAPHQL_AUTH_MFACTOR)
            : Math.floor(Math.random() * 1000) + 354;
        this.defaultSecretKey = process.env.GRAPHQL_AUTH_SECRET_KEY
            ? process.env.GRAPHQL_AUTH_SECRET_KEY
            : 'TESTING_SECRET_KEY';
        this.defaultTokenizationFactors = (additionMultiplier = this.defaultAdditionFactor, multiplicationMultiplier = this.defaultMultiplicationFactor) => ({
            1: {
                additionFactor: 35 * additionMultiplier,
                multiplicationFactor: 14 + multiplicationMultiplier,
            },
            2: {
                additionFactor: 41 * additionMultiplier,
                multiplicationFactor: 11 + multiplicationMultiplier,
            },
            3: {
                additionFactor: 65 * additionMultiplier,
                multiplicationFactor: 8 + multiplicationMultiplier,
            },
            4: {
                additionFactor: 14 * additionMultiplier,
                multiplicationFactor: 12 + multiplicationMultiplier,
            },
            5: {
                additionFactor: 84 * additionMultiplier,
                multiplicationFactor: 20 + multiplicationMultiplier,
            },
            6: {
                additionFactor: 5 * additionMultiplier,
                multiplicationFactor: 132 + multiplicationMultiplier,
            },
            7: {
                additionFactor: 21 * additionMultiplier,
                multiplicationFactor: 85 + multiplicationMultiplier,
            },
            8: {
                additionFactor: 11 * additionMultiplier,
                multiplicationFactor: 75 + multiplicationMultiplier,
            },
            9: {
                additionFactor: 15 * additionMultiplier,
                multiplicationFactor: 54 + multiplicationMultiplier,
            },
            0: {
                additionFactor: 74 * additionMultiplier,
                multiplicationFactor: 54 + multiplicationMultiplier,
            },
        });
    }
}
const encryptionManagerPropsInstance = new DefaultEncryptionManagerProps();
class EncryptionHandler {
    constructor({ secretKey, additionFactor, multiplicationFactor, tokenizationFactors } = {}) {
        this.secretKey = encryptionManagerPropsInstance.defaultSecretKey;
        this.additionFactor = encryptionManagerPropsInstance.defaultAdditionFactor;
        this.multiplicationFactor = encryptionManagerPropsInstance.defaultMultiplicationFactor;
        this.encryptNumber = (value) => {
            if (isNaN(value))
                return value;
            const tokenizationKey = Math.floor(Math.random() * 10);
            const tokenizationFactor = this.tokenizationFactors[tokenizationKey];
            return parseFloat(String(value * tokenizationFactor.multiplicationFactor +
                tokenizationFactor.additionFactor) + tokenizationKey);
        };
        this.decryptNumber = (value) => {
            if (isNaN(value))
                return value;
            const tokenizationKey = parseInt(value.toString().substring(0, value.toString().length - 1));
            const actualValue = parseFloat(value.toString().substring(value.toString().length - 1));
            const tokenizationFactor = this.tokenizationFactors[tokenizationKey];
            return ((actualValue - tokenizationFactor.additionFactor) /
                tokenizationFactor.multiplicationFactor);
        };
        this.encryptString = (value) => {
            return crypto_js_1.default.AES.encrypt(value, this.secretKey).toString();
        };
        this.decryptString = (value) => {
            return crypto_js_1.default.AES.decrypt(value, this.secretKey).toString();
        };
        if (secretKey)
            this.secretKey = secretKey;
        if (additionFactor)
            this.additionFactor = additionFactor;
        if (multiplicationFactor)
            this.multiplicationFactor = multiplicationFactor;
        if (tokenizationFactors)
            this.tokenizationFactors = tokenizationFactors;
        else
            this.tokenizationFactors = encryptionManagerPropsInstance.defaultTokenizationFactors(this.additionFactor, this.multiplicationFactor);
    }
}
exports.EncryptionHandler = EncryptionHandler;
//# sourceMappingURL=index.js.map