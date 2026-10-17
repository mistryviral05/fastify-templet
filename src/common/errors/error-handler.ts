import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

import errCodes from "@/common/errors/codes";
import { AppErr } from "@/common/errors/errors";
import type { ErrDetail, ErrResponseEnvelope } from "@/common/errors/types";
import config from "@/config/config";

interface ErrShape {
    statusCode: number;
    message: string;
    code: string;
    details: ErrDetail[];
}
export class ErrorHandler {
    public static handle(error: unknown, request: FastifyRequest, reply: FastifyReply): void {
        const failure = ErrorHandler.toError(error);

        if (reply.raw.headersSent) {
            request.log.error({ err: failure }, "Error raised after the response was sent");
            return;
        }

        const shape = ErrorHandler.classify(failure);

        ErrorHandler.log(failure, request, shape.statusCode);
        reply.code(shape.statusCode).send(ErrorHandler.envelope(shape, request.id));
    }

    private static toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error(typeof error === "string" ? error : "A non error value was thrown.");
    }

    private static classify(error: Error): ErrShape {
        if (error instanceof AppErr) {
            return {
                statusCode: error.statusCode,
                message: error.message,
                code: error.code,
                details: [],
            };
        }

        if (ErrorHandler.isSchemaError(error)) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Request validation failed.",
                code: errCodes.validationErr,
                details: ErrorHandler.toDetails(error),
            };
        }

        if (ErrorHandler.hasClientStatus(error)) {
            return {
                statusCode: error.statusCode,
                message: error.message,
                code: errCodes.internalErr,
                details: [],
            };
        }

        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: config.env === "production" ? "An unexpected error occurred." : error.message,
            code: errCodes.internalErr,
            details: [],
        };
    }

    private static log(error: Error, request: FastifyRequest, statusCode: number): void {
        if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
            request.log.error({ err: error }, "Request failed");
            return;
        }

        request.log.warn({ err: error }, "Request rejected");
    }

    private static envelope(shape: ErrShape, requestId: string): ErrResponseEnvelope {
        return {
            error: {
                code: shape.code,
                message: shape.message,
                request_id: requestId,
                ...(shape.details.length > 0 ? { details: shape.details } : {}),
            },
        };
    }

    private static isSchemaError(error: Error): error is FastifyError {
        return Array.isArray((error as FastifyError).validation);
    }

    private static hasClientStatus(error: Error): error is FastifyError & { statusCode: number } {
        const status = (error as FastifyError).statusCode;
        return (
            typeof status === "number" &&
            status >= StatusCodes.BAD_REQUEST &&
            status < StatusCodes.INTERNAL_SERVER_ERROR
        );
    }

    private static toDetails(error: FastifyError): ErrDetail[] {
        return (error.validation ?? []).map((issue) => ({
            field: ErrorHandler.fieldName(issue.instancePath, issue.params),
            message: issue.message ?? "Invalid value.",
        }));
    }

    private static fieldName(instancePath: string, params: Record<string, unknown>): string {
        if (instancePath.length > 0) {
            return instancePath.replace(/^\//u, "").replaceAll("/", ".");
        }

        const missing = params.missingProperty;
        return typeof missing === "string" ? missing : "body";
    }
}
