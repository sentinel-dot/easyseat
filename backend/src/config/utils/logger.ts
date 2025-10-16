class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
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

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = this.formatTimestamp();
    let formatted = `[${timestamp}] [${this.context}] [${level}] ${message}`;
    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    return formatted;
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('INFO', message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('WARN', message, data));
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    console.error(this.formatMessage('ERROR', message, errorData));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  separator(char: string = '-', length: number = 135, label?: string): void {
    const line = char.repeat(length);
    if (label) {
      const padding = Math.floor((length - label.length - 2) / 2);
      const paddedLabel = char.repeat(padding) + ` ${label} ` + char.repeat(padding);
      console.log(paddedLabel);
    } else {
      console.log(line);
    }
  }
}


// Factory function um Logger mit Context zu erstellen
export function createLogger(context: string): Logger {
    return new Logger(context);
}

// Default Logger Export
export default new Logger('App');