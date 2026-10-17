import buildApp from "@/app";
import { GracefulShutdown } from "@/bootstrap";

async function startServer() {
    const app = await buildApp();
    new GracefulShutdown(app).register();

    try {
        await app.listen({ port: app.config.port, host: app.config.host });
        app.log.info({ appName: app.config.appName, env: app.config.env }, "server started");
    } catch (error) {
        app.log.fatal({ err: error }, "failed to start server");
        process.exit(1);
    }
}
await startServer();
