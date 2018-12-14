/*
 * Copyright (c) 2018 by Lưu Hiếu <tronghieu.luu@gmail.com>
 */
'use strict';

const winston = require('winston');
const util = require("util");
const format = winston.format;
const { combine, timestamp } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const MESSAGE = Symbol.for('message'),
  SPLAT = Symbol.for('splat');

class Logger {
  constructor (config) {
    this.options = Object.assign({
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }, config);
  }

  createLogger (channel) {
    if (channel) {
      this.options.filename = `${channel}-${this.options.filename}`;
    }
    let errorOption = Object.assign({}, this.options);
    errorOption.filename = `err-${errorOption.filename}`;

    let customFormat = format((info) => {
      console.log(info);
      let prefix = util.format('[%s] [%s]', info.timestamp, info.level.toUpperCase());
      if (info[SPLAT]) {
        info[MESSAGE] = util.format('%s %s %s', prefix, info['message'], JSON.stringify(info[SPLAT]));
        // console.log(info);
      } else {
        info[MESSAGE] = util.format('%s %s', prefix, info['message']);
      }

      return info;
    });

    return winston.createLogger({
      level: this.options['level'],
      format: combine(
        timestamp(),
        // prettyPrint(),
        customFormat()
      ),
      transports: [
        // new winston.transports.Console(),
        new (DailyRotateFile)(this.options)
      ],
      exceptionHandlers: [new (DailyRotateFile)(errorOption)]
    });
  }
}

module.exports = Logger;