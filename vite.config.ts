import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Lib mode bundles all CSS into dist/tintora.css but leaves the JS without
// an import for it. Add one to the ESM entry so consumers need no extra line.
// ponytail: ESM only, CJS consumers still import 'tintora/style.css'.
const injectCss = {
    name: 'inject-css',
    renderChunk(
        code: string,
        chunk: { isEntry: boolean },
        opts: { format: string },
    ) {
        if (opts.format !== 'es' || !chunk.isEntry) return null;
        return { code: `import './tintora.css';\n${code}`, map: null };
    },
};

export default defineConfig({
    plugins: [react(), injectCss],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        clearMocks: true,
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
            fileName: (f) => `index.${f === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
        },
    },
});
