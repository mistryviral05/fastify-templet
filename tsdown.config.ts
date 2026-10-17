import { defineConfig } from 'tsdown';

export default defineConfig({
    /* Entry point of the application */
    entry: ['src/server.ts'],

    /* Output */
    outDir: 'dist',
    format: ['esm'],
    platform: 'node',
    target: 'node22',

    /* package.json already has "type": "module", so .js is ESM.
       Without this, tsdown emits .mjs on the node platform. */
    fixedExtension: false,

    /* Use the build tsconfig, it excludes spec files */
    tsconfig: 'tsconfig.build.json',

    /* Keep one output file per source file, mirrors src structure */
    unbundle: true,

    /* Keep the input root stable so dist mirrors src */
    root: 'src',

    /* Clean dist before every build */
    clean: true,

    /* Source maps for readable stack traces */
    sourcemap: true,

    /* No declaration files, this is an app not a library */
    dts: false,

    /* Keep output readable, Node does not need minified code */
    minify: false,

    /* No hash in filenames, we need a stable dist/server.js */
    hash: false,
});

