<template>
	<el-drawer :show-close="false" size="40%" v-model="dialogVisible" :with-header="false" :before-close="closeFunc">
		<el-container class="h100vh cash-drawer">
			<div style="text-align: left;" class="f18 fb">支付方式</div>
			<el-header class="d-s-c border-b" style="padding-left: 0;padding-right: 0;">
				<el-radio-group v-model="type" @change="changeType" fill="#f3473d">
					<el-radio-button class="pay-type-btn" :value="3">扫码支付</el-radio-button>
					<el-radio-button class="pay-type-btn" :value="0">现金收款</el-radio-button>
				</el-radio-group>
			</el-header>
			<el-main class="p-20-0">
				<div class="f18 fb tl d-b-c">
					<div class="flex-1">
						应收金额：
						<span style="color: #f3473d;">￥{{ price }}</span>
					</div>
				</div>
				<template v-if="type == 3">
					<div class="p-20-0 tl f14">用户通过扫码付款等方式进行支付，确认用户支付成功后，点击确认付款即可完成付款操作。</div>
					<div class="d-s-c ww100 mb20">
						<div class="tl f14">仅支持以下支付方式</div>
						<div class="cash-item" style="border: none;">
							<div class="cash-icon"><img src="@/assets/img/wx.png" /></div>
							微信支付
						</div>
						<div class="cash-item" style="border: none;">
							<div class="cash-icon"><img src="@/assets/img/zfb.png" /></div>
							支付宝支付
						</div>
					</div>
				</template>
			</el-main>
			<el-footer>
				<div class="d-c-c cash-drawer-btn">
					<button class="close-btn border" @click="closeFunc(null)">取消收款</button>
					<!-- <button class="pay-btn"  @click="submit" v-if="type != 2 || (type == 2 && $store.state.user.member)">收款￥{{ price }}</button> -->
					<button class="pay-btn" @click="submit"
						v-if="type != 2 || (type == 2 && memberInfo)">收款￥{{ price }}</button>
				</div>
			</el-footer>
		</el-container>
		<div class="saoma-pop" v-if="payDialog">
			<div class="saoma-dialog pr d-c d-b-c">
				<el-icon @click="payDialog = false" class="close-pop">
					<CloseBold />
				</el-icon>
				<div class="pr ww100 f16 gray3 fb">
					付款
				</div>
				<div class="pop-price">￥<text class="f28">{{price}}</text></div>
				<img class="sImage" :src="sImage" alt="" />
				<div class="pop-tips-text">请使用扫码枪/小白盒扫描客户付款码</div>
				<el-input class="tr" style="width: 0;height: 0;overflow: hidden;" id="autoFocus2"
					v-model="form.auth_code"></el-input>
			</div>
		</div>
	</el-drawer>
</template>

