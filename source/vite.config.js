const Path = require('path');
const vuePlugin = require('@vitejs/plugin-vue')

const { defineConfig } = require('vite');

const config = defineConfig({
    root: Path.join(__dirname, 'src', 'renderer'),
    publicDir: 'public',
    base: './', // Добавлено это свойство
    server: {
        port: 8080,
    },
    open: false,
    build: {
        outDir: Path.join(__dirname, 'build', 'renderer'),
        emptyOutDir: true,
    },
    plugins: [vuePlugin()],
});

module.exports = config;
