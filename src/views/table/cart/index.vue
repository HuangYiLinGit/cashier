<template>
	<div class="home-container bg-white" v-if="model != null">
		<el-container class="ww100 hh100">
			<!-- 分类-->
			<el-aside class="aside-category">
				<ul class="category-list">
					<li class="item" @click="categoryFunc(0)" :class="category_id == 0 ? 'active' : ''">
						全部
					</li>
					<template v-for="(item, index) in categoryList" :key="index">
						<li class="item" :class="category_id == item.category_id ? 'active' : ''"
							v-if="item.product_num > 0" @click="categoryFunc(item.category_id)">
							{{ item.name }}
						</li>
					</template>

				</ul>
			</el-aside>
			<el-container class="hh100">
				<!-- 顶部操作栏-->
				<el-header class="border-b">
					<div class="d-c-c ww100 hh100">
						<!-- 抖音核销按钮 -->
						<div class="mr20" v-if="model && model.table_id">
							<el-button type="warning" round @click="openDouyinVerify">
								抖音核销
							</el-button>
						</div>
						<div class="mr20 d-c-c">
							<div class="f14 w-nw mr10">就餐人数 </div>
							<el-select v-model="num" placeholder="请选择">
								<el-option v-for="item in 20" :key="item.value" :label="item" :value="item">
								</el-option>
							</el-select>
						</div>
						<div class="d-c-c">
							<div class="f14 w-nw mr10">收银员：</div>
							<el-select disabled v-model="username" placeholder="请选择"></el-select>
						</div>
					</div>
				</el-header>
				<el-main class="o-h">
					<el-row :gutter="50" style="margin: 0">
						<el-col :span="12">
							<div class="mb16">
								<el-input placeholder="请输入内容" v-model="product_name" class="input-with-select">
									<template #append>
										<el-button class="search-btn" icon="Search" @click="searchPro"></el-button>
									</template>
								</el-input>
							</div>
							<div class="scroll-list">
								<div class="product-list ww100" v-infinite-scroll="scrolltolowerFunc"
									:infinite-scroll-disabled="disableds()" :infinite-scroll-distance="10">
									<div class="product-item" v-for="(item, index) in listData" :key="item.product_id"
										@click="addProduct(item)">
										<div class="image-boxs">
											<img :src="item.image[0].file_path" alt="" />
											<div class="sallsell-out" v-if="item.product_stock <= 0">
												<div class="sallsell-out-btn">售罄</div>
											</div>
										</div>
										<div class="product-name text-ellipsis-2">
											{{ item.product_name }}
										</div>
										<div class="d-b-c">
											<span class="product-price">￥{{ item.product_price }}</span>
											<el-icon class="icon-add">
												<CirclePlus />
											</el-icon>
										</div>
									</div>
								</div>
							</div>
						</el-col>
						<el-col :span="12" class="pl250 b-s-b">
							<el-form class="right-form d-c d-b-s" size="small" ref="form" label-width=""
								style="text-align: left">
								<el-form-item label="" class="ww100 flex-1">
									<el-table class="order-table" highlight-current-row
										@current-change="handleCurrentChange" v-loading="cartloading" :data="tableData"
										:show-header="false">
										<el-table-column type="index" align="center"></el-table-column>
										<el-table-column prop="product_name" label="商品名称">
											<template #default="scope">
												<div class="">{{ scope.row.product.product_name }}</div>
												<div class="gray9 f12" v-if="scope.row.is_group != 20">
													{{ scope.row.describe }}
												</div>
												<div v-if="scope.row.is_group == 20" class="gray9 f12"
													v-for="(item, index) in scope.row.describe" :key="index">
													x{{ item.product_num }} {{ item.product_name
                          }}{{ item.describe }}
												</div>
											</template>
										</el-table-column>
										<el-table-column prop="price" label="商品价格">
											<template #default="scope">
												<span class="red">￥{{ scope.row.price }}</span>
											</template>
										</el-table-column>
										<el-table-column prop="total_num" label="商品数量">
											<template #default="scope">
												<el-input-number
													@change="cartAdd($event, scope.row)"
													@focus="onInputFocus"
													@blur="onInputBlur"
													size="small"
													v-model="scope.row.product_num"
													:min="0"
													label="">
												</el-input-number>
											</template>
										</el-table-column>
									</el-table>
								</el-form-item>
								<el-form-item class="ww100" label="">
									<el-input v-model="remark" class="ww100 mb20" :rows="2" type="textarea"
										resize="none" placeholder="备注:请输入订单备注" />
									<div class="tr ww100">
										数量{{ cartInfo.cart_total_num }}件,合计：<span
											class="price-color f24 fb">￥</span><span class="price-color f28 fb">{{
                      cartInfo.total_price || "0.00"
                    }}</span>元
									</div>
								</el-form-item>
								<el-form-item label="" class="ww100">
									<div class="d-a-c ww100">
										<button class="pay-btn" type="button" @click="closeCash"
											:disabled="tableData.length <= 0">
											下单
										</button>
										<button class="pay-btn" type="button" @click="closeFunc">
											返回
										</button>
									</div>
								</el-form-item>
							</el-form>
						</el-col>
					</el-row>
				</el-main>
			</el-container>
		</el-container>
		<Search :is_search="is_search" @close="closeSearch"></Search>
		<Money :is_money="is_money" :cartInfo="cartInfo" @close="closeMoney"></Money>
		<Change :isChange="isChange" :promodel="promodel" @close="closeChange"></Change>
		<Spec :is_pop="is_spec" :detail="detail" @close="closeSpec"></Spec>
		<goodsDetail v-if="isGoodsDetail" :productModel="GoodsModel" @close="closeGoodDetailModal"></goodsDetail>
		<!-- 抖音扫码组件 -->
		<DouyinScan
			:isShow="isDouyinScan"
			:shopSupplierId="userInfo ? userInfo.shop_supplier_id : 0"
			:tableId="model ? model.table_id : 0"
			:tableNo="model ? model.table_no : ''"
			:mealNum="num"
			@close="closeDouyinScan"
		/>
	</div>
