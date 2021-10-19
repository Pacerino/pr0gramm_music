import  { createLogger, format, transports }  from 'winston';
const { combine, timestamp, prettyPrint, colorize } = format;
import * as dotenv from 'dotenv';

const printFormat = combine(timestamp(), prettyPrint(), colorize())

dotenv.config();

const logger = createLogger({
  transports: [
    new transports.Console({level: 'debug', format: printFormat}),
    new transports.Http({
      host: process.env.WINSTON_HTTP,
      port: Number(process.env.WINSTON_PORT),
      path: "/"
  })
  ]
});

export default logger;
