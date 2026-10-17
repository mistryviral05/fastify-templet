import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const CONFIG_URL = new URL("./config.ts", import.meta.url).href;

interface LoadedConfig {
    env: string;
    port: number;
    appName: string;
    corsOrigins: string[];
}

interface LoadResult {
    status: number;
    stdout: string;
    stderr: string;
}

/**
 * Run the config module in a child process with the given environment.
 */
const loadConfig = (env: Record<string, string>): LoadResult => {
    const code = [
        `const module = await import(${JSON.stringify(CONFIG_URL)});`,
        `console.log(JSON.stringify(module.default));`,
    ].join("\n");

    const result = spawnSync(
        process.execPath,
        ["--import", "tsx", "--input-type=module", "-e", code],
        {
            encoding: "utf8",
            env: { PATH: process.env.PATH ?? "", ...env },
        },
    );

    return {
        status: result.status ?? -1,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
    };
};

/**
 * Run the config module and parse the resulting object.
 * Fails the test when the child process did not exit cleanly.
 */
const loadConfigOrFail = (env: Record<string, string>): LoadedConfig => {
    const result = loadConfig(env);

    assert.equal(
        result.status,
        0,
        `expected a clean exit but got ${result.status}: ${result.stderr}`,
    );

    return JSON.parse(result.stdout) as LoadedConfig;
};

const VALID_ENV = {
    NODE_ENV: "development",
    PORT: "3000",
    APP_NAME: "fastify-template",
    CORS_ORIGINS: "http://localhost:3000",
};

describe("config", () => {
    it("reads every value from the environment", () => {
        const config = loadConfigOrFail({
            NODE_ENV: "test",
            PORT: "8080",
            APP_NAME: "my-api",
            CORS_ORIGINS: "http://a.com",
        });

        assert.equal(config.env, "test");
        assert.equal(config.port, 8080);
        assert.equal(config.appName, "my-api");
        assert.deepEqual(config.corsOrigins, ["http://a.com"]);
    });

    it("falls back to production when NODE_ENV is not set", () => {
        const { NODE_ENV: _ignored, ...envWithoutNodeEnv } = VALID_ENV;
        const config = loadConfigOrFail(envWithoutNodeEnv);

        assert.equal(config.env, "production");
    });

    it("turns the port into an integer", () => {
        const config = loadConfigOrFail({ ...VALID_ENV, PORT: "3000.9" });

        assert.equal(config.port, 3000);
        assert.equal(Number.isInteger(config.port), true);
    });

    it("splits the origin list and trims each entry", () => {
        const config = loadConfigOrFail({
            ...VALID_ENV,
            CORS_ORIGINS: " http://a.com , http://b.com ,, http://c.com ",
        });

        assert.deepEqual(config.corsOrigins, ["http://a.com", "http://b.com", "http://c.com"]);
    });

    it("keeps a single origin as a one item list", () => {
        const config = loadConfigOrFail({
            ...VALID_ENV,
            CORS_ORIGINS: "http://only.com",
        });

        assert.deepEqual(config.corsOrigins, ["http://only.com"]);
    });

    it("exits with code 1 when PORT is missing", () => {
        const { PORT: _ignored, ...envWithoutPort } = VALID_ENV;
        const result = loadConfig(envWithoutPort);

        assert.equal(result.status, 1);
        assert.match(result.stderr, /Missing required environment variable: PORT/u);
    });

    it("exits with code 1 when APP_NAME is missing", () => {
        const { APP_NAME: _ignored, ...envWithoutAppName } = VALID_ENV;
        const result = loadConfig(envWithoutAppName);

        assert.equal(result.status, 1);
        assert.match(result.stderr, /Missing required environment variable: APP_NAME/u);
    });

    it("exits with code 1 when CORS_ORIGINS is missing", () => {
        const { CORS_ORIGINS: _ignored, ...envWithoutCors } = VALID_ENV;
        const result = loadConfig(envWithoutCors);

        assert.equal(result.status, 1);
        assert.match(result.stderr, /Missing required environment variable: CORS_ORIGINS/u);
    });

    it("exits with code 1 when a required variable is an empty string", () => {
        const result = loadConfig({ ...VALID_ENV, APP_NAME: "" });

        assert.equal(result.status, 1);
        assert.match(result.stderr, /Missing required environment variable: APP_NAME/u);
    });

    it("freezes the exported object", () => {
        const code = [
            `const module = await import(${JSON.stringify(CONFIG_URL)});`,
            `console.log(JSON.stringify({ frozen: Object.isFrozen(module.default) }));`,
        ].join("\n");

        const result = spawnSync(
            process.execPath,
            ["--import", "tsx", "--input-type=module", "-e", code],
            {
                encoding: "utf8",
                env: { PATH: process.env.PATH ?? "", ...VALID_ENV },
            },
        );

        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(JSON.parse(result.stdout), { frozen: true });
    });
});
