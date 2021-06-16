import { configure, getLogger } from "log4js";

class LogService {

  private logger = getLogger();
  constructor() {
    configure({
      appenders: { console: { type: 'console' } },
      categories: { default: { appenders: [ 'console' ], level: 'debug' } }
    });
  }

  debug(text: unknown): void {
    this.logger.debug(text);
  }

  info(text: unknown): void {
    this.logger.info(text);
  }

  error(text: unknown): void {
    this.logger.error(text);
  }

  fatal(text: unknown): void {
    this.logger.fatal(text);
    process.exit(0);
  }

}

export default LogService;
