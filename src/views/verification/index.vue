<template>
	<div class="verification">
		<div class="verfi-left flex-1 d-c d-b-c">
			<div class="verfi-tablist ww100">
				<div class="verfi-tabitem" :class="{ active: type == 0 }" @click="type = 0">
					手动核销
				</div>
				<!-- 自动核销 -->
				<div class="verfi-tabitem" :class="{ active: type == 1 }" @click="type = 1">
					自动核销
				</div>
				<!-- 自动核销 -->
				<div class="verfi-tabitem" :class="{ active: type == 2 }" @click="type = 2">
					团购核销
				</div>
			</div>
			<div class="ww100 flex-1 d-c d-c-c pb200">
				<div class="f24 gray3">订单核销</div>
				<el-input ref="extractInput" v-model.trim="order_no" placeholder="请输入订单号" class="verification-input">
					<template #append v-if="type == 0">
						<el-button v-loading="loading" type="success" @click="extractDetailFunc">确认</el-button>
					</template>
					<template #append v-if="type == 2">
						<el-button v-loading="loading" type="success" @click="groupDetailFunc">确认</el-button>
					</template>
				</el-input>
				<div class="f14 gray6">
					使用扫码枪扫码时需注意光标需要停留在输入框中
				</div>
			</div>
		</div>
		<div class="verfi-right d-c d-c-c p-0-20">
			<template class="" v-if="detail == null">
				<el-image class="no-img" :src="imgNull" />
				<div class="f18 gray9 tc">暂无订单数据~</div>
			</template>
			<template v-else>
				<!-- 手动核销 自动核销 -->
				<template v-if="type == 0 || type == 1">
					<div class="verfi-r-t1 ww100 d-s-c">
						<div class="verfi-r-title f14 gray6 fb">订单状态:</div>
						<div class="f18 green fb">{{ detail.state_text }}</div>
					</div>
					<!--添加门店-->
					<div class="verfi-r-t2">
						<div class="verfi-r-title ww100 mb16 f14">顾客信息</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12">
								用户昵称：{{ detail.user ? detail.user.nickName : "无" }}
							</div>
							<div class="flex-1 f12">
								手机号：{{ detail.user ? detail.user.mobile : "无" }}
							</div>
						</div>
					</div>
					<div class="verfi-r-t3 ww100">
						<div class="verfi-r-title ww100 mb10">订单信息</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								订单来源：{{ detail.order_source_text }}
							</div>
							<div class="flex-1 f12 l-h-24 d-s-c">
								取单号：
								<div class="f22 fb redF4">{{ detail.callNo }}</div>
							</div>
						</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								就餐方式：{{ detail.delivery_type.text }}
							</div>
							<div class="flex-1 f12 l-h-24">订单号：{{ detail.order_no }}</div>
						</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								订单金额：{{ detail.order_price }}
							</div>
							<div class="flex-1 f12 l-h-24">
								订单优惠：{{ detail.discount_money }}
							</div>
						</div>
						<div class="d-b-c pl13 ww100" v-if="detail.extend_money > 0">
							<div class="flex-1 f12 l-h-24">
								渠道券：({{ detail.extend_name }}){{ detail.extend_code }}
							</div>
							<div class="flex-1 f12 l-h-24">
								渠道优惠：{{ detail.extend_money }}
							</div>
						</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								实付金额：{{ detail.pay_price }}
							</div>
							<div class="flex-1 f12 l-h-24">
								支付方式：{{ detail.pay_type.text }}
							</div>
						</div>
					</div>
					<el-table class="ww100 flex-1" style="box-sizing: border-box" :data="detail.product"
						v-loading="detail == null">
						<el-table-column prop="product_name" label="商品名称">
							<template #default="scope">
								<div class="f14">{{ scope.row.product_name }}</div>
								<div class="f12 mt10 gray9" v-if="scope.row.is_group != 20">
									{{ scope.row.product_attr }}
								</div>
								<div class="gray9 f12" v-for="(item, index) in scope.row.group_content" :key="index">
									x{{ item.product_num }} {{ item.product_name
					    }}{{ item.describe }}
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="product_price" label="单价"></el-table-column>
						<el-table-column prop="total_num" label="数量"></el-table-column>
						<el-table-column prop="total_price" label="金额"></el-table-column>
					</el-table>
					<div class="verfi-r-b ww100">
						<div class="tr">打包费：￥{{ "0.00" }}</div>
						<div class="d-c-c" v-if="
					  detail.pay_status.value == 20 &&
					  detail.delivery_type.value != 10 &&
					  detail.order_status.value == 10 &&
					  type == 0
					">
							<button class="pay-btn" type="button" @click="extractFunc(detail.order_no)">
								确认核销
							</button>
						</div>
					</div>
				</template>
				<template v-if="type == 2">
					<div class="verfi-r-t1 ww100 d-s-c">
						<div class="verfi-r-title f14 gray6 fb">订单状态:</div>
						<div class="f18 green fb">{{ detail.state_text }}</div>
					</div>
					<div class="verfi-r-t2">
						<div class="verfi-r-title ww100 mb16 f14">顾客信息</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12">
								用户昵称：{{ detail.user ? detail.user.nickName : "无" }}
							</div>
							<div class="flex-1 f12">
								手机号：{{ detail.user ? detail.user.mobile : "无" }}
							</div>
						</div>
					</div>
					<div class="verfi-r-t3 ww100">
						<div class="verfi-r-title ww100 mb10">订单信息</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								订单金额：{{ detail.total_price }}
							</div>
						</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								有效期：{{ detail.end_time }}
							</div>
							<div class="flex-1 f12 l-h-24">
								商品状态：{{ detail.state_text }}
							</div>
						</div>
						<div class="d-b-c pl13 ww100">
							<div class="flex-1 f12 l-h-24">
								实付金额：{{ detail.pay_price }}
							</div>
							<div class="flex-1 f12 l-h-24">
								支付方式：{{ detail.pay_type.text }}
							</div>
						</div>
					</div>
					<el-table class="ww100 flex-1" style="box-sizing: border-box" :data="detail.product"
						v-loading="detail == null">
						<el-table-column prop="product_name" label="商品名称">
							<template #default="scope">
								<div class="f14">{{ scope.row.group_name }}</div>
							</template>
						</el-table-column>
						<el-table-column prop="total_num" label="数量"></el-table-column>
						<el-table-column prop="total_price" label="金额"></el-table-column>
					</el-table>
					<div class="verfi-r-b ww100">
						<div class="tr"></div>
						<div class="d-c-c" v-if="detail.is_settled == 0">
							<button class="pay-btn" type="button" @click="groupFunc(detail.order_no)">
								确认核销
							</button>
						</div>
					</div>
				</template>
			</template>
		</div>
	</div>
