// Logs
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

export class Logger {
    private static instance: Logger;
    private level: LogLevel = LogLevel.INFO;

    private constructor() { }
    
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;;
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    debug(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.WARN) {
            console.log(`[WARN] ${message}`, ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.log(`[ERROR] ${message}`, ...args);
        }
    }
}

// Export single instance
export const logger = Logger.getInstance();