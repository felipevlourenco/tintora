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
        lib: { entry: 'src/index.ts' },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            // One file per source module, not one bundle. Importing a pure
            // component (Spinner) must not run another one's module-scope
            // createContext(), which throws in a React Server Component. The
            // JS files are side-effect free (package.json "sideEffects"), so
            // bundlers drop the modules an import does not use. The barrel is
            // the exception: it imports the stylesheet, and a barrel flagged
            // side-effect free is skipped, taking the CSS with it.
            output: [
                {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    entryFileNames: '[name].js',
                },
                {
                    format: 'cjs',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    entryFileNames: '[name].cjs',
                },
            ],
        },
    },
});
