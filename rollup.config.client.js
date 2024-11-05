import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import sucrase from '@rollup/plugin-sucrase';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import outputSize from 'rollup-plugin-output-size';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import esbuild from 'rollup-plugin-esbuild';
import { isDevelopment } from 'std-env';
import path from 'node:path';

function isUriEncoded(str) {
    try {
        return str !== decodeURIComponent(str);
    } catch (e) {
        return false;
    }
}

export default defineConfig({
    input: 'client/index.tsx',
    output: {
        file: 'public/client.js',
        format: 'iife',
        name: 'discorddrive',
    },
    plugins: [
        typescript(),
        postcss({ minimize: true }),
        sucrase({
            exclude: ['node_modules/**'],
            transforms: ['jsx'],
            jsxPragma: 'h',
        }),
        esbuild({
            minify: !isDevelopment,
        }),
        nodeResolve(),
        outputSize(),
        copy({
            targets: [
                {
                    src: './node_modules/@fontsource-variable/nunito-sans/files/nunito-sans-latin-wght-normal.woff2',
                    dest: './public/files/',
                },
            ],
        }),
        nodePolyfills(),
        commonjs({ include: /node_modules/ }),
        {
            // fix for linguist
            name: 'fix-space-encoding',
            resolveId(source, importer) {
                if (isUriEncoded(source)) {
                    const fixedSource = decodeURIComponent(source);
                    return path.resolve(path.dirname(importer), fixedSource);
                }

                return null;
            },
        },
    ],
});
