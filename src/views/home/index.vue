<template>
	<div class="home-container">
		<el-container class="ww100 hh100">
			<!-- 分类-->
			<el-aside class="aside-category">
				<ul class="category-list">
					<li class="item" @click="categoryFunc(0)" :class="category_id == 0 ? 'active' : ''">
						全部
					</li>
					<template v-for="(item, index) in categoryList" :key="index">
						<li v-if="item.product_num > 0" class="item"
							:class="category_id == item.category_id ? 'active' : ''"
							@click="categoryFunc(item.category_id)">
							{{ item.name }}
						</li>
					</template>
				</ul>
			</el-aside>
			<el-container class="hh100">
				<!-- 顶部操作栏-->
				<el-header class="border-b">
					<div class="d-e-c ww100 hh100">
						<el-button class="mr20 ml0" type="danger" round @click="is_search = true"><span
								class="f14">查询会员</span></el-button>
						<el-button class="mr20 ml0" type="warning" round @click="openDouyinVerify"><span
								class="f14">抖音核销</span></el-button>
						<el-button class="mr20 ml0" type="info" @click="changeProduct()" round><span
								class="f14">商品改价</span></el-button>
						<el-button class="mr20 ml0" type="info" @click="changeWeigh()" round><span
								class="f14">商品称重</span></el-button>
						<el-button class="mr20 ml0" type="info" @click="deleteProduct()" round><span
								class="f14">商品删行</span></el-button>
						<el-button class="mr20 ml0" type="info" @click="clearCart()" round><span
								class="f14">整单取消</span></el-button>
						<el-badge class="mr20 ml0 item" :value="stayNum" :hidden="stayNum <= 0">
							<el-button type="info" @click="openStaylist()" round><span class="f14">取单</span></el-button>
						</el-badge>
						<el-button class="mr20 ml0" type="info" @click="stayCart()" round><span
								class="f14">挂单</span></el-button>
						<el-button class="mr20 ml0" type="info" @click="changeMoney()" round><span
								class="f14">折扣/抹零</span></el-button>
					</div>
				</el-header>
				<el-main class="o-h">
					<el-row class="hh100">
						<el-col :span="12" class="scroll-box hh100">
							<div class="mb16">
								<el-input 
									ref="productSearchInput"
									style="user-select: none;"
									placeholder="扫码或输入商品名称/拼音搜索" 
									v-model="product_name" 
									class="input-with-select"
									inputmode="none"
									clearable
									@click.stop.prevent="handleSingleClick"
									@dblclick.stop.prevent="handleDoubleClick"
									@touchend.stop="handleTouchEnd"
									@focus="handleInputFocus"
									@blur="handleInputBlur"
									@input="handleInput"
									@clear="handleClear"
								>
									<template #append>
										<el-button class="search-btn d-c-c" icon="Search"
											@click="searchPro"></el-button>
									</template>
								</el-input>
							</div>
							<div class="scroll-list flex-1">
								<div class="product-list ww100" v-if="listData.length > 0" v-infinite-scroll="scrolltolowerFunc"
									:infinite-scroll-disabled="disableds()" :infinite-scroll-distance="50">
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
											<span class="product-price original-price" v-if="item.line_price && item.line_price > item.product_price">￥{{ item.line_price }}</span>
											<el-icon class="icon-add">
												<CirclePlus />
											</el-icon>
										</div>
									</div>
								</div>
							</div>
						</el-col>
						<el-col :span="12" class="pl250 b-s-b">
							<el-form size="small" ref="form" :model="model" label-width="" class="tr">
								<el-form-item label="">收银员： {{ username }}</el-form-item>
								<el-form-item label="">
									消费方式：
									<el-radio-group v-model="model.delivery" @change="getCart()">
										<el-radio :value="40">店内就餐</el-radio>
										<el-radio :value="30">打包带走</el-radio>
									</el-radio-group>
								</el-form-item>
								<el-form-item label="">
									<el-table ref="orderTable" class="order-table" highlight-current-row
										@current-change="handleCurrentChange" v-loading="cartloading" :data="tableData"
										:show-header="false">
										<el-table-column type="index" align="center"></el-table-column>
										<el-table-column prop="product_name" label="商品名称">
											<template #default="scope">
												<div class="">{{ scope.row.product.product_name }}</div>
												<div class="gray9 f12" v-if="scope.row.is_group != 20">
													{{ scope.row.describe }}
												</div>
												<div class="gray9 f12" v-if="scope.row.is_group == 20"
													v-for="(item, index) in scope.row.describe" :key="index">
													x{{ item.product_num }} {{ item.product_name }}{{ item.describe }}
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
												<el-input-number @change="cartAdd($event, scope.row)" size="small"
													v-model="scope.row.product_num" :min="1" label=""></el-input-number>
											</template>
										</el-table-column>
									</el-table>
								</el-form-item>
								<el-form-item label="" class="tr">
									<el-input v-model="remark" class="ww100 mb20" :rows="2" type="textarea"
										resize="none" placeholder="整单备注:请输入订单备注" />
									<div>应收：￥{{ cartInfo.total_price || "0.00" }}元</div>
									<div class="d-e-c ww100">
										<div class="mr20" v-if="model.delivery == 30">
											包装费：￥{{ cartInfo.total_bag_price }}元
										</div>
										<div class="price-color">
											优惠：￥{{ cartInfo.discount_money || "0.00" }}元
										</div>
									</div>
									<div>
										数量{{ cartInfo.cart_total_num }}件,实收：
										<span class="price-color f24 fb">￥</span>
										<span class="price-color f28 fb">{{ cartInfo.total_pay_price }}</span>
										元
									</div>
								</el-form-item>
								<el-form-item label="" class="">
									<div class="d-a-c ww100">
										<button class="close-btn" type="button" @click="clearCart()"
											:disabled="tableData.length <= 0">
											整单取消
										</button>
										<button class="pay-btn" type="button" @click="openCash()"
											:disabled="tableData.length <= 0">
											收款￥{{ cartInfo.total_pay_price }}
										</button>
									</div>
								</el-form-item>
							</el-form>
						</el-col>
					</el-row>
				</el-main>
			</el-container>
		</el-container>
		<memberSearch :is_search="is_search" @close="closeSearch" @delCart="delCartInfo"></memberSearch>
		<Money :is_money="is_money" :cartInfo="cartInfo" @close="closeMoney"></Money>
		<Change :isChange="isChange" :promodel="promodel" @close="closeChange"></Change>
		<changeWeight :isChange="isChangeweight" :promodel="promodel" @close="closeChangeWeight"></changeWeight>
		<goodsDetail v-if="isGoodsDetail" :productModel="GoodsModel" @close="closeGoodDetailModal"></goodsDetail>
		<Spec :is_pop="is_spec" :detail="detail" @close="closeSpec"></Spec>
		<Cash :is_pop="is_cash" :price="cartInfo.total_pay_price" @close="closeCash" :cashModel="cashModel"></Cash>
		<Staylist :isStaylist="isStaylist" @close="closeStaylist"></Staylist>
		<DouyinScan :isShow="isDouyinScan" :shopSupplierId="userInfo.shop_supplier_id" @close="closeDouyinScan"></DouyinScan>
	</div>
