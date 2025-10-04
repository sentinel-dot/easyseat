// src/utils/logger.ts

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

interface LogContext {
    [key: string]: any;
}

class Logger {
    private context: string;
    private minLevel: LogLevel;

    constructor(context: string = 'App') {
        this.context = context;
        this.minLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }

    private formatTimestamp(): string {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }


    private formatMessage(level: string, message: string, meta?: LogContext): string {
        const timestamp = this.formatTimestamp();
        const baseLog = `[${timestamp}] [${level}] [${this.context}] ${message}`;
        
        if (meta && Object.keys(meta).length > 0) {
            return `${baseLog} ${JSON.stringify(meta)}`;
        }
        
        return baseLog;
    }

    private getColor(level: LogLevel): string {
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m',  // Green
            [LogLevel.WARN]: '\x1b[33m',  // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
        };
        return colors[level] || '';
    }

    private resetColor(): string {
        return '\x1b[0m';
    }

    private log(level: LogLevel, levelName: string, message: string, meta?: LogContext): void {
        if (level < this.minLevel) return;

        const timestamp = this.formatTimestamp();
        const color = this.getColor(level);
        const reset = this.resetColor();
        
        // Base log ohne Meta
        const baseLog = `${color}[${timestamp}] [${levelName}] [${this.context}] ${message}${reset}`;
        
        // Meta separat ausgeben für bessere Lesbarkeit
        if (meta && Object.keys(meta).length > 0) {
            const metaStr = JSON.stringify(meta, null, 2);
            
            switch (level) {
                case LogLevel.DEBUG:
                case LogLevel.INFO:
                    console.log(baseLog);
                    console.log(`${color}${metaStr}${reset}`);
                    break;
                case LogLevel.WARN:
                    console.warn(baseLog);
                    console.warn(`${color}${metaStr}${reset}`);
                    break;
                case LogLevel.ERROR:
                    console.error(baseLog);
                    console.error(`${color}${metaStr}${reset}`);
                    break;
            }
        } else {
            switch (level) {
                case LogLevel.DEBUG:
                case LogLevel.INFO:
                    console.log(baseLog);
                    break;
                case LogLevel.WARN:
                    console.warn(baseLog);
                    break;
                case LogLevel.ERROR:
                    console.error(baseLog);
                    break;
            }
        }
    }

    debug(message: string, meta?: LogContext): void {
        this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
    }

    info(message: string, meta?: LogContext): void {
        this.log(LogLevel.INFO, 'INFO', message, meta);
    }

    warn(message: string, meta?: LogContext): void {
        this.log(LogLevel.WARN, 'WARN', message, meta);
    }

    error(message: string, error?: Error | unknown, meta?: LogContext): void {
        const errorMeta: LogContext = { ...meta };
        
        if (error instanceof Error) {
            errorMeta.error = {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            };
        } else if (error) {
            errorMeta.error = String(error);
        }

        this.log(LogLevel.ERROR, 'ERROR', message, errorMeta);
    }

    // HTTP Request Logger
    request(method: string, path: string, meta?: LogContext): void {
        console.log('\n' + '─'.repeat(80) + '\n');
        this.info(`${method} ${path}`, meta);
    }

    // HTTP Response Logger
    response(method: string, path: string, statusCode: number, meta?: LogContext): void {
        const responseMeta: LogContext = {
            statusCode,
            ...meta,
        };

        if (statusCode >= 500) {
            this.error(`${method} ${path}`, undefined, responseMeta);
        } else if (statusCode >= 400) {
            this.warn(`${method} ${path}`, responseMeta);
        } else {
            this.info(`${method} ${path}`, responseMeta);
        }
    }

    // Database Query Logger
    query(query: string, params?: any[], duration?: number): void {
        this.debug('Database query executed', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            duration: duration ? `${duration}ms` : undefined,
        });
    }
}

// Factory function um Logger mit Context zu erstellen
export function createLogger(context: string): Logger {
    return new Logger(context);
}

// Default Logger Export
export default new Logger('App');