<template>
	<div class="recharge-box d-b-s flex-1 ">
		<div class="recharge-left d-c d-b-s">
			<div class="member-contnet d-b-c ww100">
				<img class="member-avatar" :src="memberInfo.avatarUrl" alt="" />
				<div class="flex-1 member-info">
					<div class="d-b-c mb10">
						<div class="f14 gray3 fb">{{memberInfo.nickName}}</div>
						<div class="f12 gray3 fb" v-if="memberInfo.grade">{{memberInfo.grade.name}}</div>
					</div>
					<div class="f12 gray3 d-s-c">
						<div>积分<span class="info-price">{{memberInfo.points}}</span></div>
						<div>余额<span class="info-price">{{memberInfo.balance}}</span></div>
					</div>
				</div>
			</div>
			<div class="flex-1 ww100">
				<div class="member-item">会员ID:{{memberInfo.user_id}}</div>
				<div class="member-item">昵称:{{memberInfo.nickName}}</div>
				<div class="member-item" v-if="memberInfo.gender == 0">性别:女</div>
				<div class="member-item" v-if="memberInfo.gender == 1">性别:男</div>
				<div class="member-item" v-if="memberInfo.gender == 2">性别:保密</div>
				<div class="member-item">生日:{{memberInfo.birthday || ''}}</div>
				<div class="member-item">注册渠道:{{memberInfo.reg_name || ''}}</div>
				<div class="member-item">注册时间:{{memberInfo.create_time || ''}}</div>
				<div class="member-item">会员等级:{{memberInfo.grade?memberInfo.grade.name : ''}}</div>
			</div>
			<div class="ww100 d-c-c">
				<div class="border-btn" @click="loginout">切换会员</div>
			</div>
		</div>
		<div class="recharge-right d-b-s d-c">
			<div class="ww100 flex-1 recharge-right-top">
				<div class="f12 fb gray3 mb16">选择充值金额</div>
				<div class="d-s-c f12 mb16">
					<div class="mr10">充值方式:</div>
					<el-radio-group v-model="plan_type" @change="changePlanType">
						<el-radio :value="0">充值套餐</el-radio>
						<el-radio :value="1">自定义充值</el-radio>
					</el-radio-group>
				</div>
				<div class="plan-list" v-if="plan_type == 0">
					<div class="plan-item" v-for="(item,index) in planList" key="index"
						:class="{active:item.plan_id == plan_id}" @click="selectPlan(item)">
						<div class="price">￥{{item.money}}</div>
						<div class="f14 gray6">到账￥{{item.real_money}}</div>
					</div>
				</div>
				<div class="d-s-c mb16" v-if="plan_type == 1">
					<div class="f12 mr10">充值金额:</div>
					<el-input v-model="plan_money" class="ww312" placeholder="" min="0" clearable type="number"
						@blur="changePlanMoney"></el-input>
				</div>
				<div class="f12 fb gray3">账单明细</div>
				<div class="bill-content" v-if="planModel">
					<div class="d-b-c">
						<div class="bill-name">充值金额</div>
						<div class="f14 flex-1">￥{{planModel.real_money}}</div>
					</div>
					<div class="d-b-s" v-if="planModel.couponList&&planModel.couponList!=''">
						<div class="bill-name">赠:优惠券</div>
						<div class="flex-1">
							<div v-for="(item,index) in planModel.couponList" :key="index">
								{{item.name}} <span class="coupon-num">x{{item.coupon_num}}</span>
							</div>
						</div>
					</div>
					<!-- <div class=" d-b-c">
						<div class="bill-name">赠:积分</div>
						<div class="f14 flex-1">{{planModel.money}}</div>
					</div> -->
					<div class="d-b-c" v-if="planModel.give_money">
						<div class="bill-name">赠:余额</div>
						<div class="f14 flex-1">￥{{planModel.give_money}}</div>
					</div>
					<div class="d-b-c">
						<div class="bill-name">应付金额</div>
						<div class="f14 flex-1">￥{{planModel.money}}</div>
					</div>
				</div>
			</div>
			<div class="ww100 recharge-right-bot d-e-c">
				<button class="pay-btn" @click="confirmFunc">确认</button>
			</div>
		</div>
		<Cash :is_pop="is_cash" :price="planModel?planModel.money : 0" @close="closeCash"></Cash>
	</div>
</template>

