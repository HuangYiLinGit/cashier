import {
	createRouter,
	createWebHashHistory
} from 'vue-router';
import {
	setupPermissions
} from './permissions';
export const constantRoutes = [{
		path: '/login',
		name: 'login',
		meta: {
			title: '登录'
		},
		component: () => import('@/views/login/index.vue'),
	},
	{
		path: '/',
		redirect: '/home',
		meta: {
			title: '登录'
		},
	},
	{
		path: '/secondary',
		name: 'secondary',
		meta: {
			title: '收银台副屏'
		},
		component: () => import('@/views/secondary/index.vue')
	},
	{
		path: '/home',
		name: 'Home',
		meta: {
			title: '管理台'
		},
		component: () => import('@/views/layout/Main.vue'),
		children: [{
				path: '/home/index',
				name: 'HomeIndex',
				meta: {
					title: '收银',
					topTree: '/home'
				},
				component: () => import('@/views/home/index.vue'),
			},
			{
				path: '/table/index',
				name: 'table_index',
				meta: {
					title: '桌台'
				},
				component: () =>
					import('@/views/table/index.vue')
			},
			{
				path: '/order/index',
				name: 'orderIndex',
				meta: {
					title: '订单'
				},
				component: () =>
					import('@/views/order/index.vue')
			},
			{
				path: '/index/index',
				name: 'Index',
				meta: {
					title: '统计',
				},
				component: () => import('@/views/index/index.vue'),
			}, {
				path: '/verification/index',
				name: 'verificationIndex',
				meta: {
					title: '核销',
				},
				component: () => import('@/views/verification/index.vue'),
			}, {
				path: '/member/index',
				name: 'memberIndex',
				meta: {
					title: '会员',
				},
				component: () => import('@/views/member/index.vue'),
			},
			{
				path: '/douyin/verify',
				name: 'DouyinVerify',
				meta: {
					title: '抖音核销确认',
				},
				component: () => import('@/views/douyin/verify.vue'),
			},
			{
				path: '/fonticon',
				name: 'Fonticon',
				meta: {
					title: '字体图标'
				},
				component: () =>
					import('@/views/help/Fonticon.vue')
			},
			{
				path: '/error',
				name: 'Page404',
				meta: {
					title: '错误页面'
				},
				component: () =>
					import('@/views/error-page/404.vue')
			}
		]
	},
];
const router = createRouter({
	history: createWebHashHistory(),
	routes: constantRoutes,
});
export function setupRouter(app) {
	setupPermissions(router);
	app.use(router);
	return router;
}

export default router;
