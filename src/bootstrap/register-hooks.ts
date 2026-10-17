import type { FastifyInstance } from "fastify";

export class HooksRegister {
    public static async register(app: FastifyInstance): Promise<void> {
        // oxlint-disable-next-line require-await
        await app.addHook("onRequest", async (request, reply) => {
            reply.header("x-request-id", request.id);
        });
    }
}
