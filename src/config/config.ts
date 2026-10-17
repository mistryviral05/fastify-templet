const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        // oxlint-disable-next-line no-console
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }

    return value;
};
const optional = (key: string, fallback: string): string => {
    const value = process.env[key];
    return value !== undefined && value.trim().length > 0 ? value : fallback;
};

const optionalOrNull = (key: string): string | null => {
    const value = process.env[key];
    return value !== undefined && value.trim().length > 0 ? value.trim() : null;
};

const env = process.env.NODE_ENV || "production";
const _config = {
    env,
    port: Math.trunc(Number(required("PORT"))),
    appName: required("APP_NAME"),
    corsOrigins: required("CORS_ORIGINS")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    host: required("HOST"),
    logLevel: optional("LOG_LEVEL", "info"),
    logFile: optionalOrNull("LOG_FILE"),
};

const config = Object.freeze(_config);

export default config;