<script>
	import UserApi from '@/api/user.js';
	import {
		useUserStore
	} from '@/store';
	const {
		memberInfo,
		removeMember,
		setMember
	} = useUserStore();
	import sImage from '@/assets/img/saoma.png';
	export default {
		data() {
			return {
				dialogVisible: false,
				type: 3,
				cash_type: 99,
				phone: '',
				memberInfo,
				form: {
					auth_code: '',
				},
				options: [],
				payDialog: false,
				timer: null,
				sImage,
			};
		},
		props: ['is_pop', 'price', 'extendType'],
		watch: {
			is_pop: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						this.form = {
							auth_code: '',
						};
						let {
							memberInfo
						} = useUserStore();
						this.memberInfo = memberInfo;
						this.getExtendType();
					}
					// console.log(this.$store.state.user.member);
				}
			},
			payDialog: function(n, o) {
				if (n != o) {
					if (this.timer) {
						clearInterval(this.timer);
						this.timer = null;
					}
				}
			}
		},
		destroyed() {
			window.removeEventListener('keypress');
		},
		methods: {
			eventListenerScanCode() {
				let self = this;
				let barCode = '';
				let lastTime = 0;

				function ClearBarCode() {
					barCode = '';
					lastTime = 0;
				}

				window.addEventListener('keypress', function(e) {
					console.log("监听开始");
					e = e || window.event;
					let currCode = e.keyCode || e.which || e.charCode;
					let currTime = new Date().getTime();
					if (lastTime > 0) {
						if (currTime - lastTime <= 80) { // 扫码枪有效输入间隔毫秒
							barCode += String.fromCharCode(currCode);
						} else if (currTime - lastTime > 80) { // 输入间隔大于80毫秒，认为不是扫码枪输入内容，清空
							ClearBarCode();
						}
					} else {
						// 第一次按键
						barCode = String.fromCharCode(currCode);
					}
					lastTime = currTime;

					if (currCode == 13) { // 回车
						if (self.payDialog && barCode && barCode.length >= 1) {
							console.log("扫码结果：" + barCode + '，长度：' + barCode.length);
							//这里是根据我们二维码或条码的规则校验，增加准确度
							// 支付宝
							let zfb = /^(?:2[5-9]|30)\d{14,22}$/;
							let vx = /^1[0-5]\d{16}$/;
							if (zfb.test(barCode * 1)) {
								console.log('支付宝支付');
								self.paySubmit();
							} else if (vx.test(barCode * 1)) {
								self.paySubmit();
								console.log('微信支付');
							}
							// 扫码结果，做下一步业务处理
						}
						// 回车输入后清空
						ClearBarCode();
					}
				});
			},
			getExtendType() {
				let self = this;
				UserApi.getExtendType()
					.then(res => {
						self.options = res.data.extendType;
						self.eventListenerScanCode();
					})
					.catch(error => {});
			},
			changeType(e) {
				if (e != 3) {
					this.form = {
						auth_code: '',
					};
				}
				if (e == 0) {
					this.cash_type = 40;
				} else if (e == 1) {
					this.cash_type = 50;
				} else if (e == 2) {
					this.cash_type = 10;
					if (this.memberInfo) {
						this.getDetail();
					}
				} else if (e == 3) {
					this.cash_type = 99;
				}
			},
			getDetail() {
				let self = this;
				UserApi.getmemberDetail({
						user_id: self.memberInfo.user_id
					}, true).then(res => {
						self.memberInfo = res.data.detail;
					})
					.catch(error => {});
			},
			closeFunc() {
				this.$emit('close', null);
			},
			paySubmit() {
				console.log('扫码支付');
				this.payDialog = false;
				this.$emit('close', this.cash_type, this.form);
			},
			submit() {
				let self = this;
				if (this.type == 3) {
					this.form.auth_code = '';
					this.payDialog = true;
					this.$nextTick(() => {
						self.timer = setInterval(function() {
							var input = document.getElementById('autoFocus2');
							// console.log(document.activeElement)
							if (input != document.activeElement) { //判断是否获取焦点
								input.setAttribute('readonly', 'readonly'); //设置只读模式
								input.focus();
								setTimeout(() => {
									input.removeAttribute('readonly'); //移除只读模式
								}, 20);
							}
						}, 200);

					});
					return;
				}
				this.$emit('close', this.cash_type, this.form);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.el-drawer__container .el-drawer__header {
		display: none;
	}

	.cash-drawer .el-radio-button__orig-radio:checked+.el-radio-button__inner {
		background-color: #ffa500;
		border-color: #ffa500;
		-webkit-box-shadow: -1px 0 0 0 #ffa500;
		box-shadow: -1px 0 0 0 #ffa500;
	}

	.cash-drawer {
		.close-btn {
			width: 202px;
			height: 46px;
			background: linear-gradient(0deg, #409eff, #409eff);
			border-radius: 23px;
			text-align: center;
			font-size: 16px;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #ffffff;
			border: none;
			cursor: pointer;
		}

		.close-btn:disabled {
			background: rgba($color: #409eff, $alpha: 0.6);
		}

		.pay-btn {
			width: 202px;
			height: 46px;
			background: linear-gradient(0deg, #ff8425, #ffa92e);
			border-radius: 23px;
			text-align: center;
			font-size: 16px;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #ffffff;
			border: none;
			cursor: pointer;
		}

		.pay-btn:disabled {
			background: rgba($color: #ffa92e, $alpha: 0.6);
		}
	}

	.b-s-b {
		box-sizing: border-box;
	}

	.h100vh {
		height: calc(100vh - 40px);
	}

	.cash-drawer-btn .close-btn {
		margin-right: 20px;
	}

	.cash-item {
		border: 1px solid #e9edef;
		position: relative;
		margin-right: 20px;
		width: 160px;
		height: 50px;
		border-radius: 12px;
		background-color: #fff;
		cursor: pointer;
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
	}

	.cash-item.active {
		border-color: #ffa500;
	}

	.cash-icon {
		width: 32px;
		height: 32px;
		margin-right: 4px;

		img {
			width: 32px;
			height: 32px;
		}
	}

	.cash-payinput {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid #eeeeee;
		padding: 6px 16px 6px 16px;
		margin-bottom: 11px;

		.pay-name {
			width: 64px;
			text-align: left;
			font-size: 16px;
			color: #333;
			flex-shrink: 0;
		}

		::v-deep(.el-input__wrapper),
		::v-deep(.el-input__wrapper:hover),
		::v-deep(.el-input__wrapper.is-focus),
		::v-deep(.el-select .el-input.is-focus .el-input__wrapper) {
			box-shadow: none !important;
		}


	}

	.delIcon {
		cursor: pointer;
		font-size: 18px;
		margin-left: 10px;
	}

	::v-deep .el-header {
		padding-left: 0;
	}

	.f12 {
		font-size: 12px;
	}

	#app .el-main.p-20-0 {
		padding: 20px 0;
	}

	.search-btn {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pop-box {
		width: 402px;
		height: 394px;
		background: #FFFFFF;
		border-radius: 15px;
	}

	.saoma-pop {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 2000;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.66);
	}

	.saoma-dialog {
		width: 420px;
		border-radius: 15px;
		background: #FFFFFF;
		height: 394px;
		padding: 27px 20px 31px 20px;
		box-sizing: border-box;
	}

	.sImage {
		width: 139px;
		height: 139px;
		background: #F2F2F2;
		border-radius: 50%;
	}

	.pop-price {
		font-weight: bold;
		color: #F4463B;
		font-size: 18px;

		.f28 {
			font-size: 28px;
		}
	}

	.pop-tips-text {
		font-size: 14px;
		color: #409EFF;
	}

	.close-pop {
		cursor: pointer;
		position: absolute;
		right: 18px;
		top: 15px;
		font-size: 24px;
		width: 40px;
		height: 40px;
		z-index: 1;
	}

	.f16 {
		font-size: 16px;
	}
</style>