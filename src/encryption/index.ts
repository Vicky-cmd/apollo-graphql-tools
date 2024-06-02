import type { TokenizationFactor } from '../types'
import CryptoJS from 'crypto-js'

const defaultAdditionFactor = process.env.GRAPHQL_AUTH_AFACTOR
   ? parseInt(process.env.GRAPHQL_AUTH_AFACTOR)
   : Math.floor(Math.random() * 100) + 15
const defaultMultiplicationFactor = process.env.GRAPHQL_AUTH_MFACTOR
   ? parseInt(process.env.GRAPHQL_AUTH_MFACTOR)
   : Math.floor(Math.random() * 1000) + 354
const secretKey: string = process.env.GRAPHQL_AUTH_SECRET_KEY
   ? process.env.GRAPHQL_AUTH_SECRET_KEY
   : 'TESTING_SECRET_KEY'

const tokenizationFactors: Record<number, TokenizationFactor> = {
   1: {
      additionFactor: 35 * defaultAdditionFactor,
      multiplicationFactor: 14 + defaultMultiplicationFactor,
   },
   2: {
      additionFactor: 41 * defaultAdditionFactor,
      multiplicationFactor: 11 + defaultMultiplicationFactor,
   },
   3: {
      additionFactor: 65 * defaultAdditionFactor,
      multiplicationFactor: 8 + defaultMultiplicationFactor,
   },
   4: {
      additionFactor: 14 * defaultAdditionFactor,
      multiplicationFactor: 12 + defaultMultiplicationFactor,
   },
   5: {
      additionFactor: 84 * defaultAdditionFactor,
      multiplicationFactor: 20 + defaultMultiplicationFactor,
   },
   6: {
      additionFactor: 5 * defaultAdditionFactor,
      multiplicationFactor: 132 + defaultMultiplicationFactor,
   },
   7: {
      additionFactor: 21 * defaultAdditionFactor,
      multiplicationFactor: 85 + defaultMultiplicationFactor,
   },
   8: {
      additionFactor: 11 * defaultAdditionFactor,
      multiplicationFactor: 75 + defaultMultiplicationFactor,
   },
   9: {
      additionFactor: 15 * defaultAdditionFactor,
      multiplicationFactor: 54 + defaultMultiplicationFactor,
   },
   0: {
      additionFactor: 74 * defaultAdditionFactor,
      multiplicationFactor: 54 + defaultMultiplicationFactor,
   },
}

const encryptNumber = (value: number): number => {
   if (isNaN(value)) return value

   const tokenizationKey = Math.random() * 10
   const tokenizationFactor = tokenizationFactors[tokenizationKey]
   return parseFloat(
      String(
         value * tokenizationFactor.multiplicationFactor +
            tokenizationFactor.additionFactor,
      ) + tokenizationKey,
   )
}

const decryptNumber = (value: number): number => {
   if (isNaN(value)) return value

   const tokenizationKey = parseInt(
      value.toString().substring(0, value.toString().length - 1),
   )
   const actualValue = parseFloat(
      value.toString().substring(value.toString().length - 1),
   )
   const tokenizationFactor = tokenizationFactors[tokenizationKey]
   return (
      (actualValue - tokenizationFactor.additionFactor) /
      tokenizationFactor.multiplicationFactor
   )
}

const encryptString = (value: string): string => {
   return CryptoJS.AES.encrypt(value, secretKey).toString()
}

const decryptString = (value: string): string => {
   return CryptoJS.AES.decrypt(value, secretKey).toString()
}

export { encryptNumber, decryptNumber, encryptString, decryptString }