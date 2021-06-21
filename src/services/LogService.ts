import { configure, getLogger } from "log4js";
import * as Sentry from '@sentry/node';

class LogService {

  private logger = getLogger();
  constructor() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0
    });

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
    Sentry.captureException(text);
    this.logger.error(text);
  }

  fatal(text: unknown): void {
    Sentry.captureException(text);
    this.logger.fatal(text);
    //process.exit(0);
  }

}

export default LogService;
