import type { Dictionary, Node } from '../types';
import type { IDataProtectorHandler } from '../types';
export declare class DataProtectorHandler implements IDataProtectorHandler {
    constructor();
    protectData: (source: any, args: any, context: any, info: any, result: any) => any;
    handleforFields: (source: any, args: any, context: any, info: any, result: any) => any;
    changeValueByPath(object: object, path: string, value: any): void;
    changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string): object;
    handleListData: (source: any, args: any, context: any, info: any, result: object[]) => any[];
    handleObjectData: (source: any, args: any, context: any, info: any, result: String) => Dictionary<any>;
    handleForDataType(source: any, args: any, context: any, info: any, data: any): any;
}
//# sourceMappingURL=DataProtectorHandler.d.ts.map