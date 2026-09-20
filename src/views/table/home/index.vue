<template>
	<div class="home-container table-home">
		<el-container class="ww100 hh100">
			<!-- 分类-->
			<el-aside class="table-home-leftaside">
				<ul class="category-list">
					<li class="item" :class="area_id == item.area_id ? 'active' : ''"
						v-for="(item, index) in categoryList" :key="index" @click="categoryFunc(item.area_id)">
						{{ item.area_name }}
					</li>
				</ul>
			</el-aside>
			<el-container class="hh100">
				<el-main>
					<el-container class="hh100">
						<!-- 顶部操作栏-->
						<el-header class="table-head" :height="'auto'">
							<el-button class="mr20" @click="changeType(item.type_id)"
								:type="item.type_id == type_id ? 'danger' : 'info'" round
								v-for="(item, index) in typeList" :key="index">
								{{ item.type_name }}({{ item.num }})
							</el-button>
						</el-header>
						<el-main class="table-box">
							<div class="table-list">
								<div v-for="(item, index) in tableList" :key="item.table_id" class="table-item"
									:class="table_id == item.table_id ? 'active' : ''" @click="pickTable(item)">
									<div class="table-item-top" :class="'status' + item.status">
										{{ item.table_no }}
									</div>
									<div class="table-item-top1" v-if="item.isReservation == 1">
										预
									</div>
									<div class="f14 gray3 mt20" v-if="item.status == 10">
										未开台
									</div>
									<div class="f14 gray3 mt20" v-if="item.status == 20">
										已开台
									</div>
									<div class="f14 gray3 mt20" v-if="item.status == 30">
										就餐中
									</div>
									<div class="f12 gray6 mt16" v-if="item.status == 30">
										{{ item.use_time }}
									</div>
									<!-- <div class="f12 gray9 mt16">2人</div> -->
									<img @click.stop="clearTable(item)" class="close-icon"
										src="../../../assets/img/tab-close.png" v-if="item.status == 30" />
								</div>
							</div>
						</el-main>
						<el-footer height="auto">
							<div>
								<div class="d-s-c mb10 f14">
									<span>状态：</span>
									<div class="d-c-c mr20">
										<div class="color-box status10"></div>
										未开台
									</div>
									<div class="d-c-c mr20">
										<div class="color-box status20"></div>
										已开台
									</div>
									<div class="d-c-c mr20">
										<div class="color-box status30"></div>
										就餐中
									</div>
									<el-button type="warning" size="small" round @click="refreshFunc()"><span
											class="f14">刷新</span></el-button>
								</div>
								<div class="d-s-c border-t bottom-nav f14"
									v-if="model.table_id != 0 && model.product_num > 0">
									<div class="c-p d-c-c d-c mr25" @click.stop="clearTable(null)">
										<span class="icon iconfont icon-qingkong table-itemicon mb5"></span>
										<div>整单清空</div>
									</div>
									<div class="c-p d-c-c d-c mr25" @click="changeMoney()">
										<span class="icon iconfont icon-zhekou-shi table-itemicon mb5"></span>
										<div>折扣/抹零</div>
									</div>
									<div class="c-p d-c-c d-c mr25" @click="changeTable">
										<span class="icon iconfont icon-view table-itemicon mb5"></span>
										<div>转台</div>
									</div>
									<div class="c-p d-c-c d-c mr25" @click="printFunc">
										<span class="icon iconfont icon-dingdan table-itemicon mb5"></span>
										<div>打印预结单</div>
									</div>
								</div>
							</div>
						</el-footer>
					</el-container>
				</el-main>
				<el-aside width="40%" class="aside-right">
					<div class="table-info">
						<el-form size="small" ref="form" :model="model" label-width="" style="text-align: left">
							<el-form-item label="" class="mb0">
								<div v-if="model.table_id != 0" class="table-info-top">
									<div class="d-b-c">
										<div>
											桌台：
											<span class="f24">{{ model.table_no }}</span>
										</div>
										<div v-if="model.meal_num">
											人数：{{ model.meal_num }}人
										</div>
									</div>
									<div v-if="model.order_source">
										订单来源：{{ model.order_source_text }}
									</div>
								</div>
								<div class="table-info-top" v-else>请点击左侧桌号台</div>
							</el-form-item>
							<template v-if="model.table_id == 0 || model.product_num <= 0">
								<el-form-item label="">
									<div class="p20 fb f14">
										点选已开台桌台，可以在此查看点餐信息。
									</div>
								</el-form-item>
							</template>
							<template v-if="model.table_id != 0 && model.product_num > 0">
								<el-form-item label="">
									<el-table class="order-table" highlight-current-row :data="model.product">
										<el-table-column type="index" align="center"></el-table-column>
										<el-table-column prop="product_name" label="商品名称">
											<template #default="scope">
												<div class="">{{ scope.row.product_name }}</div>
												<div class="gray9 f12" v-if="scope.row.is_group != 20">
													{{ scope.row.product_attr }}
												</div>
												<div v-if="scope.row.is_group == 20" class="gray9 f12"
													v-for="(item, index) in scope.row.group_content" :key="index">
													x{{ item.product_num }} {{ item.product_name
                          }}{{ item.describe }}
												</div>
											</template>
										</el-table-column>
										<el-table-column prop="total_num" label="数量"></el-table-column>
										<el-table-column prop="product_price" label="价格">
											<template #default="scope">
												<span class="red">￥{{ scope.row.product_price }}</span>
											</template>
										</el-table-column>
										<el-table-column prop="" label="操作">
											<template #default="scope">
												<el-button type="primary" link v-if="
                            model.pay_status.value == 10 &&
                            (model.product.length > 1 ||
                              scope.row.total_num > 1)
                          " @click="returnProduct(scope.row)">退菜</el-button>
											</template>
										</el-table-column>
									</el-table>
								</el-form-item>
								<el-form-item label="" class="tr p20" v-if="model.product.length > 0">
									<div>应收：￥{{ model.total_price }}元</div>
									<div class="d-e-c ww100">
										<div class="mr20" v-if="model.service_money > 0">
											服务费：￥{{ model.service_money }}元
										</div>
										<div class="price-color">
											优惠：￥{{ model.discount_money }}元
										</div>
									</div>
									<div>
										数量{{ model.product_num }}件,实收：
										<span class="price-color f24 fb">￥</span>
										<span class="price-color f28 fb">{{
                      model.pay_price
                    }}</span>
										元
									</div>
								</el-form-item>
							</template>
							<template v-if="
                  model.table_id != 0 &&
                  model.product &&
                  model.product.length >= 0
                ">
								<div class="d-a-c ww100">
									<template v-if="
                      model.product.length >= 0 &&
                      (!model.pay_status || model.pay_status.value != 20)
                    ">
										<button v-if="model.product.length <= 0" class="pay-btn" type="button"
											@click="toCart('tableBuy')">
											协助点餐
										</button>
										<button v-if="model.product.length > 0" class="pay-btn" type="button"
											@click="toCart('addMeal')">
											协助加餐
										</button>
									</template>
									<template v-if="model.product.length > 0">
										<button v-if="model.pay_status.value != 20" class="pay-btn" type="button"
											@click="openCash">
											结账
										</button>
										<button v-if="model.pay_status.value == 20" class="pay-btn" type="button"
											@click="settleFunc">
											完成
										</button>
									</template>
								</div>
							</template>
						</el-form>
					</div>
				</el-aside>
			</el-container>
		</el-container>
		<el-dialog title="转台" v-model="isTurntable" width="30%">
			<div class="mb16">
				<el-select v-model="areaIndex" placeholder="请选择">
					<el-option v-for="(item, index) in tableArr" :key="item.area_id" :label="item.area_name"
						:value="index"></el-option>
				</el-select>
			</div>
			<div class="mb16">
				<el-select v-model="typeIndex" placeholder="请选择">
					<template v-if="areaIndex != null && tableArr[areaIndex]">
						<el-option v-for="(item, index) in tableArr[areaIndex].typeList" :key="item.type_id"
							:label="item.type_name" :value="index"></el-option>
					</template>
				</el-select>
			</div>
			<div class="mb16">
				<el-select v-model="tableArr_id" placeholder="请选择">
					<template v-if="
              areaIndex != null &&
              typeIndex != null &&
              tableArr[areaIndex] &&
              tableArr[areaIndex].typeList
            ">
						<el-option v-for="(item, index) in tableArr[areaIndex].typeList[typeIndex]
                .tableList" :key="item.table_id" :label="item.table_no" :value="item.table_id"></el-option>
					</template>
				</el-select>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="closeTableFunc(null)">取 消</el-button>
					<el-button type="primary" @click="closeTableFunc">确 定</el-button>
				</span>
			</template>
		</el-dialog>
		<Cash :is_pop="is_cash" :price="model.pay_price || 0" @close="closeCash" :cashModel="cashModel"></Cash>
		<Money :is_money="is_money" :cartInfo="model" @close="closeMoney"></Money>
	</div>
