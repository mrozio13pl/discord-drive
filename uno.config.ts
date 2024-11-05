import { defineConfig, presetUno, transformerVariantGroup } from 'unocss';
import { presetDaisy } from 'unocss-preset-daisy';

export default defineConfig({
    presets: [presetUno(), presetDaisy({ themes: ['synthwave', 'light'] })],
    transformers: [transformerVariantGroup()],
});
