<template>
	<el-dialog title="商品详情" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
		width="80%" :close-on-press-escape="false" class="dialog-spec">
		<template v-if="detail != null">
			<div class="d-s-c">
				<div class="product-image">
					<img :src="detail.image[0].file_path" />
				</div>
				<div class="p20">
					<div class="f16 tl fb">{{ detail.product_name }}</div>
					<div class="gray6 tl f14">
						单价:￥{{ show_sku.product_price || detail.product_price }} 单位:{{ detail.product_unit }}
					</div>
				</div>
			</div>
			<div v-if="detail.spec_type == 20" class="mt20">
				<div class="fb mb10 tl f14">规格</div>
				<div class="attr-list">
					<div class="attr-item f14" :class="{ active: product_sku_id == item.product_sku_id }"
						@click="selecedtSpec(item, index)" v-for="(item, index) in detail.sku" :key="index">
						{{ item.spec_name + " ￥" + item.product_price }}
					</div>
				</div>
			</div>
			<template v-if="detail.product_attr.length > 0">
				<div class="mt20" v-for="(attrItem, attrIndex) in detail.product_attr" :key="attrIndex">
					<div class="fb mb10 tl f14">{{ attrItem.attribute_name }}</div>
					<div class="attr-list">
						<template v-for="(item, index) in attrItem.attribute_value">
							<div v-if="item" class="attr-item f14"
								:class="{ active: show_sku.attr[attrIndex] == index }" :key="index"
								@click="selectAttr(item, index, attrIndex)">
								{{ item }}
							</div>
						</template>
					</div>
				</div>
			</template>
			<div class="mt20" v-if="detail.product_feed.length > 0">
				<div class="fb mb10 tl f14">加料</div>
				<div class="attr-list">
					<div class="attr-item f14" :class="{ active: show_sku.feed[index] != null }"
						@click="selectFeed(item, index)" v-for="(item, index) in detail.product_feed" :key="index">
						{{ item.feed_name + " ￥" + item.price }}
					</div>
				</div>
			</div>
		</template>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="handleClose(null)">取 消</el-button>
				<el-button type="primary" @click="addCart">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
	export default {
		data() {
			return {
				dialogVisible: false,
				product_sku_id: 0,
				space_name: "",
				attr_name: [],
				feed_name: [],
				show_sku: {
					attr: [],
					feed: [],
					product_price: "",
					bag_price: 0,
				},
				feed_price: "",
				line_price: "",
			};
		},
		props: {
			isGoods: Boolean,
			is_pop: Boolean,
			detail: Object,
		},
		computed: {},
		watch: {
			is_pop: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						this.init();
						this.initializeDefaultSelection();
					}
				}
			},
		},
		methods: {
			initializeDefaultSelection() {
				if (
					this.detail &&
					this.detail.product_attr &&
					this.detail.product_attr.length > 0
				) {
					this.detail.product_attr.forEach((attrItem, attrIndex) => {
						if (attrItem.attribute_value && attrItem.attribute_value.length > 0) {
							this.show_sku.attr[attrIndex] = 0; // 默认选中第一项
							this.attr_name[attrIndex] = attrItem.attribute_value[0]; // 保存选中的名称
						}
					});
				}
			},
			init() {
				let self = this;
				self.space_name = "";
				self.attr_name = [];
				self.feed_name = [];
				self.product_sku_id = 0;
				self.feed_price = "";
				self.line_price = "";
				self.show_sku = {
					attr: [],
					feed: [],
					product_price: "",
					bag_price: 0,
				};
				self.selecedtSpec(self.detail.sku[0], 0);
			},
			/*选择属性*/
			selecedtSpec(item, index) {
				let self = this;
				self.product_sku_id = item.product_sku_id;
				self.space_name = item.spec_name;
				self.show_sku.product_price = item.product_price;
				self.line_price = item.line_price;
				self.show_sku.bag_price = item.bag_price;
			},
			/*选择属性*/
			selectAttr(item, index, aindex) {
				let self = this;
				self.show_sku.attr[aindex] = index;
				self.attr_name[aindex] = item;
			},
			/*选择加料*/
			selectFeed(item, index) {
				let self = this;
				if (self.show_sku.feed[index] || self.show_sku.feed[index] === 0) {
					self.show_sku.feed[index] = null;
					self.feed_price = self.feed_price * 1 - item.price * 1;
					let n = self.feed_name.indexOf(item.feed_name);
					if (n > -1) {
						self.feed_name.splice(n, 1);
					}
				} else {
					self.show_sku.feed[index] = index;
					self.feed_price = self.feed_price * 1 + item.price * 1;
					self.feed_name.push(item.feed_name);
				}
			},
			/* 选中属性描述*/
			describe: function() {
				let space_name = this.space_name;
				if (space_name != "") {
					space_name += ";";
				}
				let attr_name = this.attr_name.join(";");
				if (attr_name != "") {
					attr_name += ";";
				}
				let feed_name = this.feed_name.join(",");
				if (feed_name != "") {
					feed_name += ";";
				}

				return space_name + attr_name + feed_name;
			},
			addCart() {
				let self = this;
				let feed = [];
				self.show_sku.feed.forEach((item, index) => {
					if (item != null) {
						feed.push(self.detail.product_feed[item].feed_name);
					}
				});
				if (feed.length <= 0) {
					feed = "";
				} else {
					feed = feed.join(",");
				}
				let attr = [];
				self.show_sku.attr.forEach((item, index) => {
					if (item != null) {
						attr.push(self.detail.product_attr[index].attribute_value[item]);
					}
				})
				if (attr.length <= 0) {
					attr = ''
				} else {
					attr = attr.join(',')
				}
				let params = {
					product_id: self.detail.product_id,
					product_num: 1,
					product_sku_id: self.product_sku_id,
					attr: attr,
					feed: feed,
					describe: self.describe(),
					price: self.feed_price * 1 + self.show_sku.product_price * 1,
					product_price: self.feed_price * 1 + self.line_price * 1,
					bag_price: self.show_sku.bag_price,
				};
				if (this.isGoods) {
					params.goods_id = self.detail.goods_id || "";
					params.group_id = self.detail.group_id || "";
					params.product_name = self.detail.product_name || "";
				}
				self.handleClose(params);
			},
			handleClose(e) {
				if (e && e.product_id) {
					this.$emit("close", e);
				} else {
					this.$emit("close", null);
				}
			},
		},
	};
</script>

<style lang="scss">
	.tl {
		text-align: left;
	}

	.dialog-spec {
		width: 70%;

		.el-dialog {
			background: #fbfaf8;
			box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.25);
			border-radius: 5px;
		}

		.product-image {
			width: 60px;
			height: 60px;

			img {
				width: 60px;
				height: 60px;
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
</style>