</template>

<script>
	import {
		getCookie
	} from "@/utils/base.js";
	import TableApi from "@/api/table.js";
	import OrderApi from "@/api/order.js";
	import Cash from "../../home/part/cash.vue";
	import Money from "../part/money.vue";
	import {
		useUserStore,
		useTablePollingStore
	} from "@/store";
	const {
		removeMember
	} = useUserStore();
	// const { memberInfo } = useUserStore();
	export default {
		components: {
			Cash,
			Money,
		},
		data() {
			return {
				tablePollingStore: null,
				areaIndex: null,
				typeIndex: null,
				tableArr_id: "",
				cartInfo: {},
				tableArr: [],
				isTurntable: false,
				is_money: false,
				is_cash: false,
				detail: null,
				loading: true,
				cartloading: true,
				area_id: 0,
				type_id: 0,
				curPage: 1,
				pageSize: 20,
				listData: [],
				last_page: 1,
				table_id: 0,
				no_more: true,
				tableData: [],
				tableList: [],
				model: {
					table_id: 0,
					product_num: 0,
					product: [],
				},
				typeList: [],
				categoryList: [],
				awaitTime: 0,
				timeout: false,
				elLoading: null,
				cashModel: {
					type: 'getTableBuy',
					order_id: 0
				},
				// 用户交互状态控制
				isModalOpen: false, // 是否有弹窗打开
			};
		},
		computed: {},
		watch: {
			'tablePollingStore.tableList': {
				handler(newList) {
					if (newList && newList.length > 0) {
						// 检查当前选中的桌台状态是否变化
						if (this.table_id) {
							const currentTable = newList.find(t => t.table_id === this.table_id);
							const oldTable = this.tableList.find(t => t.table_id === this.table_id);

							if (oldTable && currentTable && oldTable.status !== currentTable.status) {
								// 如果桌台状态从就餐中变为其他状态，清空右侧详情
								if (oldTable.status === 30 && currentTable.status !== 30) {
									this.table_id = 0;
									this.model = {
										table_id: 0,
										product_num: 0,
										product: [],
									};
									// 停止详情轮询
									if (this.tablePollingStore) {
										this.tablePollingStore.stopTableDetailPolling(oldTable.table_id);
									}
								}
								// 如果桌台状态从未开台/已开台变为就餐中，重新获取详情并启动轮询
								else if (oldTable.status < 30 && currentTable.status === 30) {
									// 先停止可能存在的旧轮询
									if (this.tablePollingStore) {
										this.tablePollingStore.stopTableDetailPolling(currentTable.table_id);
									}
									// 立即获取详情，传入明确的 table_id
									this.loading = true;
									this.getHallCart(currentTable.table_id);
									// 延迟启动详情轮询，确保第一次获取完成
									setTimeout(() => {
										if (this.tablePollingStore && this.table_id === currentTable.table_id) {
											this.tablePollingStore.startTableDetailPolling(currentTable.table_id);
										}
									}, 500);
								}
								// 如果桌台一直是就餐中状态，确保详情轮询在运行
								else if (currentTable.status === 30) {
									// 检查是否已经有详情轮询在运行
									const detailPollingKey = `table_detail_${currentTable.table_id}`;
									const pollingStatus = this.tablePollingStore?.getPollingStatus();
									if (!pollingStatus || !pollingStatus[detailPollingKey] || !pollingStatus[detailPollingKey].active) {
										if (this.tablePollingStore) {
											this.tablePollingStore.startTableDetailPolling(currentTable.table_id);
										}
									}
								}
								// 如果桌台状态从未开台变为已开台，更新显示
								else if (oldTable.status === 10 && currentTable.status === 20) {
									this.model = {
										...currentTable,
										product_num: 0,
										product: [],
									};
								}
							}
						}

						this.tableList = newList;
					}
				},
				deep: true
			},
			'tablePollingStore.typeList': {
				handler(newList) {
					if (newList && newList.length > 0) {
						this.typeList = newList;
					}
				},
				deep: true
			},
			'tablePollingStore.currentTableDetail': {
				handler(newDetail) {
					// 只在选中的桌台匹配时更新
					// loading 状态不应该阻止轮询数据更新，只有弹窗打开时才暂停
					if (newDetail && newDetail.table_id === this.table_id && !this.isModalOpen) {
						// 如果正在 loading，说明是手动操作触发的获取，等待手动获取完成
						// 但如果 loading 已经结束，则应用轮询数据
						if (!this.loading) {
							// 保留用户的滚动位置和交互状态
							const scrollTop = this.$refs.orderTable?.$el?.querySelector('.el-table__body-wrapper')?.scrollTop || 0;

							this.model = newDetail;

							// 恢复滚动位置
							this.$nextTick(() => {
								const wrapper = this.$refs.orderTable?.$el?.querySelector('.el-table__body-wrapper');
								if (wrapper) {
									wrapper.scrollTop = scrollTop;
								}
							});
						}
					} else if (this.isModalOpen) {
					}
				},
				deep: true
			},
			// 监听弹窗状态
			is_cash(newVal) {
				this.isModalOpen = newVal;
			},
			is_money(newVal) {
				this.isModalOpen = newVal;
			},
			isTurntable(newVal) {
				this.isModalOpen = newVal;
			}
		},
		created() {
			/*获取登录用户名*/
			this.username = getCookie("userinfo_cashier");
			this.tablePollingStore = useTablePollingStore();
			this.getCategory();
		},
		mounted() {
			this.startPolling();
		},
		beforeUnmount() {
			this.stopPolling();
		},
		methods: {
			startPolling() {
				if (this.tablePollingStore) {
					this.tablePollingStore.startTableListPolling({
						area_id: this.area_id,
						type_id: this.type_id
					});
				}
			},
			stopPolling() {
				if (this.tablePollingStore) {
					this.tablePollingStore.stopAllPolling();
				}
			},
			updatePollingParams() {
				if (this.tablePollingStore) {
					this.tablePollingStore.stopTableListPolling();
					this.tablePollingStore.startTableListPolling({
						area_id: this.area_id,
						type_id: this.type_id
					});
				}
			},
			openCash() {
				this.cashModel.order_id = this.model.order_id;
				this.is_cash = true;
			},
			handleClose() {},
			refreshFunc() {
				// 保存当前选中的桌台ID
				const selectedTableId = this.table_id;

				// 停止当前选中桌台的详情轮询
				if (selectedTableId && this.tablePollingStore) {
					this.tablePollingStore.stopTableDetailPolling(selectedTableId);
				}

				// 清空选中状态和数据
				this.table_id = 0;
				this.model = {
					table_id: 0,
					product_num: 0,
					product: [],
				};

				// 重置轮询状态
				if (this.tablePollingStore && this.tablePollingStore.pollingManager) {
					// 停止所有轮询
					this.tablePollingStore.stopTableListPolling();

					// 清除错误计数，重新开始
					const pollingManager = this.tablePollingStore.pollingManager;
					if (pollingManager.consecutiveErrors) {
						pollingManager.consecutiveErrors.clear();
					}
					if (pollingManager.consecutiveNoChange) {
						pollingManager.consecutiveNoChange.clear();
					}

					// 延迟重新启动轮询，给后端恢复时间
					setTimeout(() => {
						this.tablePollingStore.startTableListPolling({
							area_id: this.area_id,
							type_id: this.type_id
						});
						ElMessage({
							message: '数据刷新中...',
							type: 'success',
							duration: 2000
						});
					}, 300);
				} else {
					this.getTable();
				}
			},
			settleFunc() {
				let self = this;
				let Params = {
					order_id: self.model.order_id,
				};
				ElMessageBox.confirm("确定要完成订单吗?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning",
					})
					.then(() => {
						self.loading = true;
						OrderApi.settle(Params, true)
							.then((res) => {
								ElMessage({
									message: res.msg,
									type: "success",
								});
								self.table_id = 0;
								self.model = {
									table_id: 0,
									product_num: 0,
									product: [],
								};
								self.getTable();
								self.loading = false;
							})
							.catch((error) => {
								self.loading = false;
							});
					})
					.catch(() => {
						ElMessage({
							type: "info",
							message: "已取消",
						});
					});
			},
			noMore() {
				return this.last_page >= this.curPage;
			},
			disableds() {
				return this.loading || this.noMore();
			},
			getTable() {
				let self = this;
				let Params = {
					area_id: self.area_id,
					type_id: self.type_id,
				};
				self.loading = true;
				TableApi.getTable(Params, true)
					.then((res) => {
						self.tableList = res.data.list;
						self.typeList = res.data.typeList || self.typeList;
						self.loading = false;
					})
					.catch((error) => {
						self.loading = false;
					});
			},
			changeType(e) {
				this.type_id = e;
				this.curPage = 1;
				this.listData = [];
				this.getTable();
				this.updatePollingParams();
			},
			print() {
				let self = this;
				let Params = {
					order_id: self.detail.order_id,
				};
				ElMessageBox.confirm("确定要打印小票吗?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning",
					})
					.then(() => {
						self.loading = true;
						OrderApi.print(Params, true)
							.then((res) => {
								self.loading = false;
								ElMessage({
									message: res.msg,
									type: "success",
								});
							})
							.catch((error) => {
								self.loading = false;
							});
					})
					.catch(() => {
						ElMessage({
							type: "info",
							message: "已取消",
						});
					});
			},
			clearTable(e) {
				let self = this;
				if (e) {
					this.model = e;
				}
				ElMessageBox.confirm("确定要关闭桌台并取消订单吗?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning",
					})
					.then(() => {
						self.loading = true;
						self.cancelHallCart();
					})
					.catch(() => {
						ElMessage({
							type: "info",
							message: "已取消",
						});
					});
			},
			cancelHallCart() {
				let self = this;
				TableApi.cancelHallCart({
							table_id: self.model.table_id,
						},
						true
					)
					.then((res) => {
						ElMessage({
							message: res.msg,
							type: "success",
						});
						self.model = {
							table_id: 0,
							product_num: 0,
							product: [],
						};
						self.getTable();
						self.loading = false;
					})
					.catch((error) => {
						self.loading = false;
					});
			},
			pickTable(e) {
				if (this.table_id == e.table_id || this.loading) {
					return;
				}

				// 停止之前桌台的详情轮询
				if (this.table_id && this.tablePollingStore) {
					this.tablePollingStore.stopTableDetailPolling(this.table_id);
				}

				this.loading = true;
				this.table_id = e.table_id;
				let model = e;
				if (e.status > 20) {
					this.getHallCart();
					// 启动桌台详情轮询（就餐中状态）
					if (e.status === 30 && this.tablePollingStore) {
						this.tablePollingStore.startTableDetailPolling(e.table_id);
					}
				} else {
					model.product_num = 0;
					model.product = [];
					this.loading = false;
					this.model = model;
				}
			},
			getHallCart(targetTableId) {
				let self = this;
				// 如果没有传入 targetTableId，使用当前选中的 table_id
				const tableId = targetTableId || self.table_id;

				let Params = {
					table_id: tableId,
				};
				TableApi.getHallCart(Params, true)
					.then((res) => {
						// 只有当请求的桌台仍然是当前选中的桌台时，才更新数据
						if (tableId === self.table_id) {
							// 使用 nextTick 确保 DOM 更新后再设置新数据
							self.$nextTick(() => {
								// 直接使用 API 返回的数据，保持响应式
								const newModel = res.data.detail;
								newModel.table_id = tableId;

								// 完全替换 model 对象
								self.model = JSON.parse(JSON.stringify(newModel));
								self.loading = false;

								// 强制更新视图
								self.$forceUpdate();
							});
						} else {
							self.loading = false;
						}
					})
					.catch((error) => {
						self.loading = false;
					});
			},
			changeMoney() {
				this.is_money = true;
			},
			closeTableFunc(e) {
				let self = this;
				self.isTurntable = false;
				if (e == null) {
					return;
				}
				if (self.tableArr_id) {
					TableApi.changeTable({
							table_id: self.tableArr_id,
							order_id: self.model.order_id,
						},
						true
					).then((res) => {
						self.isTurntable = false;
						self.refreshFunc();
					});
				} else {
					ElMessage.error("请选择桌号");
				}
			},
			printFunc() {
				let self = this;
				TableApi.printFunc({
						order_id: self.model.order_id,
					},
					true
				).then((res) => {
					ElMessage({
						message: res.msg,
						type: "success",
					});
				});
			},
			changeTable() {
				let self = this;
				TableApi.getchangeTable({
						table_id: self.model.table_id,
					},
					true
				).then((res) => {
					self.tableArr = res.data.list;
					self.isTurntable = true;
				});
			},
			closeMoney(e) {
				let self = this;
				if (e) {
					let Params = e;
					Params.order_id = self.model.order_id;
					TableApi.changeMoney(Params, true).then((res) => {
						self.getHallCart();
						ElMessage({
							message: res.msg,
							type: "success",
						});
					});
				}
				this.is_money = false;
			},
			payStatus(id) {
				let self = this;
				let sucback = function() {
					removeMember();
					self.elLoading.close();
					self.awaitTime = 0;
					self.timeout = false;
					self.getTable();
					self.getHallCart();
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
						order_id: self.model.order_id,
						user_id: 0,
					};
					if (form) {
						Params.extend_id = form.extend_id;
						Params.extend_code = form.extend_code;
						Params.extend_money = form.extend_money;
						Params.auth_code = form.auth_code;
						Params.coupon_id = form.coupon_id;
					}
					const {
						memberInfo
					} = useUserStore();
					if (memberInfo) {
						Params.user_id = memberInfo.user_id;
					}
					self.elLoading = ElLoading.service({
						lock: true,
						text: "Loading",
						background: "rgba(0, 0, 0, 0.7)",
					});
					TableApi.payFunc(Params, true)
						.then((res) => {
							self.awaitTime = 0;
							self.timeout = true;
							self.payStatus(self.model.order_id);
						})
						.catch((error) => {
							self.elLoading.close();
							ElMessage.error(error.msg);
							// self.loading = false;
						});
				}
				this.is_cash = false;
			},
			getCategory() {
				let self = this;
				let Params = {};
				TableApi.getCategory(Params, true)
					.then((res) => {
						self.categoryList = res.data.list;
						self.typeList = self.categoryList[0].typeList;
						if (self.typeList.length > 0) {
							self.type_id = self.typeList[0].type_id;
						} else {
							self.type_id = 0;
						}
						self.loading = false;
						self.categoryFunc(self.categoryList[0].area_id);
					})
					.catch((error) => {});
			},
			categoryFunc(e) {
				let self = this;
				if (self.loading || self.area_id == e) {
					return;
				}
				self.loading = true;
				self.area_id = e;
				self.tableList = [];
				self.categoryList.some((item) => {
					if (item.area_id == self.area_id) {
						self.typeList = item.typeList;
						return;
					}
				});
				if (self.typeList.length > 0) {
					self.type_id = self.typeList[0].type_id;
				} else {
					self.type_id = 0;
				}
				self.curPage = 1;
				self.listData = [];
				self.getTable();
				self.updatePollingParams();
			},
			toCart(e) {
				this.$emit("close", e, this.model);
			},
			returnProduct(e) {
				let self = this;
				let Params = {};
				Params.order_id = e.order_id;
				Params.order_product_id = e.order_product_id;
				Params.num = e.total_num;

				ElMessageBox.prompt("请输入退菜数量?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
					})
					.then(({
						value
					}) => {
						Params.num = value;
						OrderApi.moveProduct(Params, true).then((res) => {
							ElMessage({
								message: res.msg,
								type: "success",
							});
							self.getHallCart();
						});
					})
					.catch(() => {
						ElMessage({
							type: "info",
							message: "取消退菜",
						});
					});
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
			height: calc(100vh - 488px);
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

	.order-table::-webkit-scrollbar {
		/*滚动条整体样式*/
		width: 5px;
		/*高宽分别对应横竖滚动条的尺寸*/
		height: 1px;
	}

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

	.table-head {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		overflow-x: auto;
		flex-wrap: wrap;
		padding: 14px 20px;
	}

	.table-box {
		// height: calc(100vh - 87px - 40px - 66px - 46px);
		overflow-y: auto;
		flex: 1;
	}

	.table-box::-webkit-scrollbar {
		/*滚动条整体样式*/
		width: 5px;
		/*高宽分别对应横竖滚动条的尺寸*/
		height: 1px;
	}

	.table-box::-webkit-scrollbar-thumb {
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

	.table-box::-webkit-scrollbar-track {
		/*滚动条里面轨道*/
		box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
		background: #ededed;
		border-radius: 10px;
	}

	.table-list {
		// padding: 20px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		box-sizing: border-box;
	}

	.table-item {
		width: 133px;
		height: 171px;
		background: #f1f5ff;
		border: 1px solid #eeeeee;
		border-radius: 10px;
		margin-right: 20px;
		margin-bottom: 20px;
		position: relative;
		box-sizing: border-box;
		overflow: hidden;
	}

	.table-item.active {
		border: 1px solid #ffa500;
	}

	.table-item-top {
		height: 38px;
		font-size: 18px;
		color: #ffffff;
		line-height: 38px;
		text-align: center;
	}

	.table-item-top1 {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 28px;
		height: 28px;
		line-height: 28px;
		background-color: #ffffff;
		border-radius: 50%;
		font-size: 18px;
		color: #ffa500;
		text-align: center;
	}

	.color-box {
		width: 20px;
		height: 20px;
		border-radius: 5px;
		margin-right: 10px;
	}

	.table-item-top.status10,
	.color-box.status10 {
		background: linear-gradient(0deg, #945bf1, #ac7bfa);
	}

	.table-item-top.status20,
	.color-box.status20 {
		background: linear-gradient(0deg, #409eff, #409eff);
	}

	.table-item-top.status30,
	.color-box.status30 {
		background: linear-gradient(0deg, #5cb85c, #5cb85c);
	}

	.close-icon {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		right: 0;
		bottom: 0;
		cursor: pointer;
	}

	.table-info {
		background: #f8f8f8;
		border: 1px solid #eeeeee;
		border-radius: 15px 15px 0 0;
		box-sizing: border-box;
		height: 100%;
		position: relative;
	}

	.table-info-top {
		background: linear-gradient(0deg, #ff8425, #ffa92e);
		border-radius: 15px 15px 0 0;
		height: 103px;
		width: 750px;
		color: #ffffff;
		font-size: 14px;
		padding: 20px 6%;
	}

	.table-bottom {
		position: absolute;
		width: 100%;
		bottom: 0;
		left: 0;
	}

	.mr20 {
		margin-right: 20px;
	}

	.table-home .el-table tr {
		background-color: #f8f8f8;
	}

	.table-home .el-table__body tr.current-row>td.el-table__cell {
		background-color: rgba($color: #409eff, $alpha: 0.2);
	}

	.table-home .mb0 {
		margin-bottom: 0;
	}

	.table-itemicon {
		width: 36px;
		height: 36px;
		font-size: 16px;
		border-radius: 50%;
		background-color: rgba($color: #ffa500, $alpha: 0.35);
		color: #ffa500;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.mr25 {
		margin-right: 25px;
	}

	.mb5 {
		margin-bottom: 5px;
	}

	.border-t {
		border-top: 1px solid #eeeeee;
	}

	.mb10 {
		margin-bottom: 10px;
	}

	.bottom-nav {
		// height: 70px;
		padding-top: 17px;
		box-sizing: border-box;
	}

	.c-p {
		cursor: pointer;
	}

	.table-home .el-aside {
		width: var(--el-aside-width);
		padding-top: 15px;
		padding-right: 20px;
		box-sizing: border-box;
	}

	.table-home .table-home-leftaside {
		width: 128px;
	}

	.el-container {
		display: flex;
	}
</style>