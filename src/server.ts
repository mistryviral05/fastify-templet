import buildApp from "@/app";
import { GracefulShutdown } from "@/bootstrap";

async function startServer() {
    const app = await buildApp();
    new GracefulShutdown(app).register();

    try {
        await app.listen({ port: app.config.port, host: app.config.host });
    } catch (error) {
        app.log.fatal({ err: error }, "failed to start server");
        process.exit(1);
    }
}
await startServer();
