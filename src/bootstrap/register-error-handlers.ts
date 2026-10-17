import type { FastifyInstance } from "fastify";

import { ErrorHandler } from "@/common/errors/error-handler";
import { NotFoundHandler } from "@/common/errors/not-found-handler";

export class ErrorHandlerRegister {
    public static register(app: FastifyInstance): void {
        app.setErrorHandler((error, request, reply) => {
            ErrorHandler.handle(error, request, reply);
        });

        app.setNotFoundHandler((request, reply) => {
            NotFoundHandler.handle(request, reply);
        });
    }
}
