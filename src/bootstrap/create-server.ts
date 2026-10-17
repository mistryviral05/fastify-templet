import Fastify, { type FastifyInstance } from "fastify";

import config from "@/config/config";

export class ServerFactory {
    public static create(appConfig: typeof config = config): FastifyInstance {
        const app = Fastify({
            logger: true,
        });
        app.decorate("config", appConfig);
        return app;
    }
}
