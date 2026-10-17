import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import type { FastifyInstance } from "fastify";

export class PluginRegister {
    public static async register(app: FastifyInstance): Promise<void> {
        await app.register(helmet, {
            global: true,
        });

        await app.register(cors, {
            origin: app.config.corsOrigins.includes("*") ? true : app.config.corsOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            exposedHeaders: ["x-request-id"],
        });

        await app.register(sensible);
    }
}
