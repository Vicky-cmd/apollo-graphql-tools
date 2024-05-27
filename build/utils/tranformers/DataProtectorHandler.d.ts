import { PathComponent } from 'jsonpath';
export interface Dictionary<T> {
    [Key: string]: T;
}
export declare class DataProtectorHandler {
    constructor();
    protectData: (source: any, args: any, context: any, info: any, result: any) => any;
    handleforFields: (source: any, args: any, context: any, info: any, result: any) => any;
    changeValueByPath(object: object, path: string, value: any): void;
    changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string): object;
    handleListData: (source: any, args: any, context: any, info: any, result: object[]) => any[];
    handleObjectData: (source: any, args: any, context: any, info: any, result: String) => Dictionary<any>;
    private handleForDataType;
}
interface Node {
    path: PathComponent[];
    value: any;
}
export {};
//# sourceMappingURL=DataProtectorHandler.d.ts.map