const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        // oxlint-disable-next-line no-console
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }

    return value;
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
};

const config = Object.freeze(_config);

export default config;