<script>
	import UserApi from '@/api/user.js';
	import Cash from './cash.vue';
	import {
		useUserStore
	} from '@/store';
	const {
		setMember,
		removeMember
	} = useUserStore();
	export default {
		components: {
			Cash,
			// Remark
		},
		data() {
			return {
				memberInfo: null,
				plan_id: 0,
				plan_type: 0,
				plan_money: 0,
				planList: [],
				planModel: null,
				is_cash: false,
				awaitTime: 0,
				timeout: false,
				elLoading: null,
			}
		},
		created() {
			let {
				memberInfo
			} = useUserStore();
			this.memberInfo = memberInfo;
			if (this.memberInfo) {
				this.getDetail();
				this.getPlan();
			}
		},
		methods: {
			closeCash(e, form) {
				let self = this;
				if (e && e != null) {
					let Params = {
						pay_type: e,
						user_id: 0,
						plan_id: self.plan_id,
						money: self.plan_money
					};
					if (form) {
						Params.auth_code = form.auth_code;
					}
					const {
						memberInfo
					} = useUserStore();
					if (memberInfo) {
						Params.user_id = memberInfo.user_id;
					}
					self.elLoading = ElLoading.service({
						lock: true,
						text: 'Loading',
						background: 'rgba(0, 0, 0, 0.7)',
					});
					UserApi.buyPlan(Params, true)
						.then(res => {
							console.log(res)
							self.awaitTime = 0;
							self.timeout = true;
							self.payStatus(res.data.order_id);
						})
						.catch(error => {
							console.log(error)
							ElMessage.error('操作失败');
							self.loading = false;
							self.elLoading.close();
						});
				}
				this.is_cash = false;
			},
			payStatus(id) {
				let self = this;
				let sucback = function() {
					self.elLoading.close();
					self.awaitTime = 0;
					self.timeout = false;
					self.getDetail();
				};
				let errback = function() {
					setTimeout(function() {
						self.payStatus(id);
					}, 2000);
				};
				let callback = function() {
					UserApi.planDetail({
							order_id: id,
						}, true)
						.then(res => {
							if (res.data.detail.pay_status.value == 20) {
								sucback();
								ElMessage({
									message: '支付成功',
									type: 'success'
								});
							} else {
								errback();
							}
						})
						.catch(error => {
							errback();
						});
				};
				if (self.awaitTime >= 30) {
					sucback();
					ElMessage({
						message: '支付状态错误',
						type: 'error'
					});
				} else if (self.timeout) {
					self.awaitTime++;
					callback();
				}

			},
			changePlanMoney(e) {
				if (this.plan_money > 0) {
					this.planModel = {
						money: this.plan_money,
						real_money: this.plan_money
					};
				} else {
					this.plan_money = 0;
					this.planModel = {
						money: 0,
						real_money: 0
					};
				}
			},
			selectPlan(e) {
				this.planModel = e;
				this.plan_id = e.plan_id;
			},
			getPlan() {
				let self = this;
				UserApi.getPlan({}, true).then(res => {
						self.planList = res.data.list;
					})
					.catch(error => {});
			},
			changePlanType(e) {

				if (e == 1) {
					this.plan_id = 0;
					this.planModel = {
						money: 0,
						real_money: 0
					};
				}
			},
			confirmFunc() {
				let self = this;
				self.is_cash = true;
			},
			getDetail() {
				let self = this;
				UserApi.getmemberDetail({
						user_id: self.memberInfo.user_id
					}, true).then(res => {
						self.memberInfo = res.data.detail;
						setMember(this.memberInfo);
					})
					.catch(error => {});
			},
			loginout() {
				this.$emit('loginout')
			},
		}
	}
</script>

<style lang="scss" scoped>
	.recharge-box {
		padding: 12px;
	}

	.recharge-left {
		background-color: #fff;
		height: calc(100vh - 171px);
		margin-right: 15px;
		width: 340px;
		padding: 12px;
		box-sizing: border-box;
	}

	.recharge-right {
		padding: 21px 16px;
		box-sizing: border-box;
		background-color: #fff;
		height: calc(100vh - 171px);
		flex: 1;

		padding-bottom: 0;

		.recharge-right-top {
			overflow-y: auto;
			padding-bottom: 21px;
		}

		.recharge-right-bot {
			height: 92px;
			border-top: 1px solid #eee;
			flex-shrink: 0;

			.pay-btn {
				display: block;
				padding: 0;
				width: 242px;
				height: 52px;
				box-sizing: border-box;
				background: linear-gradient(0deg, #ff8425, #ffa92e);
				border-radius: 26px;
				text-align: center;
				font-size: 16px;
				font-family: Microsoft YaHei;
				font-weight: 400;
				color: #ffffff;
				border: none;
				cursor: pointer;
			}
		}
	}

	.member-item {
		font-size: 12px;
		line-height: 32px;
		color: #333333;
	}

	.member-contnet {
		background: #FFF8F2;
		padding: 8px 21px 14px 10px;
		margin-bottom: 12px;


		.member-avatar {
			width: 52px;
			height: 52px;
			display: block;
			margin-right: 7px;
			border-radius: 50%;
		}

		.member-info .info-price {
			font-size: 16px;
			color: #F4463B;
			font-weight: bold;
			margin-right: 16px;
		}
	}

	.border-btn {
		width: 316px;
		height: 52px;
		border-radius: 26px;
		border: 1px solid #FFA500;
		font-family: Microsoft YaHei;
		font-weight: bold;
		font-size: 14px;
		color: #FFA500;
		line-height: 38px;
		margin-bottom: 12px;
		line-height: 52px;
		text-align: center;
		cursor: pointer;
	}

	.el-radio-group {
		--el-color-primary: #FFA500 !important;
	}

	.plan-list {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
	}

	.plan-item {
		width: 142px;
		height: 84px;
		border-radius: 10px;
		border: 1px solid #EEEEEE;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-right: 14px;
		margin-bottom: 14px;
		cursor: pointer;

		.price {
			font-size: 18px;
			line-height: 38px;
			color: #333333;
		}
	}

	.plan-item.active {
		border: 1px solid #FFA500;
		background: #FFF8F2;

		.price {
			color: #F4463B;
		}
	}

	.bill-content {
		line-height: 2;
		font-size: 12px;
		color: #333;
	}

	.bill-name {
		width: 206px;
	}

	.coupon-num {
		color: #F4463B;
	}
</style>