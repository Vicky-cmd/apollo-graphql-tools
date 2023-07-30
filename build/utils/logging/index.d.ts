export declare class Logger {
    loggingLevels: string[];
    getLoggingLevel: (level: string | undefined) => number;
    level: number;
    debug: (...message: any) => void;
    info: (...message: any) => void;
    warn: (...message: any) => void;
    error: (...message: any) => void;
}
export declare const logger: Logger;
//# sourceMappingURL=index.d.ts.map