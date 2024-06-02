export class Logger {
   loggingLevels: string[] = ['DEBUG', 'INFO', 'WARN', 'ERROR']
   getLoggingLevel = (level: string | undefined) => {
      if (level && this.loggingLevels.includes(level))
         return this.loggingLevels.indexOf(level)

      return 1
   }

   level: number = this.getLoggingLevel(process.env.NODE_LOGGING_LEVEL)

   debug = (...message: any) => {
      if (this.level > 0) return;
      console.debug(message);
   }

   info = (...message: any) => {
      if (this.level > 1) return;
      console.info(message);
   }

   warn = (...message: any) => {
      if (this.level > 2) return;
      console.warn(message);
   }

   error = (...message: any) => {
      if (this.level > 3) return;
      console.error(message);
   }
}

export const logger: Logger = new Logger()
