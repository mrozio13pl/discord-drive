import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import outputSize from 'rollup-plugin-output-size';
import commonjs from '@rollup/plugin-commonjs';
import esmShim from '@rollup/plugin-esm-shim';
import rimraf from '@zkochan/rimraf';
import clientConfig from './rollup.config.client.js';
import { isDevelopment } from 'std-env';

await rimraf('dist');

export default defineConfig([
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'esm',
        },
        plugins: [
            typescript(),
            esbuild({ target: 'esnext', minify: !isDevelopment }),
            json(),
            outputSize(),
            esmShim(),
            commonjs(),
        ],
        external: isDevelopment ? [] : ['colorette'],
    },
    clientConfig,
]);
