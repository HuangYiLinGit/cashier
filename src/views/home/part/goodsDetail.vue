<template>
	<el-dialog title="套餐商品" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
		:close-on-press-escape="false" width="80%" class="dialog-spec" v-loading="loading">
		<div class="d-s-s mb20">
			<div class="product-image">
				<img v-img-url="detail.image && detail.image[0].file_path" />
			</div>
			<div class="pl20">
				<div class="f18 tl fb">{{ detail.product_name }}</div>
				<div class="f13 gray9 tl">单位:{{ detail.product_unit }}</div>
				<div class="gray3 f13 tl">
					单价:<span class="f18 redF4">￥{{ price }}</span>
				</div>
			</div>
		</div>
		<div class="product-specs">
			<template v-if="detail.selectData.length > 0">
				<div class="property" v-for="(item, index) in detail.selectData" :key="index">
					<div class="title">
						<text class="gray3 f14">{{ item.name }}</text><text
							class="f12">({{ item.goods.length }}选{{ item.select_num }})</text>
					</div>
					<div class="goods-values">
						<div class="goods-value d-c d-c-c"
							@click.stop="selectPick(gitem, gindex, index, item.select_num)"
							v-for="(gitem, gindex) in item.goods" :key="gindex"
							:class="{ default: hasSelectData(gitem) }">
							<div class="image-boxs">
								<img class="goods-img" v-img-url="gitem.product_image" />
								<div class="sallsell-out" v-if="gitem.product_stock <= 0">
									<div class="sallsell-out-btn">售罄</div>
								</div>
							</div>
							<div class="goods-info d-c d-b-c">
								<div class="f13 gray3 ww100">
									<div class="text-ellipsis">{{ gitem.product_name }}</div>
								</div>
								<div class="f12 gray9 text-ellipsis ww100">
									{{ gitem.spec_name || " " }}
								</div>
								<div class="goods-price ww100" v-if="gitem.goods_price * 1">
									+￥{{ gitem.goods_price }}
								</div>

								<template v-if="!hasSelectData(gitem)">
									<div class="goods-btn" v-if="gitem.spec_type == 20">定制</div>
									<div class="btn-group ww100 sing" v-else>
										<el-icon class="add-image" :class="{ plus: !isMaxSelect(index) }">
											<CirclePlus />
										</el-icon>
									</div>
								</template>
								<div class="btn-group ww100" v-if="hasSelectData(gitem)">
									<el-icon @click.stop="subSelect(gitem, index, gindex)" class="add-image">
										<Remove />
									</el-icon>
									<div class="number">{{ getSelectNum(gitem, index) }}</div>
									<el-icon class="add-image" :class="{ plus: !isMaxSelect(index) }" @click.stop="
                      isMaxSelect(index)
                        ? () => {}
                        : addSelect(gitem, index, gindex)
                    ">
										<CirclePlus />
									</el-icon>
								</div>
							</div>
						</div>
					</div>
					<div class="f22 gray9 mb20 mt20">{{ getDescribe(index) }}</div>
				</div>
			</template>
			<Spec :is_pop="isDetail" :detail="specModel" :isGoods="true" @close="closeDetailModal"></Spec>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="handleClose(null)">取 消</el-button>
				<el-button type="primary" @click="addCart">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
	import Spec from "./spec.vue";
	import HomeApi from "@/api/home.js";
	import orderApi from "@/api/order.js";
	export default {
		components: {
			Spec,
		},
		data() {
			return {
				loading: false,
				dialogVisible: true,
				isDetail: false,
				specModel: {},
				table_id: 0,
				clock: false,
				detail: {
					selectData: [],
				},
				selectData: [],
				popModel: {
					type: "",
					index: "",
					gindex: "",
				},
				sum: 1,
			};
		},
		props: {
			productModel: Object,
			selectOnly: {
				type: Boolean,
				default: false
			},
			selectedGroupData: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			price: function() {
				let total = this.detail.product_price * 1; // 基础产品价格
				// 累加已选择商品的价格
				total += this.selectData.reduce((sum, item) => {
					if (item.data) {
						return (
							sum +
							item.data.reduce((innerSum, sitem) => innerSum + sitem.price * 1, 0)
						);
					}
					return sum;
				}, 0);
				return (total * this.sum).toFixed(2);
			},
			lineprice: function() {
				let total = this.detail.line_price * 1; // 基础产品价格
				// 累加已选择商品的价格
				total += this.selectData.reduce((sum, item) => {
					if (item.data) {
						return (
							sum +
							item.data.reduce(
								(innerSum, sitem) => innerSum + sitem.product_price * 1,
								0
							)
						);
					}
					return sum;
				}, 0);
				return (total * this.sum).toFixed(2);
			},
		},
		created() {
			this.getData();
		},
		methods: {
			getData() {
				this.detail = this.productModel;
				this.table_id = this.productModel.table_id;
				this.clock = false;
				this.initSelectedGroupData();
			},
			initSelectedGroupData() {
				this.selectData = [];
				if (!this.selectedGroupData || this.selectedGroupData.length <= 0 || !this.detail.selectData) {
					return;
				}
				this.detail.selectData.forEach((group, index) => {
					// 修复：后端 selectData 使用 group_id，需要匹配 selectedGroupData 的 groupId
					const data = this.selectedGroupData.filter(item => item.groupId === group.group_id);
					if (data.length > 0) {
						this.selectData[index] = {
							group_id: group.group_id,
							data: data.map(item => ({
								...item,
								describe: item.describe || item.described || ''
							}))
						};
					}
				});
			},
			/* 可选规格描述 */
			getDescribe(n) {
				const {
					selectData
				} = this;
				let text = "已选:";
				if (selectData[n]?.data) {
					text += selectData[n].data
						.map(
							(item) =>
							`${item.product_name}${
                item.describe ? "(" + item.describe + ")" : ""
              }x${item.product_num}`
						)
						.join(";");
					return text;
				} else {
					return "请选择";
				}
			},
			/* 获取选中列表中的商品 */
			getSelectItem(gitem, index) {
				return this.selectData[index].data.find(
					(item) => item.goods_id === gitem.goods_id
				);
			},
			/* 获取选中列表中的商品的数量 */
			getSelectNum(gitem, index) {
				let item = this.getSelectItem(gitem, index);
				return item ? item.product_num : 0;
			},
			/* 是否超过可选组的最大选择数量 */
			isMaxSelect(index) {
				const dataArray = this.selectData[index]?.data;
				if (!dataArray) {
					return false;
				}
				// 该组已选数量
				const totalProductNum = dataArray.reduce(
					(sum, item) => sum + item.product_num,
					0
				);
				return totalProductNum >= this.detail.selectData[index].select_num;
			},
			/* 减数量 */
			subSelect(gitem, index, gindex) {
				const {
					getSelectItem,
					selectData
				} = this;
				const item = getSelectItem(gitem, index);
				// 确保数值是数字类型
				const product_num = Number(item.product_num);
				// 计算单价
				const pricePerUnit = item.price / product_num;
				const productPricePerUnit = item.product_price / product_num;
				const adjustedProductNum = product_num - 1;
				// 如果产品数量小于等于0，从数据中移除该项
				if (adjustedProductNum <= 0) {
					// 索引
					const itemIndex = selectData[index].data.findIndex(
						(sitem) => sitem.goods_id === gitem.goods_id
					);
					// 如果找到了该项，则移除它
					if (itemIndex !== -1) {
						selectData[index].data.splice(itemIndex, 1);
					}
					return;
				}
				// 更新折后价price和原价
				item.product_num = adjustedProductNum;
				item.price = pricePerUnit * item.product_num;
				item.product_price = productPricePerUnit * item.product_num;
			},
			/* 加数量 */
			addSelect(gitem, index, gindex) {
				const {
					getSelectItem
				} = this; // 只解构需要的方法
				const item = getSelectItem(gitem, index);
				// 确保数值是数字类型
				const product_num = Number(item.product_num);
				if (product_num >= item.product_stock) {
					ElMessage.error("请选择商品");
					return;
				}
				// 计算单价
				const pricePerUnit = item.price / product_num;
				const productPricePerUnit = item.product_price / product_num;
				// 更新折后价price和原价
				item.product_num = product_num + 1;
				item.price = pricePerUnit * item.product_num.toFixed(2);
				item.product_price = productPricePerUnit * item.product_num.toFixed(2);
			},
			selectProduct(e) {
				if (!this.popModel || typeof this.popModel.index !== "number") {
					return;
				}

				// 初始化 selectData 中的相应条目（如果不存在）
				if (!this.selectData[this.popModel.index]) {
					this.selectData[this.popModel.index] = {
						group_id: this.popModel.group_id,
						data: [],
					};
				}
				const newProduct = {
					group_id: e.group_id,
					goods_id: e.goods_id,
					product_num: e.product_num,
					product_sku_id: e.product_sku_id,
					product_id: e.product_id,
					spec_name: e.spec_name,
					describe: e.describe,
					price: e.price.toFixed(2),
					product_price: e.product_price.toFixed(2),
					product_name: e.product_name,
					feed: e.feed,
					attr: e.attr
				};
				this.selectData[this.popModel.index].data.push(newProduct);
			},
			/*选择可选商品*/
			selectPick(item, gindex, index, select_num) {
				const selectList = this.detail.selectData[index];
				// 检查是否已选择该商品
				if (this.hasSelectData(item)) {
					// 使用 findIndex 和 splice 来简化删除逻辑
					const kindex = this.selectData.findIndex((kitem) =>
						kitem.data.some((kkitem) => kkitem.goods_id === item.goods_id)
					);
					if (kindex !== -1) {
						const kkindex = this.selectData[kindex].data.findIndex(
							(kkitem) => kkitem.goods_id === item.goods_id
						);
						if (kkindex !== -1) {
							this.selectData[kindex].data.splice(kkindex, 1);
						}
					}
					return;
				}
				// 检查是否超出可选数量
				if (this.isMaxSelect(index)) {
					return;
				}
				if (item.product_stock <= 0) {
					ElMessage.error("商品库存不足");
					return;
				}
				if (item.spec_type == 20) {
					this.openDetail("selectData", item, index, gindex);
				} else {
					// 准备参数对象
					const params = {
						group_id: item.group_id,
						goods_id: item.goods_id,
						product_num: 1,
						product_sku_id: item.product_sku_id,
						product_id: item.product_id,
						spec_name: item.spec_name,
						attr: "",
						feed: "",
						describe: "",
						price: item.product_price * 1,
						product_price: item.goods_price * 1,
						product_name: item.product_name,
					};
					// 设置 popModel
					this.popModel = {
						type: "selectData",
						index: index,
						group_id: item.group_id,
						gindex: gindex,
					};
					this.selectProduct(params);
				}
			},
			/* 是否选择可选商品 */
			hasSelectData(e) {
				// this.selectData.forEach((item => {
				// 	if (item.data) {
				// 		item.data.forEach((sitem, sindex) => {
				// 			// console.log(item.data)
				// 			if (sitem.goods_id == e.goods_id) {
				// 				console.log(item)
				// 			}
				// 		})
				// 	}
				// }))
				// console.log(this.selectData);
				return this.selectData.some(
					(item) =>
					item.data && item.data.some((sitem) => sitem.goods_id === e.goods_id)
				);
			},
			/* 定制 */
			openDetail(type, item, index, gindex) {
				if (this.loading) {
					return;
				}
				this.loading = true;
				HomeApi.goodsDetail({
							goods_id: item.goods_id,
						},
						true
					)
					.then((res) => {
						this.specModel = res.data.detail;
						this.specModel.goods_id = item.goods_id;
						this.specModel.group_id = item.group_id;
						this.specModel.sku = [...this.specModel.sku];
						this.popModel = {
							type,
							index,
							gindex,
							group_id: item.group_id,
						};
						this.isDetail = true;
						this.loading = false;
					})
					.catch((error) => {
						this.loading = false;
					});
				// this.popModel = {
				// 	type,
				// 	index,
				// 	gindex,
				// 	group_id: item.group_id
				// };
				// const delivery = this.orderType === 'takeout' ? 10 : 20;
				// this.specModel = {
				// 	product_id: item.product_id || 0,
				// 	goods_id: item.goods_id || 0,
				// 	group_id: item.group_id || 0,
				// 	delivery,
				// 	bagType: this.bagType || 0,
				// 	dinnerType: this.dinnerType || 0,
				// 	cartType: this.cartType || 0,
				// 	table_id: 0,
				// 	shopSupplierId: this.shopSupplierId || 0
				// };
				// this.isDetail = true;
			},
			closeDetailModal(e) {
				if (e) {
					this.selectProduct(e);
				}
				//关闭饮品详情模态框
				this.isDetail = false;
				this.clock = false;
				console.log(this.isDetail);
			},
			/*确认提交*/
			confirmFunc() {
				if (this.clock) {
					return;
				}
				this.addCart();
			},
			allSelect() {
				const self = this;
				// 检查两个数组的长度是否相等
				if (self.selectData.length !== self.detail.selectData.length) {
					return false;
				}
				// 每个商品是否已被选择
				return (
					self.selectData.every((item, index) => {
						// 如果当前商品未被选择到最大数量
						if (!self.isMaxSelect(index)) {
							return false;
						}
						return true;
					}) && true
				);
			},
			/*加入购物车*/
			addCart() {
				const self = this;
				if (!self.allSelect()) {
					ElMessage.error("请选择商品");
					return;
				}

				// 展平套组数据
				const groupData = self.selectData.reduce((acc, item) => {
					if (item.data) {
						acc.push(...item.data);
					}
					return acc;
				}, []);

				// 如果是只选择模式，直接返回数据，不调用API
				if (self.selectOnly) {
					self.handleClose(groupData);
					return;
				}

				const params = {
					product_id: self.detail.product_id,
					delivery: 40,
					product_sku_id: self.detail.sku[0].product_sku_id,
					product_num: self.sum,
					cartType: 0,
					price: (self.price / self.sum).toFixed(2),
					product_price: (self.lineprice / self.sum).toFixed(2),
					selectData: self.selectData,
					bag_price: self.detail.sku[0].bag_price,

				};
				let api = orderApi.cartAddGroup;
				if (this.table_id) {
					params.table_id = this.table_id;
					api = orderApi.hallCartAddGroup;
				}

				self.clock = true;
				self.loading = true;
				api(params, true)
					.then((res) => {
						self.clock = false;
						self.loading = false;
						ElMessage.success("操作成功");
						self.handleClose(true);
					})
					.catch((error) => {
						self.clock = false;
						self.loading = false;
					});
			},
			handleClose(e) {
				if (e) {
					this.$emit("close", e);
				} else {
					this.$emit("close", null);
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.tl {
		text-align: left;
	}

	.dialog-spec {
		.el-dialog {
			background: #fbfaf8;
			box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.25);
			border-radius: 5px;
		}

		.product-image {
			width: 124px;
			height: 112px;

			img {
				width: 124px;
				height: 112px;
			}

			border-radius: 10px;
		}
	}

	.dialog-title {
		font-size: 18px;
		font-family: Microsoft YaHei;
		font-weight: bold;
		color: #49494e;
		line-height: 38px;
	}

	.dialog-content {
		padding: 24px 40px;
		border-top: 1px solid #eeeeee;
	}

	.attr-list {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.attr-item {
		min-width: 100px;
		padding: 0 20px;
		height: 40px;
		line-height: 40px;
		border-radius: 20px;
		cursor: pointer;
		margin-right: 10px;
		margin-bottom: 10px;
		background: #efefef;
		color: #49494e;
		flex-shrink: 0;
	}

	.attr-item.active {
		background: #ffa500;
		color: #ffffff;
	}

	.product-specs {
		margin: 0 12px;
		padding-top: 13px;
		border-top: 1px solid #eee;

		.property {
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;
			overflow: auto;

			.title {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				margin-bottom: 10px;

				.name {
					font-size: 12px;
					color: #333;
				}
			}

			.values {
				display: flex;
				flex-wrap: wrap;

				.value {
					border-radius: 12px;
					height: 31px;
					line-height: 31px;
					background-color: #f2f2f2;
					padding: 0 18px;
					font-size: 12px;
					color: #333333;
					margin-right: 9px;
					margin-bottom: 11px;

					&.default {
						background-color: #ffa500;
						color: #333;
					}
				}
			}

			.goods-values {
				display: flex;
				justify-content: flex-start;
				align-items: flex-start;
				width: 100%;
				padding: 10px 0;
				flex-wrap: wrap;

				.goods-value {
					position: relative;
					width: 132px;
					height: 213px;
					border-radius: 8px;
					border: 1px solid #eeeeee;
					box-sizing: border-box;
					margin-right: 20px;
					overflow: hidden;
					flex-shrink: 0;
					cursor: pointer;
					text-align: left;
					margin-bottom: 20px;

					/* 售罄 */
					.image-boxs {
						position: relative;
						margin-bottom: 6px;

						.sallsell-out {
							position: absolute;
							left: 0;
							top: 0;
							width: 132px;
							height: 108px;
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

					.goods-img {
						width: 132px;
						height: 108px;
						display: block;
					}

					.goods-info {
						width: 132px;
						padding: 0 5px 5px 5px;
						flex: 1;
						box-sizing: border-box;
					}

					.goods-btn {
						width: 90px;
						height: 26px;
						background: linear-gradient(0deg, #409eff, #409eff);
						border-radius: 26px;
						font-size: 13px;
						color: #fdf9ec;
						text-align: center;
						line-height: 26px;
						margin: 4px auto;
					}

					&.default {
						border-color: #ffa500;

						.unchecked {
							display: none;
						}

						.checked {
							position: absolute;
							right: 12px;
							top: 12px;
							z-index: 1;
							border-radius: 50%;
							color: #ffa500;
							display: inline-block;
							width: 15px;
							height: 15px;
							font-size: 15px;
						}
					}

					.checked {
						display: none;
					}

					.unchecked {
						position: absolute;
						right: 6px;
						top: 6px;
						z-index: 1;
						width: 15px;
						height: 15px;
						border-radius: 50%;
						border: 1px solid #ffffff;
					}

					.btn-group.sing {
						flex: 1;
						align-items: flex-end;
						justify-content: flex-end;
					}

					.btn-group {
						display: flex;
						align-items: center;
						justify-content: space-around;
						height: 26px;
						margin: 4px auto;

						.number {
							font-size: 12px;
							width: 18px;
							height: 18px;
							line-height: 18px;
							text-align: center;
						}

						.add-image {
							display: block;
							width: 18px;
							height: 18px;
							font-size: 18px;
							color: #999;
						}

						.add-image.plus {
							color: #ffa500;
						}
					}
				}
			}
		}
	}

	.p-0-5 {
		padding: 0 5px;
	}

	.pb5 {
		padding-bottom: 5px;
	}

	.f13 {
		font-size: 13px;
	}

	.f12 {
		font-size: 12px;
	}

	.pl20 {
		padding-left: 20px;
	}

	.goods-price {
		color: #fa301b;
		font-size: 12px;
	}
</style>