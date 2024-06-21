import type { EncryptionManagerProps, IEncryptionManager as IEncryptionHandler, TokenizationFactor } from '../types'
import CryptoJS from 'crypto-js'


class DefaultEncryptionManagerProps {
   public defaultAdditionFactor = process.env.GRAPHQL_TOOLS_AUTH_AFACTOR
      ? parseInt(process.env.GRAPHQL_TOOLS_AUTH_AFACTOR)
      : Math.floor(Math.random() * 100) + 15
   public defaultMultiplicationFactor = process.env.GRAPHQL_TOOLS_AUTH_MFACTOR
      ? parseInt(process.env.GRAPHQL_TOOLS_AUTH_MFACTOR)
      : Math.floor(Math.random() * 1000) + 354
   public defaultSecretKey: string = process.env.GRAPHQL_TOOLS_AUTH_SECRET_KEY
      ? process.env.GRAPHQL_TOOLS_AUTH_SECRET_KEY
      : 'TESTING_SECRET_KEY'

   defaultTokenizationFactors = (additionMultiplier: number = this.defaultAdditionFactor,
      multiplicationMultiplier: number = this.defaultMultiplicationFactor): Record<number, TokenizationFactor> => ({
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
      })
}

const encryptionManagerPropsInstance = new DefaultEncryptionManagerProps();

export class EncryptionHandler implements IEncryptionHandler {
   private secretKey: string = encryptionManagerPropsInstance.defaultSecretKey
   private additionFactor: number = encryptionManagerPropsInstance.defaultAdditionFactor
   private multiplicationFactor: number = encryptionManagerPropsInstance.defaultMultiplicationFactor
   private tokenizationFactors: Record<number, TokenizationFactor>;

   constructor({ secretKey, additionFactor, multiplicationFactor, tokenizationFactors }: EncryptionManagerProps = {}) {
      if (secretKey) this.secretKey = secretKey;
      if (additionFactor) this.additionFactor = additionFactor
      if (multiplicationFactor) this.multiplicationFactor = multiplicationFactor
      if (tokenizationFactors) this.tokenizationFactors = tokenizationFactors
      else this.tokenizationFactors = encryptionManagerPropsInstance.defaultTokenizationFactors(this.additionFactor, this.multiplicationFactor)
   }

   encryptNumber = (value: number): number => {
      if (isNaN(value)) return value

      const tokenizationKey = Math.floor(Math.random() * 10)
      const tokenizationFactor = this.tokenizationFactors[tokenizationKey]
      return parseFloat(
         String(
            value * tokenizationFactor.multiplicationFactor +
            tokenizationFactor.additionFactor,
         ) + tokenizationKey,
      )
   }

   decryptNumber = (value: number): number => {
      if (isNaN(value)) return value

      const tokenizationKey = parseInt(
         value.toString().substring(value.toString().length - 1),
      )
      const actualValue = parseFloat(
         value.toString().substring(0, value.toString().length - 1),
      )
      const tokenizationFactor = this.tokenizationFactors[tokenizationKey]
      return (
         (actualValue - tokenizationFactor.additionFactor) /
         tokenizationFactor.multiplicationFactor
      )
   }

   encryptString = (value: string): string => {
      return CryptoJS.AES.encrypt(value, this.secretKey).toString();
   }

   decryptString = (value: string): string => {
      return CryptoJS.AES.decrypt(value, this.secretKey).toString(CryptoJS.enc.Utf8);
   }
}