<template>
	<el-drawer :show-close="false" size="40%" v-model="dialogVisible" :with-header="false" :before-close="closeFunc">
		<el-container class="h100vh cash-drawer">
			<div class="pb16">
				<div class="d-b-c">
					<div style="text-align: left;" class="f18 fb">会员账户</div>
					<el-button v-if="!memberInfo" type="danger" round @click="is_search = true"><span
							class="f14">查询会员</span></el-button>
					<el-button v-else type="danger" round @click="loginout"><span class="f14">退出</span></el-button>
				</div>
				<div class="d-b-c mt20" v-if="memberInfo">
					<div>会员昵称:{{ memberInfo.nickName }}</div>
					<div class="">余额总计:<span class="fb" style="color: #f3473d;">￥{{ memberInfo.balance }}</span></div>
				</div>
			</div>
			<div style="text-align: left;" class="f18 fb border-t pt16">支付方式</div>
			<el-header class="d-s-c " style="padding-left: 0;padding-right: 0;">
				<el-radio-group v-model="type" @change="changeType" fill="#f3473d">
					<el-radio-button class="pay-type-btn" :value="3">扫码支付</el-radio-button>
					<el-radio-button class="pay-type-btn" :value="0">现金收款</el-radio-button>
					<el-radio-button class="pay-type-btn" :value="2">余额收款</el-radio-button>
					<el-radio-button class="pay-type-btn" :value="1">其他方式</el-radio-button>
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
				<template v-if="type == 1">
					<div class="p-20-0 tl f14">用户通过店内扫码等方式进行支付，确认用户支付成功后，点击确认付款即可完成付款操作。</div>
					<div class="d-a-c ww100">
						<div class="cash-item" @click="cash_type = 50" :class="cash_type == 50 ? 'active' : ''">
							<div class="cash-icon"><img src="@/assets/img/wx.png" /></div>
							微信支付
						</div>
						<div class="cash-item" @click="cash_type = 60" :class="cash_type == 60 ? 'active' : ''">
							<div class="cash-icon"><img src="@/assets/img/zfb.png" /></div>
							支付宝支付
						</div>
						<div class="cash-item" @click="cash_type = 70" :class="cash_type == 70 ? 'active' : ''">
							<div class="cash-icon"><img src="@/assets/img/pos.png" /></div>
							pos刷卡
						</div>
					</div>
				</template>
				<div class="mt20">
					<div class="d-s-c mb16">
						<el-radio-group v-model="couponType" fill="#f3473d" @change="changeCouponType">
							<el-radio-button class="pay-type-btn" :value="0">三方券类型</el-radio-button>
							<el-radio-button class="pay-type-btn" :value="1" v-if="memberInfo">优惠券</el-radio-button>
						</el-radio-group>
					</div>
					<template v-if="couponType == 0 || !memberInfo">
						<div class="cash-payinput">
							<div class="pay-name">类型</div>
							<el-select class="flex-1" v-model="form.extend_id" clearable filterable placeholder="点击选择">
								<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id">
								</el-option>
							</el-select>
						</div>
						<div class="cash-payinput">
							<div class="pay-name">券码</div>
							<el-input class="tr" placeholder="输入券码" v-model="form.extend_code"></el-input>
						</div>
						<div class="cash-payinput">
							<div class="pay-name">金额</div>
							<el-input class="tr" placeholder="输入金额" v-model="form.extend_money"
								@input="checkExtend"></el-input>
						</div>
					</template>
					<div class="cash-payinput" v-else>
						<div class="pay-name">优惠券</div>
						<el-select class="flex-1" v-model="form.coupon_id" filterable clearable placeholder="点击选择"
							@change="changeCoupon">
							<el-option v-for="item in coupon_list" :key="item.user_coupon_id" :label="item.name"
								:value="item.user_coupon_id">
							</el-option>
						</el-select>
					</div>
					<div class="f14 tl d-b-c" v-if="coupon_money && coupon_money*1 >  0">
						<div class="flex-1">
							优惠金额：
							<span style="color: #f3473d;">￥{{ coupon_money }}</span>
						</div>
					</div>
				</div>
			</el-main>
			<el-footer>
				<div class="d-c-c cash-drawer-btn">
					<button class="close-btn border" @click="closeFunc(null)">取消收款</button>
					<!-- <button class="pay-btn"  @click="submit" v-if="type != 2 || (type == 2 && $store.state.user.member)">收款￥{{ price }}</button> -->
					<button class="pay-btn" @click="submit"
						v-if="type != 2 || (type == 2 && memberInfo)">收款￥{{ couponType == 1?realMoney : getPrice() }}</button>
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
				<div class="pop-price">￥<text class="f28">{{couponType == 1?realMoney : getPrice() }}</text></div>
				<img class="sImage" :src="sImage" alt="" />
				<div class="pop-tips-text">请使用扫码枪/小白盒扫描客户付款码</div>
				<el-input class="tr" style="width: 0;height: 0;overflow: hidden;" id="autoFocus2"
					v-model="form.auth_code"></el-input>
			</div>
		</div>
		<Search :is_search="is_search" @close="closeSearch"></Search>
	</el-drawer>
