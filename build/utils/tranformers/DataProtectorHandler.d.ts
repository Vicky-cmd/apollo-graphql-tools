import { PathComponent } from 'jsonpath';
export interface Dictionary<T> {
    [Key: string]: T;
}
export declare class DataProtectorHandler {
    constructor();
    protectData: (source: any, args: any, context: any, info: any, result: any) => any;
    handleforFields: (source: any, args: any, context: any, info: any, result: any) => any;
    chnageValueByPath(object: object, path: string, value: any): void;
    changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string): object;
    handleStringData: (_: any, args: any, __: any, ___: any, result: string) => string;
    handleNumberData: (_: any, args: any, __: any, ___: any, result: String) => number;
    handleListData: (source: any, args: any, context: any, info: any, result: object[]) => object[];
    handleObjectData: (source: any, args: any, context: any, info: any, result: String) => Dictionary<Object>;
    private handleForDataType;
}
interface Node {
    path: PathComponent[];
    value: any;
}
export {};
//# sourceMappingURL=DataProtectorHandler.d.ts.map