import {
	fileURLToPath,
	URL
} from "node:url";
import {
	defineConfig,
	loadEnv
} from 'vite'
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {
	ElementPlusResolver
} from 'unplugin-vue-components/resolvers';
import path from 'path';
import legacy from '@vitejs/plugin-legacy';
import viteCompression from 'vite-plugin-compression';
import {
	VantResolver
} from "unplugin-vue-components/resolvers";
import autoprefixer from "autoprefixer";
import postCssPxToRem from "postcss-pxtorem";
export default defineConfig(({
	mode
}) => {
	// 获取当前环境的配置
	const config = loadEnv(mode, './')
	const IS_APP = config.VITE_IS_APP === 'true' || false;
	console.log('IS_APP:',IS_APP)
	return {
		base: process.env.NODE_ENV === 'production' ? './' : '/',
		server: {
			host: '0.0.0.0', //ip地址
			port: 8080, //端口号
			open: true, //启动后是否自动打开浏览器
			proxy: {
				'/api': {
					target: config.VITE_BASIC_URL,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				}
			}
		},
		plugins: [
			...(IS_APP ? [] : [
				// 安卓包不需要gzip
				viteCompression({
					verbose: true,
					disable: false,
					threshold: 10240,
					algorithm: 'gzip',
					ext: '.gz',
				}),
				// 安卓包legacy会导致页面崩溃
				legacy({
					targets: ['defaults', 'Android >= 5', 'ie>=11'],
					additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
				}),
			]),
			
			vue(),
			AutoImport({
				resolvers: [ElementPlusResolver()],
			}),
			Components({
				resolvers: [ElementPlusResolver(),VantResolver()],
			}),
		],
		css: {
			postcss: {
				plugins: [
					autoprefixer({
						overrideBrowserslist: [
							"Android 4.1",
							"iOS 7.1",
							"Chrome > 31",
							"ff > 31",
							"ie >= 8",
						],
					}),
					postCssPxToRem({
						// 自适应，px>rem转换
						rootValue: 160, // 75表示750设计稿，37.5表示375设计稿
						propList: ["*"], // 需要转换的属性，这里选择全部都进行转换
						exclude: "/node_modules", // 忽略包文件转换rem
						minPixelValue: 2
					}),
				],
			},
		},
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		build: {
			assetsDir: 'static',
			minify: 'terser',
			productionSouceMap: false,
			assetsPublicPath: '/cashier/',
			rollupOptions: {
				output: {
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					manualChunks(id) {
						if (id.includes('node_modules')) {
							return id.toString().split('node_modules/')[1].split('/')[0].toString();
						}
					}
				}
			},
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
				},
			}
		}
	}
})