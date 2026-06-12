/**
 * Structured logging via Pino (TRD §16). Pretty-prints in development,
 * emits JSON in production for Railway's log drain.
 */
import { pino } from 'pino';

import { env, isProd, isTest } from './env';

export const logger = pino({
  level: isTest ? 'silent' : env.LOG_LEVEL,
  ...(isProd || isTest
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
    remove: true,
  },
});
