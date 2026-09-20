<template>
	<!--
          作者：luoyiming
          时间：2019-10-24
          描述：后台系统头部
      -->
	<div class="common-header">
		<div class="breadcrumb">
			<div class="baseInfo-left-base">
				<span class="name">店铺名称：{{ shop_name }}</span>
				<span class="timer">{{nowDate}}</span>
			</div>
			<div class="header-navbar">
				<div class="header-navbar-icon" @click="checkVersion">
					<el-icon v-if="checkVersionLoading"><Loading /></el-icon>
					<span class="text ml4 f18">检查更新</span>
				</div>
				<!-- <div class="header-navbar-icon" @click="launchFullScreen">
					<span :class="'icon iconfont menu-item-icon icon-quanping'"></span>
					<span class="text ml4 f18">全屏</span>
				</div> -->
				<div class="header-navbar-icon">
					<span class="text ml4 f18">{{ username }}</span>
				</div>
				<div class="header-navbar-icon" @click="login_out()">
					<span class="icon iconfont icon-tuichu"></span>
					<!-- <span class="icon iconfont icon-icon11"></span> -->
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import UserApi from '@/api/user.js';
import IndexApi from '@/api/index.js';
import { ScreenService } from '@/utils/screen';
import {
	useUserStore
} from '@/store';
const {
	bus_on,
	afterLogout
} = useUserStore();
import {
	delCookie,
	getCookie
} from '@/utils/base.js';
export default {
	data() {
		return {
			menu_title: '首页',
			username: '',
			nowDate: '',
			timer: null,
			shop_name: '',
			fullscreen:false,
			checkVersionLoading: false
		};
	},
	created() {
		bus_on('MenuName', res => {
			this.menu_title = res;
		});
		const {
			userInfo
		} = useUserStore();
		this.username = userInfo.userName;
		this.getNow();
		this.getData();
	},
	unmounted() {
		clearInterval(this.timer);
		this.timer = null;
	},
	methods: {
		async checkVersion() {
			this.checkVersionLoading = true;
			try {
				const response = await IndexApi.getVersion(true);
				const { data = {} } = response;
				const { version = {} } = data;
				if (response.code === 1) {
					console.log('最新版本信息:', version);
					let result = await ScreenService.checkVersion(version);
					this.checkVersionLoading = false;
					console.log('是否匹配',result);
					if(result){
						ElMessageBox.confirm("检测到APP有更新，是否现在下载？", "提示", {
							confirmButtonText: "确定",
							cancelButtonText: "取消",
							type: "warning",
						}).then(async () => {
							console.log('下载地址',version.apk_url)
							await ScreenService.downloadAPK(version);
						});
					}
				} else {
					console.log('获取版本信息失败:', data.msg);
					this.checkVersionLoading = false;
				}
			} catch (error) {
				console.error('版本检查接口请求失败:', error);
				this.checkVersionLoading = false;
			}
		},
		//开启全屏
		launchFullScreen() {
			this.fullscreen = !this.fullscreen;
			let element = document.documentElement;
			if (this.fullscreen) {
				if (element.requestFullscreen) {
					element.requestFullscreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.webkitRequestFullscreen) {
					element.webkitRequestFullscreen();
				} else if (element.msRequestFullscreen) {
					element.msRequestFullscreen();
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozExitFullScreen) {
					document.mozExitFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		},
		getData() {
			let self = this;
			let Params = {};
			UserApi.getVersion(Params, true).then(res => {
				self.shop_name = res.data.user.user.name;
			})
				.catch(error => {});
		},
		getNow() {
			let self = this;
			self.timer = setInterval(function() {
				self.nowDate = self.dateStr(new Date());
			}, 1000);
		},
		//时间转换
		dateStr(date) {
			let Y = date.getFullYear();
			let M = date.getMonth() + 1 - 0 >= 10 ? Number(date.getMonth()) + 1 : '0' + (Number(date.getMonth()) + 1);
			let D = date.getDate() >= 10 ? Number(date.getDate()) : '0' + Number(date.getDate());
			let h = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
			let m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
			let s = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();
			return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
		},
		/*退出登录*/
		login_out() {
			ElMessageBox.confirm('此操作将退出登录, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					UserApi.loginOut(true)
						.then(data => {
							this.logout();
						})
						.catch(error => {});
				})
				.catch(() => {
					ElMessage({
						type: 'info',
						message: '已取消退出'
					});
				});
		},
		async logout() {
			await afterLogout();
			this.$router.push('/login');
		},
	}
};
</script>
<style lang="scss">
	.login-out .icon-tuichu {
		color: red;
	}

	.header-navbar-icon .icon-geren9 {
		font-size: 20px;
	}

	.header-navbar-icon .icon-tuichu {
		font-size: 20px;
	}
	.header-navbar-icon .menu-item-icon.icon.iconfont.icon-quanping {
		font-size: 18px;
		color:rgba(153, 162, 186, 1);
	}

	.f18 {
		font-size: 18px;
	}
</style>