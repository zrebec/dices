import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	base: '/dices/',
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: '../dist',
	},
});
