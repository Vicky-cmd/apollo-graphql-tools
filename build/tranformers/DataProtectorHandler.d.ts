import type { Dictionary, IDataProtectorHandler, IEncryptionManager, Node } from '../types';
export declare class DataProtectorHandler implements IDataProtectorHandler {
    constructor(encryptor?: IEncryptionManager | undefined);
    protectData: (source: any, args: any, context: any, info: any, result: any) => any;
    getFieldSelections: (info: any) => any;
    getDirectiveField: (info: any, resource: any) => any;
    fetchParentType: (info: any, resource?: string | undefined) => any;
    handleforFields: (source: any, args: any, context: any, info: any, result: any) => any;
    changeValueByPath(object: object, path: string, value: any): void;
    changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string): object;
    handleListData: (source: any, args: any, context: any, info: any, result: object[]) => any[];
    handleObjectData: (source: any, args: any, context: any, info: any, result: String) => Dictionary<any> | null;
    handleForDataType(source: any, args: any, context: any, info: any, data: any): any;
}
//# sourceMappingURL=DataProtectorHandler.d.ts.map