</template>

<script>
	import OrderApi from "@/api/order.js";
	import imgNull from "@/assets/img/order-null.png";
	export default {
		data() {
			return {
				loading: false,
				imgNull,
				type: 0,
				order_no: "",
				detail: null,
				timer: null,
			};
		},
		watch: {
			type: function(n, o) {
				let self = this;
				if (n == 1) {
					self.focusFunc();
					self.detail=null;
				} else {
					self.detail=null;
					self.$refs.extractInput.focus();
					self.outOfFocus();
				}
			},
		},
		mounted() {
			this.$refs.extractInput.focus();
			this.eventListenerScanCode();
		},
		beforeUnmount() {
			console.log("销毁");
			window.removeEventListener("keypress", this.keypressFunc);
			this.outOfFocus();
		},
		methods: {
			eventListenerScanCode() {
				let self = this;
				let barCode = "";
				let lastTime = 0;

				function ClearBarCode() {
					barCode = "";
					lastTime = 0;
				}

				window.addEventListener("keypress", function(e) {
					console.log("监听开始");
					e = e || window.event;
					let currCode = e.keyCode || e.which || e.charCode;
					let currTime = new Date().getTime();
					if (lastTime > 0) {
						if (currTime - lastTime <= 80) {
							// 扫码枪有效输入间隔毫秒
							barCode += String.fromCharCode(currCode);
						} else if (currTime - lastTime > 80) {
							// 输入间隔大于80毫秒，认为不是扫码枪输入内容，清空
							ClearBarCode();
						}
					} else {
						// 第一次按键
						barCode = String.fromCharCode(currCode);
					}
					lastTime = currTime;

					if (currCode == 13) {
						// 回车
						if (barCode && barCode.length >= 1) {
							console.log("扫码结果：" + barCode + "，长度：" + barCode.length);
							//这里是根据我们二维码或条码的规则校验，增加准确度
							// 订单号
							// let flag = /^\d{16}$/.test(e);
							if (self.type == 1 && barCode.length >= 1) {
								console.log("扫码核销");
								self.extractDetailFunc();
							}
							// 扫码结果，做下一步业务处理
						}
						// 回车输入后清空
						ClearBarCode();
					}
				});
			},
			outOfFocus() {
				clearInterval(this.timer);
				this.timer = null;
			},
			focusFunc() {
				let self = this;
				self.timer = setInterval(function() {
					if (self.$refs.extractInput) {
						self.$refs.extractInput.focus();
					} else {
						clearInterval(this.timer);
						self.timer = null;
					}
				}, 500);
			},
			groupDetailFunc() {
				let self = this;
				let order_no = self.order_no;
				if (self.order_no[0] == "G" || self.order_no[0] == "O") {
					order_no = self.order_no.substring(1);
				}
				self.loading = true;
				OrderApi.groupDetail({
							order_no: order_no
						},
						true
					)
					.then((res) => {
						self.order_no = "";
						self.detail = res.data.detail;
						self.detail.user = res.data.userInfo;
						self.loading = false;
						if (self.type == 1) {
							ElMessage({
								message: res.msg,
								type: "success",
							});
						}
					})
					.catch((error) => {
						self.order_no = "";
						self.loading = false;
					});
			},
			extractDetailFunc() {
				let self = this;
				self.loading = true;
				let order_no = self.order_no;
				if (self.order_no[0] == "G" || self.order_no[0] == "O") {
					order_no = self.order_no.substring(1);
				}
				OrderApi.extractDetail({
							order_no: order_no,
							type: self.type,
						},
						true
					)
					.then((res) => {
						self.order_no = "";
						self.detail = res.data.detail;
						self.loading = false;
						if (self.type == 1) {
							ElMessage({
								message: res.msg,
								type: "success",
							});
						}
					})
					.catch((error) => {
						self.order_no = "";
						self.loading = false;
					});
			},
			groupFunc(no) {
				let self = this;
				self.loading = true;
				OrderApi.groupReceipt({
							order_no: no,
						},
						true
					)
					.then((res) => {
						self.detail = res.data.detail;
						self.order_no = "";
						self.loading = false;
						ElMessage({
							message: res.msg,
							type: "success",
						});
					})
					.catch((error) => {
						// ElMessage.error(error.msg);
						self.order_no = "";
						self.loading = false;
					});
			},
			extractFunc(no) {
				let self = this;
				self.loading = true;
				OrderApi.extract({
							order_no: no,
						},
						true
					)
					.then((res) => {
						self.detail = res.data.detail;
						self.order_no = "";
						self.loading = false;
						ElMessage({
							message: res.msg,
							type: "success",
						});
					})
					.catch((error) => {
						// ElMessage.error(error.msg);
						self.order_no = "";
						self.loading = false;
					});
			},
			changeType(e) {
				let self = this;
				if (e != this.type) {
					this.type = e;
					this.detail = null;
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.verification {
		min-height: calc(100vh - 87px);
		background-color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.verfi-left {
		min-height: calc(100vh - 87px);

		:deep(.el-input-group--append > .el-input__wrapper) {
			border-bottom-right-radius: 0;
			border-top-right-radius: 0;
		}
	}

	.verfi-tablist {
		padding: 0 22px;
		height: 64px;
		border-bottom: 2px solid #eee;
		display: flex;
		justify-content: flex-start;
		align-items: center;

		.verfi-tabitem {
			font-size: 16px;
			color: #666;
			margin-right: 40px;
			position: relative;
			height: 64px;
			line-height: 64px;
			cursor: pointer;
		}

		.verfi-tabitem.active {
			color: #409eff;
		}

		.verfi-tabitem.active::after {
			position: absolute;
			content: "";
			width: 100%;
			height: 5px;
			background: #409eff;
			left: 0;
			right: 0;
			margin: auto;
			z-index: 1;
			bottom: 0;
		}
	}

	.verification-input {
		height: 58px;
		line-height: 58px;
		margin-top: 30px;
		margin-bottom: 20px;
		max-width: 528px;

		:deep(.el-input__wrapper) {
			border-radius: 10px;

			box-shadow: 0 0 0 1px #f2f2f2 inset;
			font-size: 18px;
			padding: 0 30px;
		}

		:deep(.el-button) {
			width: 122px !important;
			height: 58px !important;
		}

		:deep(.el-input-group__append) {
			width: 122px;
			background: linear-gradient(0deg, #5cb85c, #5cb85c);
			font-size: 20px;
			color: #ffffff;
			border-bottom-right-radius: 10px;
			border-top-right-radius: 10px;
			box-shadow: none;
		}
	}

	.verfi-right {
		min-height: calc(100vh - 87px);
		width: 560px;
		background: rgba(#e3edf7, 0.6);
	}

	.pb200 {
		padding-bottom: 200px;
	}

	.verfi-r-t1 {
		height: 64px;
		// border-bottom: 2px solid;
		// border-color: rgba(#409EFF, 0.1);
	}

	.verfi-r-t2 {
		width: 100%;
		// height: 86px;
		padding-top: 6px;
		padding-bottom: 7px;
		// border-bottom: 2px solid;
		// border-color: rgba(#409EFF, 0.1);
	}

	.verfi-r-t3 {
		padding-top: 12px;
		padding-bottom: 12px;
		// border-bottom: 2px solid;
		// border-color: rgba(#409EFF, 0.1);
	}

	.verfi-r-title {
		position: relative;
		padding: 0 15px;
	}

	.verfi-r-title::after {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		margin: auto;
		bottom: 0;
		width: 5px;
		height: 17px;
		background: #ffa500;
		z-index: 1;
	}

	.verfi-r-b {
		height: 138px;
		padding: 0 0;
		padding-top: 18px;
		border-top: 2px solid;
		border-color: rgba(#409eff, 0.1);

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
			margin-top: 30px;
		}
	}

	.l-h-24 {
		line-height: 24px;
	}

	.pl13 {
		padding-left: 13px;
	}

	.redF4 {
		color: #f4463b;
	}

	.no-img {
		width: 384px;
		height: 261px;
	}
</style>