import type { FastifyInstance } from "fastify";

import { bootstrap, ServerFactory } from "@/bootstrap";
import config from "@/config/config";

async function buildApp(): Promise<FastifyInstance> {
    const app = ServerFactory.create(config);
    await bootstrap(app);
    return app;
}
export default buildApp;
