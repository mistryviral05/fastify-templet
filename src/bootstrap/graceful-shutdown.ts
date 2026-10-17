import type { FastifyInstance } from "fastify";

type ShutdownSignal = "SIGINT" | "SIGTERM";

const SIGNALS: readonly ShutdownSignal[] = ["SIGINT", "SIGTERM"];

export class GracefulShutdown {
    private readonly app: FastifyInstance;

    private readonly timeoutMs: number;

    private isClosing = false;

    public constructor(app: FastifyInstance, timeoutMs = 10_000) {
        this.app = app;
        this.timeoutMs = timeoutMs;
    }

    public register(): void {
        for (const signal of SIGNALS) {
            process.once(signal, () => {
                void this.close(signal);
            });
        }

        process.on("unhandledRejection", (reason) => {
            this.app.log.fatal({ err: reason }, "unhandled rejection");
            void this.close("unhandledRejection", 1);
        });

        process.on("uncaughtException", (error) => {
            this.app.log.fatal({ err: error }, "uncaught exception");
            void this.close("uncaughtException", 1);
        });
    }

    private async close(reason: string, exitCode = 0): Promise<void> {
        if (this.isClosing) {
            return;
        }

        this.isClosing = true;
        this.app.log.info({ reason }, "shutting down");

        const forceExit = setTimeout(() => {
            this.app.log.error("shutdown timed out, forcing exit");
            process.exit(1);
        }, this.timeoutMs);

        forceExit.unref();

        try {
            await this.app.close();
            this.app.log.info("shutdown complete");
            process.exit(exitCode);
        } catch (error) {
            this.app.log.error({ err: error }, "shutdown failed");
            process.exit(1);
        }
    }
}
