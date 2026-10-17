import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundErr } from "@/common/errors/errors";

export class NotFoundHandler {
    public static handle(request: FastifyRequest, _reply: FastifyReply): void {
        throw new NotFoundErr(`The requested resource ${request.url} was not found.`);
    }
}
