import type { FastifyInstance } from "fastify";

import { HooksRegister } from "@/bootstrap/register-hooks";
import { PluginRegister } from "@/bootstrap/register-plugins";

export const bootstrap = async (app: FastifyInstance): Promise<void> => {
    await PluginRegister.register(app);
    await HooksRegister.register(app);
    app.get("/health", (request, reply) => {
        request.log.info("Health check endpoint called");
        reply.send({ status: "ok" });
    });
    await app.ready();
};

export { ServerFactory } from "@/bootstrap/create-server";
export { GracefulShutdown } from "@/bootstrap/graceful-shutdown";
