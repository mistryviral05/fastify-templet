import type { FastifyInstance } from "fastify";

export class HooksRegister {
    public static register(app: FastifyInstance): void {
        app.addHook("onRequest", (request, reply) => {
            reply.header("x-request-id", request.id);
        });
    }
}
