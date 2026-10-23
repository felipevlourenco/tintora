import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Lib mode bundles all CSS into dist/tintora.css but leaves the JS without
// an import for it. Add one to the ESM entry so consumers need no extra line.
// Only the library entry: Storybook builds with this same config and has no
// such file.
// ponytail: ESM only, CJS consumers still import 'tintora/style.css'.
const injectCss = {
    name: 'inject-css',
    renderChunk(
        code: string,
        chunk: { isEntry: boolean; facadeModuleId?: string | null },
        opts: { format: string },
    ) {
        const isLibEntry = chunk.facadeModuleId?.endsWith('/src/index.ts');
        if (opts.format !== 'es' || !chunk.isEntry || !isLibEntry) return null;
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
