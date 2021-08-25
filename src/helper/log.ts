import  { createLogger, format, transports }  from 'winston';
import Sentry from 'winston-transport-sentry-node';
const { combine, timestamp, prettyPrint, colorize } = format;
import * as dotenv from 'dotenv';

const printFormat = combine(timestamp(), prettyPrint(), colorize())

dotenv.config();

const sentryTransport = new Sentry({
  level: process.env.LOG_LEVEL
});

const logger = createLogger({
  transports: [
    new transports.Console({level: 'debug', format: printFormat}),
    sentryTransport
  ]
});

export default logger;
