<template>
	<el-config-provider :locale="locale">
		<router-view />
	</el-config-provider>
</template>
<script>
	import {
		reactive,
		toRefs,
		defineComponent,
		onMounted
	} from 'vue';
	import {
		ElConfigProvider
	} from 'element-plus';
	// import zhCn from 'element-plus/lib/locale/lang/zh-cn';
	import zhCn from "element-plus/es/locale/lang/zh-cn";
	import router from '@/router';
	import { ScreenService } from '@/utils/screen';
	export default defineComponent({
		components: {
			[ElConfigProvider.name]: ElConfigProvider,
		},
		setup() {
			let locale = zhCn;
			const state = reactive({});
			
			onMounted(async () => {
				try {
					// 等待路由完全就绪
					await router.isReady();
					await ScreenService.initCapacitorSecondary('/secondary');
					console.log("Capacitor 初始化完成");
				} catch (error) {
					console.error("Capacitor 初始化失败:", error);
				}
			});

			return {
				...toRefs(state),
				locale,
			};
		}
	});
</script>
<style lang="scss">
	@use '@/assets/font/iconfont.css';
	@use '@/assets/font/myIcon.css';
	@use '@/styles/diy.scss';

	* {
		margin: 0;
		padding: 0;
	}
</style>