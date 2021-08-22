import  { createLogger, format, transports }  from 'winston';
const { combine, timestamp, label, prettyPrint, colorize } = format;
import * as dotenv from 'dotenv';

const printFormat = combine(label({ label: 'right meow!' }), timestamp(), prettyPrint(), colorize())

dotenv.config();

const logger = createLogger({
  transports: [
    new transports.Console({level: 'debug', format: printFormat})
  ]
});

export default logger;
