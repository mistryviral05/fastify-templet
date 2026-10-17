import type { FastifyBaseLogger } from "fastify";
import pino from "pino";

import config from "@/config/config";

/**
 * Fields that must never reach the log output.
 * They are removed instead of masked, so nothing about the value survives.
 */
const REDACTED_PATHS = [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers['x-api-key']",
    "res.headers['set-cookie']",
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
];

/**
 * Builds the single pino instance the application logs through.
 *
 * Fastify ships with pino already, but it only accepts an instance when the
 * logger needs more than plain options. Writing to several destinations is one
 * of those cases, so the instance is built here and handed to Fastify through
 * the loggerInstance option.
 */
export class LoggerFactory {
    /**
     * The return type is FastifyBaseLogger rather than pino.Logger.
     * Fastify reads the logger type from the instance it is handed, so a
     * narrower pino type would push that type through every FastifyInstance
     * in the application and stop it matching the plain FastifyInstance type.
     */
    public static create(): FastifyBaseLogger {
        return pino(
            {
                level: config.logLevel,

                /* Tag every line so logs from several services stay separable */
                base: {
                    service: config.appName,
                    env: config.env,
                },

                messageKey: "message",
                errorKey: "error",
                timestamp: pino.stdTimeFunctions.isoTime,

                /* Log the level name rather than its number */
                formatters: {
                    level: (label) => ({ level: label }),
                },

                redact: {
                    paths: REDACTED_PATHS,
                    remove: true,
                },

                serializers: LoggerFactory.serializers(),
            },
            pino.multistream(LoggerFactory.streams()),
        );
    }

    /**
     * Collects the destinations the logger writes to.
     *
     * Every environment gets the same structured json on stdout, so what a
     * developer reads locally is the exact shape a log collector receives in
     * production. A file destination is added only when one is configured, so
     * a container deployment keeps writing to stdout alone.
     */
    private static streams(): pino.StreamEntry[] {
        const streams: pino.StreamEntry[] = [
            {
                stream: pino.destination({ dest: 1, sync: false }),
            },
        ];

        if (config.logFile !== null) {
            streams.push({
                stream: pino.destination({
                    dest: config.logFile,
                    mkdir: true,
                    sync: false,
                }),
            });
        }

        return streams;
    }

    /**
     * Keeps the request and reply objects small.
     * The pino defaults log every header, which is noisy and leaks more than
     * the redact list can reliably catch.
     */
    private static serializers(): NonNullable<pino.LoggerOptions["serializers"]> {
        return {
            req(request: { id: string; method: string; url: string; ip: string }) {
                return {
                    id: request.id,
                    method: request.method,
                    url: request.url,
                    remoteAddress: request.ip,
                };
            },

            res(reply: { statusCode: number }) {
                return {
                    statusCode: reply.statusCode,
                };
            },

            /* The stack stays in the log in every environment. Hiding it belongs
               in the http response, not here, where it is the only clue left. */
            err(error: Error) {
                return {
                    type: error.name,
                    message: error.message,
                    stack: error.stack ?? "",
                };
            },
        };
    }
}

const logger = LoggerFactory.create();

export default logger;