</template>

<script>
	import UserApi from "@/api/user.js";
	import HomeApi from "@/api/home.js";
	import Search from '@/components/memberSearch/memberSearch.vue';
	import Money from "../../home/part/money.vue";
	import Change from "../../home/part/change.vue";
	import Spec from "../../home/part/spec.vue";
	import goodsDetail from "../../home/part/goodsDetail.vue"; //套组详情
	import DouyinScan from "@/components/douyinScan/douyinScan.vue"; //抖音扫码
	import {
		useUserStore,
		useTablePollingStore
	} from "@/store";
	export default {
		components: {
			Search,
			Money,
			Spec,
			Change,
			goodsDetail,
			DouyinScan,
		},
		data() {
			return {
				tablePollingStore: null,
				num: "",
				promodel: null,
				isChange: false,
				is_money: false,
				is_search: false,
				is_spec: false,
				is_cash: false,
				detail: null,
				isGoodsDetail: false,
				GoodsModel: null,
				loading: true,
				cartloading: true,
				category_id: 0,
				cart_id: 0,
				curPage: 1,
				pageSize: 20,
				listData: [],
				last_page: 1,
				no_more: false,
				username: "",
				version: "",
				product_name: "",
				tableData: [],
				pay_model: {},
				categoryList: [],
				cartInfo: {
					cart_total_num: 0,
					/* 优惠金额*/
					discount_money: "",
					line_money: 0,
					total_bag_price: 0,
					total_pay_price: 0,
					total_price: 0,
				},
				productList: [],
				remark: "",
				// 用户交互状态控制
				isUserEditing: false, // 用户是否正在编辑数量
				isModalOpen: false, // 是否有弹窗打开
				// 抖音核销相关
				isDouyinScan: false,
				userInfo: null,
			};
		},
		props: ["model", "type"],
		computed: {},
		watch: {
			'tablePollingStore.cartData': {
				handler(newCartData) {
					// 只在不在loading状态时更新（避免干扰用户操作）
					// 新增：检查用户是否正在编辑或有弹窗打开
					if (newCartData && !this.cartloading && !this.isUserEditing && !this.isModalOpen) {
						this.tableData = newCartData.productList || [];
						this.cartInfo = newCartData.cartInfo || this.cartInfo;
					}
				},
				deep: true
			},
			// 监听弹窗状态，自动控制轮询
			is_spec(newVal) {
				this.isModalOpen = newVal;
			},
			isGoodsDetail(newVal) {
				this.isModalOpen = newVal;
			}
		},
		created() {
			/*获取登录用户名*/
			this.num = this.model.meal_num || "";
			this.tablePollingStore = useTablePollingStore();
			/*获取数据*/
			this.getTableList();
			this.getCategory();
			this.getCart();
		},
		mounted() {
			const {
				userInfo
			} = useUserStore();
			this.username = userInfo ? userInfo.userName : "";
			this.userInfo = userInfo; // 保存用户信息供抖音核销使用
			// 启动购物车轮询
			this.startCartPolling();
		},
		beforeUnmount() {
			// 停止购物车轮询
			this.stopCartPolling();
		},
		methods: {
			startCartPolling() {
				if (this.tablePollingStore && this.model && this.model.table_id) {
					this.tablePollingStore.startCartPolling(this.model.table_id);
				}
			},
			stopCartPolling() {
				if (this.tablePollingStore && this.model && this.model.table_id) {
					this.tablePollingStore.stopCartPolling(this.model.table_id);
				}
			},
			disableds() {
				return this.loading || this.no_more;
			},
			/*获取数据*/
			getTableList() {
				let self = this;
				let Params = {};
				UserApi.getVersion(Params, true)
					.then((data) => {
						// self.loading = false;
						self.version = data.data.version;
					})
					.catch((error) => {
						// self.loading = false;
					});
			},
			getCart() {
				let self = this;
				let Params = {
					table_id: self.model.table_id,
				};
				self.cartloading = true;
				HomeApi.HallCartList(Params, true)
					.then((res) => {
						self.cartloading = false;
						self.tableData = res.data.productList;
						self.cartInfo = res.data.cartInfo;
					})
					.catch((error) => {
						self.cartloading = false;
					});
			},
			/* 购物车商品添加 */
			cartAdd(e, goods) {
				let self = this;
				let product_id = goods.product_id;
				let product_num = e;
				let type = "mid";
				if (product_num <= 1) {
					type = "down";
				}
				HomeApi.subHallCart({
							product_num: product_num,
							cart_id: goods.cart_id,
							type: type,
						},
						true
					)
					.then((res) => {
						self.getCart();
					})
					.catch((error) => {});
			},
			/**
			 * 输入框获得焦点 - 标记用户开始编辑
			 */
			onInputFocus() {
				this.isUserEditing = true;
			},
			/**
			 * 输入框失去焦点 - 标记用户结束编辑
			 */
			onInputBlur() {
				// 延迟200ms，确保change事件已触发
				setTimeout(() => {
					this.isUserEditing = false;
				}, 200);
			},
			handleCurrentChange(val) {
				if (val) {
					this.cart_id = val.cart_id;
					this.promodel = val;
				}
			},
			changeMoney() {
				if (this.tableData.length <= 0) {
					return;
				}
				this.is_money = true;
			},
			changeProduct() {
				if (!this.promodel) {
					ElMessage({
						message: "请选择商品",
						type: "warning",
					});
					return;
				}
				this.isChange = true;
			},
			deleteProduct() {
				let self = this;
				if (!self.cart_id) {
					return;
				}
				let Params = {
					cart_id: self.cart_id,
				};
				ElMessageBox.confirm("确定要商品删行吗?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
				}).then(() => {
					self.cartloading = true;
					HomeApi.delProduct(Params, true).then((res) => {
						self.cart_id = 0;
						self.getCart();
						self.$message({
							message: res.msg,
							type: "success",
						});
					});
				});
			},
			getCategory() {
				let self = this;
				let Params = {};
				HomeApi.getCategory(Params, true)
					.then((res) => {
						self.categoryList = res.data.list;
						self.getProduct();
					})
					.catch((error) => {});
			},
			categoryFunc(e) {
				if (this.loading || this.category_id == e) {
					return;
				}
				this.loading = true;
				this.category_id = e;
				this.curPage = 1;
				this.listData = [];
				this.getProduct();
				this.no_more = false;
			},
			searchPro() {
				if (this.loading) {
					return;
				}
				this.loading = true;
				this.curPage = 1;
				this.listData = [];
				this.no_more = false;
				this.getProduct();
			},
			getProduct(params) {
				let self = this;
				self.loading = true;
				let Params = {
					category_id: self.category_id,
					page: self.curPage,
					list_rows: self.pageSize,
					search: self.product_name,
				};
				HomeApi.getProduct(Params, true)
					.then((res) => {
						self.loading = false;
						self.listData = self.listData.concat(res.data.list.data);
						self.last_page = res.data.list.last_page;
						if (res.data.list.last_page <= res.data.list.current_page) {
							self.no_more = true;
						}
					})
					.catch((error) => {
						self.loading = false;
					});
			},
			addProduct(item) {
				if (item.is_group == 20) {
					this.GoodsModel = item;
					this.GoodsModel.table_id = this.model.table_id;
					this.isGoodsDetail = true;
				} else {
					this.detail = item;
					this.is_spec = true;
				}
			},
			addCart(params) {
				let self = this;
				let Params = params;
				Params.table_id = self.model.table_id;
				HomeApi.addHallCart(Params, true)
					.then((res) => {
						self.getCart();
					})
					.catch((error) => {
						// self.loading = false;
					});
			},
			closeGoodDetailModal(e) {
				if (e && e != null && e != "undefined") {
					this.getCart();
				}
				this.GoodsModel = null;
				this.isGoodsDetail = false;
			},
			closeSpec(e) {
				if (e && e != null && e != "undefined") {
					this.addCart(e);
				}
				this.detail = null;
				this.is_spec = false;
			},
			closeFunc() {
				this.$emit("close", "home", null);
			},
			addMeal(e) {
				let self = this;
				if (self.loading) {
					return;
				}
				if (e && e != null) {
					let Params = {
						table_id: self.model.table_id,
						order_id: self.model.order_id,
						meal_num: self.num,
						user_id: 0,
						remark: self.remark || "",
					};
					self.loading = true;
					HomeApi.addMeal(Params, true)
						.then((res) => {
							self.remark = "";
							self.loading = false;
							self.getCart();
							ElMessage({
								message: res.msg,
								type: "success",
							});
							self.$emit("close", "home", null);
						})
						.catch((error) => {
							self.remark = "";
							self.loading = false;
							// self.loading = false;
						});
				}
			},
			closeCash(e) {
				let self = this;
				if (self.type == "addMeal") {
					self.addMeal(e);
					return;
				}
				if (!self.num > 0) {
					ElMessage.error("请选择就餐人数");
					return;
				}
				if (self.loading) {
					return;
				}
				if (e && e != null) {
					let Params = {
						table_id: self.model.table_id,
						meal_num: self.num,
						user_id: 0,
						coupon_id: 0,
						remark: self.remark || "",
					};
					self.loading = true;
					HomeApi.tableBuy(Params, true)
						.then((res) => {
							self.loading = false;
							self.getCart();
							ElMessage({
								message: res.msg,
								type: "success",
							});
							self.$emit("close", "home", null);
						})
						.catch((error) => {
							self.loading = false;
							// self.loading = false;
						});
				}
			},
			/*可滚动视图区域到底触发*/
			scrolltolowerFunc() {
				let self = this;
				if (self.loading || self.curPage >= self.last_page) {
					return;
				}
				self.loading = true;
				self.curPage++;
				self.getProduct();
			},
			closeSearch() {
				this.is_search = false;
			},
			closeMoney(e) {
				let self = this;
				if (e) {
					let Params = e;
					HomeApi.changeMoney(Params, true).then((res) => {
						self.cart_id = 0;
						self.getCart();
						ElMessage({
							message: res.msg,
							type: "success",
						});
					});
				}
				this.is_money = false;
			},
			closeChange(e) {
				let self = this;
				if (e) {
					let Params = {
						cart_id: self.promodel.cart_id,
						price: e,
					};
					HomeApi.changePrice(Params, true).then((res) => {
						self.cart_id = 0;
						self.getCart();
						ElMessage({
							message: res.msg,
							type: "success",
						});
					});
				}
				this.isChange = false;
			},
			// 打开抖音核销弹窗
			openDouyinVerify() {
				if (!this.model || !this.model.table_id) {
					this.$message.warning('请先选择桌台');
					return;
				}
				this.isDouyinScan = true;
			},
			// 关闭抖音核销弹窗
			closeDouyinScan() {
				this.isDouyinScan = false;
				// 刷新当前桌台订单数据
				if (this.model && this.model.table_id) {
					this.getCart();
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.el-input-number__decrease:hover:not(.is-disabled)~.el-input .el-input__inner:not(.is-disabled),
	.el-input-number__increase:hover:not(.is-disabled)~.el-input .el-input__inner:not(.is-disabled) {
		border-color: #ffa500;
	}

	.el-input-number--mini {
		max-width: 100%;
	}

	.f12 {
		font-size: 12px;
	}

	.mr20 {
		margin-right: 20px;
	}

	.o-h {
		overflow: hidden;
	}

	.f28 {
		font-size: 28px;
	}

	.f24 {
		font-size: 24px;
	}

	.tr {
		text-align: right;
	}

	.b-s-b {
		box-sizing: border-box;
	}

	.pl50 {
		padding-left: 50px;
	}

	.el-table .cell {
		padding-left: 0;
	}

	.home-container {
		height: calc(100vh - 87px);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		align-content: center;
		flex-direction: column;

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

		.price-color {
			color: #f4463b;
		}

		// background: url(/static/imgs/home_bg.jpg) center center no-repeat;
		button.search-btn {
			background-color: #ffa500;
			color: #ffffff;
			font-size: 14px;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		.order-table {
			overflow: auto;
			height: calc(100vh - 388px);
		}

		.order-table .el-input__inner {
			border-color: #ffa500;
		}

		.el-radio__input.is-checked .el-radio__inner {
			border-color: #ffa500;
			background: #ffa500;
		}

		.el-radio__input.is-checked+.el-radio__label {
			color: #ffa500;
		}

		.el-radio__inner:hover {
			border-color: #ffa500;
		}

		.el-input-number__decrease,
		.el-input-number__increase {
			background: #ffa500;
			color: #eeeeee;
			border-color: #ffa500;
		}
	}

	.home-container .home-title {
		padding: 20px;
		text-align: center;
		white-space: nowrap;
		text-align: center;
		font-size: 40px;
		color: #409eff;
	}

	.home-container .home-des {
		color: #888888;
	}

	.home-index {
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: horizontal;
		-webkit-box-direction: normal;
		-ms-flex-direction: row;
		flex-direction: row;
		-webkit-box-pack: justify;
		-ms-flex-pack: justify;
		justify-content: space-between;
		min-width: 1000px;
		overflow-x: auto;
	}

	.category-list {
		background-color: #ededee;
		min-height: 100%;
		width: 100%;
		padding-top: 53px;
		box-sizing: border-box;

		.item {
			height: 50px;
			line-height: 50px;
			font-size: 14px;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #333333;
			padding-left: 17px;
			text-align: left;
			cursor: pointer;
		}

		.item.active {
			color: #ffa500;
			position: relative;
		}

		.item.active::after {
			content: "";
			width: 5px;
			height: 28px;
			background: #49494e;
			position: absolute;
			top: 0;
			bottom: 0;
			margin: auto;
			left: 0;
		}
	}

	.scroll-list {
		height: calc(100vh - 243px);
		overflow-y: auto;
	}

	.home-container .product-list {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;

		.product-item {
			flex-shrink: 0;
			width: 133px;
			margin-right: 20px;
			margin-bottom: 20px;
			cursor: pointer;

			img {
				width: 133px;
				height: 112px;
				border-radius: 10px;
				margin-bottom: 8px;
			}

			/* 售罄 */
			.image-boxs {
				position: relative;

				.sallsell-out {
					position: absolute;
					left: 0;
					top: 0;
					width: 133px;
					height: 112px;
					border-radius: 10px;
					z-index: 1;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgba(0, 0, 0, 0.35);

					.sallsell-out-btn {
						width: 46px;
						height: 46px;
						background-color: rgba(0, 0, 0, 0.55);
						border-radius: 50%;
						font-size: 12px;
						color: #fff;
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}

			.product-name {
				font-size: 14px;
				font-family: Microsoft YaHei;
				font-weight: 400;
				color: #333333;
				margin-bottom: 8px;
				height: 42px;
				text-align: left;
			}

			.product-price {
				font-size: 14px;
				font-family: PingFangSC;
				font-weight: bold;
				color: #f4463b;
				line-height: 38px;
			}

			.icon-add {
				color: #ffa500;
				font-size: 18px;
			}
		}
	}

	.aside-category.el-aside {
		width: 128px;
	}

	.aside-category::-webkit-scrollbar,
	.order-table::-webkit-scrollbar {
		/*滚动条整体样式*/
		width: 5px;
		/*高宽分别对应横竖滚动条的尺寸*/
		height: 1px;
	}

	.aside-category::-webkit-scrollbar-thumb,
	.order-table::-webkit-scrollbar-thumb {
		/*滚动条里面小方块*/
		border-radius: 10px;
		background-color: #909399;
		// background-image: -webkit-linear-gradient(45deg,
		//     rgba(255, 255, 255, 0.2) 25%,
		//     transparent 25%,
		//     transparent 50%,
		//     rgba(255, 255, 255, 0.2) 50%,
		//     rgba(255, 255, 255, 0.2) 75%,
		//     transparent 75%,
		//     transparent);
	}

	.aside-category::-webkit-scrollbar-track,
	.order-table::-webkit-scrollbar-track {
		/*滚动条里面轨道*/
		box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
		background: #ededed;
		border-radius: 10px;
	}

	.scroll-list::-webkit-scrollbar {
		/*滚动条整体样式*/
		width: 8px;
		/*高宽分别对应横竖滚动条的尺寸*/
		height: 1px;
	}

	.scroll-list::-webkit-scrollbar-thumb {
		/*滚动条里面小方块*/
		border-radius: 10px;
		background-color: #909399;
		// background-image: -webkit-linear-gradient(45deg,
		//     rgba(255, 255, 255, 0.2) 25%,
		//     transparent 25%,
		//     transparent 50%,
		//     rgba(255, 255, 255, 0.2) 50%,
		//     rgba(255, 255, 255, 0.2) 75%,
		//     transparent 75%,
		//     transparent);
	}

	.scroll-list::-webkit-scrollbar-track {
		/*滚动条里面轨道*/
		box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
		background: #ededed;
		border-radius: 10px;
	}

	.el-input.is-active .el-input__inner,
	.el-input__inner:focus {
		border-color: #ffa500;
	}

	.w-nw {
		white-space: nowrap;
	}
</style>