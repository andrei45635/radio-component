import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 4321
    },
    preview: {
        port: 4321
    },
    build: {
        emptyOutDir: true,
        lib: {
            entry: './src/radio-player.ts',
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
