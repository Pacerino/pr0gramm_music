import  { createLogger, format, transports }  from 'winston';
const { combine, timestamp, label, prettyPrint, colorize } = format;
import WinstonSentry from 'winston-transport-sentry-node';
import * as dotenv from 'dotenv';

const printFormat = combine(label({ label: 'right meow!' }), timestamp(), prettyPrint(), colorize())

dotenv.config();

const options = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    release: "pr0gramm_music@" + process.env.npm_package_version,
  },
  level: 'error'
};

const logger = createLogger({
  transports: [
    new WinstonSentry(options),
    new transports.Console({level: 'debug', format: printFormat})
  ]
});

export default logger;