</template>

<script>
	import UserApi from '@/api/user.js';
	import keyboard from '@/components/keyboard/keyboard.vue';
	import {
		useUserStore
	} from '@/store';
	const {
		memberInfo,
		removeMember,
		setMember
	} = useUserStore();
	import sImage from '@/assets/img/saoma.png';
	import Search from "@/components/memberSearch/memberSearch.vue";
	import HomeApi from '../../../api/home';
	export default {
		components: {
			keyboard,
			Search

		},
		data() {
			return {
				dialogVisible: false,
				type: 3,
				cash_type: 99,
				phone: '',
				memberInfo,
				form: {
					extend_id: '',
					extend_code: '',
					extend_money: '',
					auth_code: '',
					coupon_id: ''
				},
				options: [],
				payDialog: false,
				timer: null,
				sImage,
				is_search: false,
				barCode: '',
				lastTime: '',
				couponType: 0,
				coupon_list: [],
				realMoney: '',
				elLoading: null,
				coupon_money: ''
			};
		},
		props: ['is_pop', 'price', 'extendType', 'cashModel'],
		watch: {
			is_pop: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						this.realMoney = '';
						this.form = {
							extend_id: '',
							extend_code: '',
							extend_money: '',
							auth_code: '',
							coupon_id: ''
						};
						let {
							memberInfo
						} = useUserStore();
						this.memberInfo = memberInfo;
						this.getExtendType();
						this.getOrderDetail();
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
					if (n) {
						this.eventListenerScanCode();
					} else {
						window.removeEventListener("keypress", this.keypressFunc);
					}
				}
			}
		},
		beforeUnmount() {
			console.log('销毁')
			window.removeEventListener("keypress", this.keypressFunc);
		},
		methods: {
			changeCouponType() {
				this.realMoney = '';
				this.form = {
					extend_id: '',
					extend_code: '',
					extend_money: '',
					auth_code: '',
					coupon_id: ''
				};
				this.getOrderDetail();
			},
			changeCoupon(e) {
				this.getOrderDetail();
			},
			getOrderDetail() {
				if (this.cashModel && this.cashModel.type == 'getOrderBuy') {
					this.getOrderBuy();
				}
				if (this.cashModel && this.cashModel.type == 'getTableBuy') {
					this.getTableBuy();
				}
			},
			getTableBuy() {
				let self = this;
				self.elLoading = ElLoading.service({
					lock: true,
					text: "Loading",
					background: "rgba(0, 0, 0, 0.7)",
				});
				HomeApi.getTableOrder({
						order_id: self.cashModel.order_id || 0,
						coupon_id: self.form.coupon_id || 0,
						user_id: self.memberInfo && self.memberInfo.user_id || 0
					}, true)
					.then((res) => {
						self.elLoading.close();
						self.coupon_list = res.data.detail.couponList;
						self.realMoney = res.data.detail.pay_price;
						self.coupon_money = res.data.detail.coupon_money;
					})
					.catch((error) => {
						self.elLoading.close();
					});
			},
			getOrderBuy() {
				let self = this;
				self.elLoading = ElLoading.service({
					lock: true,
					text: "Loading",
					background: "rgba(0, 0, 0, 0.7)",
				});
				HomeApi.getOrderBuy({
						delivery: self.cashModel.delivery,
						coupon_id: self.form.coupon_id || 0,
						user_id: self.memberInfo && self.memberInfo.user_id || 0
					}, true)
					.then((res) => {
						self.elLoading.close();
						self.coupon_list = res.data.orderInfo.coupon_list;
						self.realMoney = res.data.orderInfo.order_pay_price;
						self.coupon_money = res.data.orderInfo.coupon_money;
					})
					.catch((error) => {
						self.elLoading.close();
					});
			},
			checkExtend() {
				this.form.extend_money = (this.form.extend_money.match(/^\d*(\.?\d{0,2})/g)[0]) || '';
				if (isNaN(this.form.extend_money)) {
					this.form.extend_money = '';
				}
			},
			closeSearch(e) {
				console.log(e);
				let {
					memberInfo
				} = useUserStore();
				this.memberInfo = memberInfo;
				this.form.coupon_id = '';
				this.getOrderDetail();
				this.is_search = false;
			},
			keypressFunc(e) {
				let self = this;

				function ClearBarCode() {
					self.barCode = "";
					self.lastTime = 0;
				}
				e = e || window.event;
				let currCode = e.keyCode || e.which || e.charCode;
				let currTime = new Date().getTime();
				if (this.lastTime > 0) {
					if (currTime - this.lastTime <= 80) {
						// 扫码枪有效输入间隔毫秒
						this.barCode += String.fromCharCode(currCode);
					} else if (currTime - this.lastTime > 80) {
						// 输入间隔大于80毫秒，认为不是扫码枪输入内容，清空
						ClearBarCode();
					}
				} else {
					// 第一次按键
					this.barCode = String.fromCharCode(currCode);
				}
				this.lastTime = currTime;

				if (currCode == 13) {
					// 回车
					if (self.barCode && self.barCode.length >= 1) {
						// 扫码结果，做下一步业务处理
						console.log("扫码结果：" + self.barCode + "，长度：" + self.barCode.length);
						let zfb = /^(?:2[5-9]|30)\d{14,22}$/;
						let vx = /^1[0-5]\d{16}$/;
						if (zfb.test(self.barCode * 1)) {
							console.log('支付宝支付');
							self.paySubmit();
						} else if (vx.test(self.barCode * 1)) {
							self.paySubmit();
							console.log('微信支付');
						}
					}
					// 回车输入后清空
					ClearBarCode();
				}
			},
			eventListenerScanCode() {
				let self = this;
				this.barCode = "";
				this.lastTime = 0;
				console.log("监听开始");
				window.addEventListener("keypress", self.keypressFunc);
			},
			getPrice() {
				let inprice = this.form.extend_money * 1 || 0;
				let product_price = this.price * 1;
				let real = '';
				if (inprice > product_price) {
					real = 0;
				} else {
					real = product_price - inprice;
				}
				return real.toFixed(2);
			},
			getExtendType() {
				let self = this;
				UserApi.getExtendType()
					.then(res => {
						self.options = res.data.extendType;
					})
					.catch(error => {});
			},
			loginout() {
				this.memberInfo = null;
				removeMember();
				// this.$store.commit('user/setmember', null);
			},
			addNum(n) {
				this.phone += n;
			},
			submitFunc(n) {
				let self = this;
				if (n == 'clear') {
					this.phone = '';
				} else {
					if (this.phone == '') {
						ElMessage.error('请输入会员手机号');
						return;
					}
					UserApi.getmember({
								mobile: self.phone
							},
							true
						)
						.then(res => {
							self.phone = '';
							if (res.data.list.length > 0) {
								// self.$store.commit('user/setmember', res.data.list[0]);
								this.memberInfo = res.data.list[0];
								setMember(res.data.list[0]);
							} else {
								ElMessage.error('该用户不存在');
							}
						})
						.catch(error => {});
				}
			},
			changeType(e) {
				this.couponType = 0;
				this.form.coupon_id = '';
				if (e != 3) {
					this.form = {
						extend_id: '',
						extend_code: '',
						extend_money: '',
						coupon_id: '',
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
				// if (this.type == 3 && !this.form.auth_code) {
				// 	console.log('收款码为空');
				// 	return;
				// }
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
		padding: 27px 0 31px 0;
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