</template>

<script>
import UserApi from "@/api/user.js";
import HomeApi from "@/api/home.js";
import OrderApi from "@/api/order.js";
import memberSearch from "@/components/memberSearch/memberSearch.vue";
import Money from "./part/money.vue";
import Change from "./part/change.vue";
import ChangeWeight from "./part/changeWeight.vue";
import Spec from "./part/spec.vue";
import Cash from "./part/cash.vue";
import Staylist from "./part/staylist.vue";
import goodsDetail from "./part/goodsDetail.vue";
import DouyinScan from "@/components/douyinScan/douyinScan.vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { useUserStore } from "@/store";
import { ScreenService } from '@/utils/screen';

const { removeMember } = useUserStore();

export default {
	components: {
		memberSearch,
		Money,
		Spec,
		Cash,
		Change,
		ChangeWeight,
		Staylist,
		goodsDetail,
		DouyinScan,
	},
	data() {
		return {
			promodel: null,
			isStaylist: false,
			isRemark: false,
			isChange: false,
			isChangeweight: false,
			is_money: false,
			is_search: false,
			is_spec: false,
			is_cash: false,
			isGoodsDetail: false,
			isDouyinScan: false,
			GoodsModel: null,
			detail: null,
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
			product_name: "",
			tableData: [],
			model: {
				delivery: 40,
			},
			pay_model: {},
			categoryList: [],
			cartInfo: {
				cart_total_num: 0,
				discount_money: "",
				line_money: 0,
				total_bag_price: 0,
				total_pay_price: 0,
				total_price: 0,
			},
			productList: [],
			stayNum: 0,
			awaitTime: 0,
			timeout: false,
			elLoading: null,
			remark: "",
			productRequestId: 0,
			cashModel: {
				type: 'getOrderBuy',
				delivery: 0
			},
			// 单击双击相关
			clickTimer: null,
			lastTouchTime: 0,
			touchHandled: false,
			CLICK_DELAY: 250,
			DOUBLE_TAP_DELAY: 300,
			// 扫码监听
			scanListener: null,
			isInputFocused: false,
			// 搜索防抖
			searchTimer: null,
			searchDelay: 500,
			clearSearchOnFetch: false,
		};
	},
	computed: {
		userInfo() {
			const { userInfo } = useUserStore();
			return userInfo || {};
		}
	},
	created() {
		this.getCategory();
		this.getCart();
	},
	async mounted() {
		const { userInfo } = useUserStore();
		this.username = userInfo ? userInfo.userName : "";

		// 监听 vuex 会员信息变化
		this.$watch(
			() => useUserStore().memberInfo,
			(newVal, oldVal) => {
				console.log('memberInfo变化了', newVal)
				if(newVal && newVal.grade_id && newVal.grade_id != 0) {
					console.log("会员等级：", newVal.grade_id)
					this.calculatePrice()
				}
			},
			{ deep: true }
		)

		// 注册扫码监听
		await this.registerProductScanListener();
	},
	async beforeUnmount() {
		this.clearClickTimer();
		
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
		}
		
		await this.removeScanListener();
	},
	methods: {
		// ========== 会员价格计算 ==========
		calculatePrice() {
			console.log('计算方法');
			console.log(this.listData);
			console.log(this.tableData);
			this.curPage = 1;
			this.listData = [];
			this.no_more = false;
			this.getProduct();
		},

		/**
		 * 退出会员时清除购物车
		 */
		delCartInfo(e) {
			console.log("触发清空购物车事件")
			let self = this;
			self.calculatePrice();
			if (self.tableData.length <= 0) {
				return;
			}
			let Params = {};
			HomeApi.delStay(Params, true).then((res) => {
				self.getCart();
				ElMessage({
					message: res.msg,
					type: "success",
				});
			});
		},

		// ========== 输入框焦点管理 ==========
		handleInputFocus() {
			console.log('📝 输入框获得焦点 - 暂停扫码监听');
			this.isInputFocused = true;
		},
		
		handleInputBlur() {
			console.log('📱 输入框失去焦点 - 恢复扫码监听');
			this.isInputFocused = false;
		},
		
		// ========== 实时搜索 ==========
		handleInput(value) {
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
			
			const trimmedValue = value.trim();
			
			if (!trimmedValue) {
				this.category_id = 0;
				this.curPage = 1;
				this.listData = [];
				this.no_more = false;
				this.getProduct();
				return;
			}
			
			const isBarcode = /^(\d{8}|\d{13}|\d{14})$/.test(trimmedValue);
			
			if (isBarcode) {
				console.log('📦 条码搜索（立即）:', trimmedValue);
				this.searchPro();
			} else {
				console.log('⏳ 拼音搜索（防抖）:', trimmedValue);
				this.searchTimer = setTimeout(() => {
					this.searchPro();
				}, this.searchDelay);
			}
		},
		
		handleClear() {
			console.log('🗑️ 清除搜索框');
			this.product_name = '';
			this.category_id = 0;
			this.curPage = 1;
			this.listData = [];
			this.no_more = false;
			this.getProduct();
		},
		
		// ========== 扫码监听相关 ==========
		async registerProductScanListener() {
			try {
				const available = await ScreenService.checkScannerAvailable();
				if (!available) {
					console.warn('扫码功能不可用');
					return;
				}
				
				this.scanListener = await ScreenService.addScanListener(
					(result) => {
						if (this.isInputFocused) {
							console.log('⏭️ 输入框聚焦中，忽略扫码:', result.code);
							return;
						}
						
						console.log('📱 收到扫码事件:', result.code, '类型:', result.type);
						
						const trimmedCode = result.code.trim();
						if (/^(\d{8}|\d{13}|\d{14})$/.test(trimmedCode)) {
							this.handleProductScan(trimmedCode);
						} else {
							console.warn('⚠️ 扫码内容不是有效条码，忽略:', trimmedCode);
						}
					},
					{ type: ScreenService.ScanType.PRODUCT }
				);
				
				console.log('✅ 商品扫码监听已注册');
			} catch (error) {
				console.error('❌ 注册商品扫码监听失败:', error);
			}
		},
		
		async removeScanListener() {
			try {
				if (this.scanListener) {
					await this.scanListener.remove();
					this.scanListener = null;
					console.log('✅ 商品扫码监听已移除');
				}
			} catch (error) {
				console.error('❌ 移除扫码监听失败:', error);
			}
		},
		
		handleProductScan(code) {
			const trimmedCode = code.trim();
			
			if (!trimmedCode) {
				return;
			}
			
			if (!/^(\d{8}|\d{13}|\d{14})$/.test(trimmedCode)) {
				console.warn('⚠️ 无效的商品条码:', trimmedCode);
				return;
			}
			
			console.log('📦 扫码搜索商品:', trimmedCode);
			
			this.product_name = trimmedCode;
			
			this.$nextTick(() => {
				this.searchPro();
			});
		},
		
		// ========== 单击双击逻辑 ==========
		clearClickTimer() {
			if (this.clickTimer) {
				clearTimeout(this.clickTimer);
				this.clickTimer = null;
			}
		},
		
		handleSingleClick() {
			if (this.touchHandled) {
				this.touchHandled = false;
				return;
			}
			this.clearClickTimer();
			this.clickTimer = setTimeout(() => {
				this.clickTimer = null;
				this.hideInputmethod();
			}, this.CLICK_DELAY);
		},
		
		handleDoubleClick() {
			if (this.touchHandled) {
				this.touchHandled = false;
				return;
			}
			this.clearClickTimer();
			this.showInputmethod();
		},
		
		handleTouchEnd(e) {
			this.touchHandled = true;
			setTimeout(() => { this.touchHandled = false }, 500);
			
			const now = Date.now();
			const gap = now - this.lastTouchTime;
			
			if (gap < this.DOUBLE_TAP_DELAY && gap > 0) {
				this.lastTouchTime = 0;
				this.clearClickTimer();
				this.showInputmethod();
			} else {
				this.lastTouchTime = now;
				this.clearClickTimer();
				this.clickTimer = setTimeout(() => {
					this.clickTimer = null;
					this.hideInputmethod();
				}, this.DOUBLE_TAP_DELAY);
			}
		},
		
		async showInputmethod() {
			console.log('双击 - 显示输入法');
			const input = this.$el.querySelector('.input-with-select input');
			if (input) {
				input.removeAttribute('inputmode');
			}
			await ScreenService.showInputMethod();
		},
		
		async hideInputmethod() {
			console.log('单击 - 隐藏输入法');
			const input = this.$el.querySelector('.input-with-select input');
			if (input) {
				input.setAttribute('inputmode', 'none');
			}
			await ScreenService.hideInputMethod();
		},
		
		async focusProductSearch() {
			this.hideInputmethod();
			this.$nextTick(() => {
				const inputRef = this.$refs.productSearchInput;
				if (inputRef && typeof inputRef.focus === "function") {
					inputRef.focus();
				}
			});
		},
		
		// ========== 原有业务方法 ==========
		openCash() {
			this.cashModel.delivery = this.model.delivery;
			this.is_cash = true;
		},

		disableds() {
			return this.loading || this.no_more;
		},

		getTableList() {
			let self = this;
			let Params = {};
			UserApi.getVersion(Params, true)
				.then((data) => {
					self.version = data.data.version;
				})
				.catch((error) => {});
		},

		getCart() {
			let self = this;
			let Params = {
				delivery: self.model.delivery,
			};

			const { memberInfo } = useUserStore();
			if(memberInfo) {
				Params.memberInfo = memberInfo
			}

			self.cartloading = true;
			HomeApi.cartList(Params, true)
				.then((res) => {
					self.cartloading = false;
					self.tableData = res.data.productList;
					self.cartInfo = res.data.cartInfo;
					self.stayNum = res.data.stayNum;
				})
				.catch((error) => {
					self.cartloading = false;
				})
				.finally(async () => {
					await self.sendSecondary();
				});
		},

		async sendSecondary() {
			let self = this;
			await ScreenService.sendToSecondary({
				tableData: self.tableData,
				cartInfo: self.cartInfo,
				model: self.model,
			});
		},

		cartAdd(e, goods) {
			let self = this;
			let product_num = e >= 1 ? e : 1;
			HomeApi.subProduct({
						product_num: product_num,
						cart_id: goods.cart_id,
						type: "mid",
					},
					true
				)
				.then((res) => {
					self.getCart();
				})
				.catch((error) => {
					self.getCart();
				});
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

		changeWeigh() {
			console.log('获取当前商品是否为计重商品',this.promodel);
			if (!this.promodel) {
				ElMessage({
					message: "请选择商品",
					type: "warning",
				});
				return;
			}
			if(this.promodel.product.is_weight!=1){
				ElMessage({
					message: "该商品不是计重商品请重新选择",
					type: "warning",
				});
				return;
			}

			console.log('进入计重');
			this.isChangeweight = true;
		},

		closeChangeWeight(e) {
			let self = this;
			console.log('进入关闭事件',e);
			if (e) {
				let Params = {
					cart_id: self.promodel.cart_id,
					net_weight: e,
				};
				HomeApi.changeWeight(Params, true).then((res) => {
					self.cart_id = 0;
					self.getCart();
					ElMessage({
						message: res.msg,
						type: "success",
					});
				});
			}
			this.isChangeweight = false;
			this.promodel = null;
		},

		deleteProduct() {
			let self = this;
			if (!self.cart_id) {
				return;
			}
			let Params = {
				cart_id: self.cart_id,
			};
			let attr = this.promodel.describe ?
				"(" + this.promodel.describe + ")" :
				"";
			let text = "确定要删除" + this.promodel.product.product_name + "吗?";
			ElMessageBox.confirm(text, "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(() => {
				self.cartloading = true;
				HomeApi.delProduct(Params, true).then((res) => {
					self.cart_id = 0;
					self.getCart();
					ElMessage({
						message: res.msg,
						type: "success",
					});
				});
			});
		},

		stayCart() {
			let self = this;
			HomeApi.stay({}, true).then((res) => {
				self.getCart();
				ElMessage({
					message: res.msg,
					type: "success",
				});
			});
		},

		remarkFunc() {
			this.isRemark = true;
		},

		openStaylist() {
			this.isStaylist = true;
		},

		clearCart() {
			let self = this;
			if (self.tableData.length <= 0) {
				return;
			}
			let Params = {};
			ElMessageBox.confirm("确定要整单取消吗?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(() => {
				self.cartloading = true;
				HomeApi.delStay(Params, true).then((res) => {
					self.getCart();
					ElMessage({
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
			this.no_more = false;
			this.getProduct();
		},

		searchPro() {
			if (this.loading) {
				return;
			}
			
			const trimmedSearch = this.product_name.trim();
			
			if (trimmedSearch) {
				if (/^(\d{8}|\d{13}|\d{14})$/.test(trimmedSearch)) {
					console.log('🔍 条码搜索:', trimmedSearch);
				} else {
					console.log('🔍 拼音/关键词搜索:', trimmedSearch);
				}
			}
			
			this.loading = true;
			this.curPage = 1;
			this.no_more = false;
			this.listData = [];
			this.getProduct();
		},

		getProduct() {
			let self = this;
			self.loading = true;
			const reqId = ++self.productRequestId;
			let Params = {
				category_id: self.category_id,
				page: self.curPage,
				list_rows: self.pageSize,
				search: self.product_name,
			};

			const { memberInfo } = useUserStore();
			if(memberInfo) {
				Params.memberInfo = memberInfo
			}
			console.log("获取商品详情的参数：",Params);

			HomeApi.getProduct(Params, true)
				.then((res) => {
					if (reqId !== self.productRequestId) return;
					self.loading = false;
					self.listData = self.listData.concat(res.data.list.data);
					self.last_page = res.data.list.last_page;
					if (res.data.list.last_page <= res.data.list.current_page) {
						self.no_more = true;
					}
				})
				.catch((error) => {
					if (reqId !== self.productRequestId) return;
					self.loading = false;
				})
				.finally(() => {
					if (self.clearSearchOnFetch) {
						self.product_name = "";
						self.clearSearchOnFetch = false;
						self.curPage = 1;
						self.no_more = false;
						self.listData = [];
						self.getProduct();
					}
				});
		},

		addProduct(item) {
			if (item.is_group == 20) {
				this.GoodsModel = item;
				this.isGoodsDetail = true;
			} else {
				this.detail = item;
				this.is_spec = true;
			}
		},

		addCart(params) {
			let self = this;
			let Params = params;
			Params.delivery = self.model.delivery;
			HomeApi.addCart(Params, true)
				.then((res) => {
					self.getCart();
				})
				.catch((error) => {});
		},

		closeGoodDetailModal(e) {
			console.log(e);
			if (e && e != null && e != "undefined") {
				this.getCart();
			}
			this.GoodsModel = null;
			this.isGoodsDetail = false;
		},

		closeSpec(e) {
			console.log(e);
			if (e && e != null && e != "undefined") {
				this.addCart(e);
			}
			this.detail = null;
			this.is_spec = false;
		},

		closeRemark(e) {
			this.isRemark = false;
		},

		closeStaylist(e) {
			let self = this;
			if (e && e != null && e != "undefined") {
				if (e == "delete") {
					self.getCart();
					return;
				}
				if (self.tableData.length > 0) {
					ElMessage.error("请先将购物车内的商品挂单或结账后再取单");
					return;
				} else {
					HomeApi.pick({
							cart_no: e,
						},
						true
					).then((res) => {
						self.getCart();
					});
				}
			}
			this.isStaylist = false;
		},

		openDouyinVerify() {
			this.isDouyinScan = true;
		},

		closeDouyinScan() {
			this.isDouyinScan = false;
		},

		payStatus(id) {
			let self = this;
			let sucback = function() {
				removeMember();
				self.elLoading.close();
				self.awaitTime = 0;
				self.timeout = false;
				self.getCart();
			};
			let errback = function() {
				setTimeout(function() {
					self.payStatus(id);
				}, 2000);
			};
			let callback = function() {
				OrderApi.paySuccess({
							order_id: id,
						},
						true
					)
					.then((res) => {
						if (res.data.detail.pay_status.value == 20) {
							sucback();
							ElMessage({
								message: "支付成功",
								type: "success",
							});
						} else {
							errback();
						}
					})
					.catch((error) => {
						errback();
					});
			};
			if (self.awaitTime >= 30) {
				sucback();
				ElMessage({
					message: "支付状态错误",
					type: "error",
				});
			} else if (self.timeout) {
				self.awaitTime++;
				callback();
			}
		},

		closeCash(e, form) {
			let self = this;
			if (e && e != null) {
				let Params = {
					pay_type: e,
					delivery: self.model.delivery,
					user_id: 0,
					remark: self.remark,
				};
				if (form) {
					Params.extend_id = form.extend_id;
					Params.extend_code = form.extend_code;
					Params.extend_money = form.extend_money;
					Params.auth_code = form.auth_code;
					Params.coupon_id = form.coupon_id;
				}
				const { memberInfo } = useUserStore();
				if (memberInfo) {
					Params.user_id = memberInfo.user_id;
				}
				self.elLoading = ElLoading.service({
					lock: true,
					text: "Loading",
					background: "rgba(0, 0, 0, 0.7)",
				});
				HomeApi.orderBuy(Params, true)
					.then((res) => {
						self.awaitTime = 0;
						self.remark = "";
						self.timeout = true;
						self.payStatus(res.data.order_id);
					})
					.catch((error) => {
						self.remark = "";
						ElMessage.error("操作失败");
						self.loading = false;
						self.elLoading.close();
					});
			}
			this.pay_model = null;
			this.is_cash = false;
		},

		scrolltolowerFunc() {
			console.log("scroll");
			let self = this;
			if (self.loading || self.curPage >= self.last_page) {
				return;
			}
			self.loading = true;
			self.curPage++;
			self.getProduct();
		},

		closeSearch(e) {
			console.log(e);
			this.is_search = false;
			this.getCart();
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
			this.promodel = null;
			this.$refs.orderTable.setCurrentRow()
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

.ml0 {
	margin-left: 0px;
}

.mr20 {
	margin-right: 20px;
}

.o-h {
	overflow: hidden;
}

.el-main.o-h {
	overflow: hidden !important;
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
	overflow: hidden;
	background-color: #ffffff;

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

	button.search-btn {
		background-color: #ffa500;
		color: #ffffff;
		font-size: 14px;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.order-table {
		overflow: auto;
		height: calc(100vh - 496px);
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
	width: 128px;
	padding-top: 53px;
	box-sizing: border-box;

	.item {
		min-height: 50px;
		line-height: 50px;
		font-size: 14px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #333333;
		padding-left: 17px;
		text-align: left;
		cursor: pointer;
		display: flex;
		justify-content: flex-start;
		align-items: center;
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

		.original-price {
			font-size: 12px;
			font-weight: normal;
			color: #ccc;
			text-decoration: line-through;
			margin-left: 5px;
		}

		.icon-add {
			color: #ffa500;
			font-size: 18px;
		}
	}
}

.order-table::-webkit-scrollbar {
	width: 5px;
	height: 1px;
}

.order-table::-webkit-scrollbar-thumb {
	border-radius: 10px;
	background-color: #909399;
}

.order-table::-webkit-scrollbar-track {
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #ededed;
	border-radius: 10px;
}

.aside-category.el-aside {
	width: 128px;
}

.aside-category::-webkit-scrollbar,
.scroll-list::-webkit-scrollbar {
	width: 8px;
	height: 1px;
}

.aside-category::-webkit-scrollbar-thumb,
.scroll-list::-webkit-scrollbar-thumb {
	border-radius: 10px;
	background-color: #909399;
}

.aside-category::-webkit-scrollbar-track,
.scroll-list::-webkit-scrollbar-track {
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #ededed;
	border-radius: 10px;
}

.el-input.is-active .el-input__inner,
.el-input__inner:focus {
	border-color: #ffa500;
}

.home-container .el-table__body tr.current-row>td.el-table__cell {
	background-color: rgba($color: #409eff, $alpha: 0.2);
}

::v-deep .el-badge {
	display: flex;
	justify-content: center;
	align-items: center;
}

::v-deep .el-badge__content.is-fixed {
	top: 7px;
	font-size: 8px;
}

.scroll-box {
	display: flex;
	flex-direction: column;
	padding-right: 20px;
}
</style>
