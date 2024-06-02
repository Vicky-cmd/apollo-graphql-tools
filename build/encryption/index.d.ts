import type { EncryptionManagerProps, IEncryptionManager as IEncryptionHandler } from '../types';
export declare class EncryptionHandler implements IEncryptionHandler {
    private secretKey;
    private additionFactor;
    private multiplicationFactor;
    private tokenizationFactors;
    constructor({ secretKey, additionFactor, multiplicationFactor, tokenizationFactors }?: EncryptionManagerProps);
    encryptNumber: (value: number) => number;
    decryptNumber: (value: number) => number;
    encryptString: (value: string) => string;
    decryptString: (value: string) => string;
}
//# sourceMappingURL=index.d.ts.map