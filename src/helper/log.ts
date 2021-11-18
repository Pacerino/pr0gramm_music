import  { createLogger, format, transports }  from 'winston';
const { combine, timestamp, prettyPrint, colorize } = format;
import * as dotenv from 'dotenv';

const printFormat = combine(timestamp(), prettyPrint(), colorize())

dotenv.config();

const logger = createLogger({
  transports: [
    new transports.Console({level: 'debug', format: printFormat}),
  ]
});

export default logger;
