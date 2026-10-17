import { randomUUID } from "node:crypto";

import Fastify, { type FastifyInstance } from "fastify";

import logger from "@/common/logger/logger";
import config from "@/config/config";

export class ServerFactory {
    public static create(appConfig: typeof config = config): FastifyInstance {
        const app = Fastify({
            loggerInstance: logger,
            genReqId: () => randomUUID(),
            requestIdHeader: "x-request-id",
            trustProxy: true,
        });
        app.decorate("config", appConfig);
        return app;
    }
}
