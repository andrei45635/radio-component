import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        emptyOutDir: true,
        lib: {
            entry: 'src/radio-player.ts',
            formats: ['es'],
            fileName: 'radio-player',
        },
        // rollupOptions: {
        //     external: [/lit/],
        //     output: {
        //         globals: {
        //             lit: 'Lit',
        //         },
        //     },
        // },
    },
});
