import type config from "@/config/config";

declare module "fastify" {
    interface FastifyInstance {
        readonly config: typeof config;
    }
}
