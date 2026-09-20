<!-- 未使用 -->
<template>
	<el-dialog title="整单备注" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
		:close-on-press-escape="false" width="80%" class="dialog-search">
		<div>
			<el-input v-model="remark" class="ww100 mb20" :rows="4" type="textarea" resize="none"
				placeholder="整单备注:请输入订单备注" />
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button type="primary" size="default" @click="handleClose" round>取 消</el-button>
				<el-button type="warning" size="default" @click="handleClose" round>确 定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
	import HomeApi from '@/api/home.js';
	export default {
		data() {
			return {
				dialogVisible: false,
				remark: ''
			};
		},
		props: {
			isRemark: Boolean
		},
		watch: {
			isRemark: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						this.getData();
					}
				}
			}
		},
		methods: {
			getData() {
				let self = this;
				HomeApi.stayList({}, true).then(res => {
					self.list = res.data.productList;
				});
			},
			delStay(e) {
				let self = this;
				HomeApi.delCart({
					cart_no: e.cart_no
				}, true).then(res => {
					self.getData();
					self.$emit('close', 'delete');
				});
			},
			pick(e) {
				this.$emit('close', e.cart_no);
			},
			handleClose(done) {
				this.$emit('close', null);
			}
		}
	};
</script>

<style lang="scss">
	.f24 {
		font-size: 24px;
	}

	.redF4 {
		color: #F4463B;
	}

	.mb16 {
		margin-bottom: 16px;
	}

	.mb20 {
		margin-bottom: 20px;
	}

	.tl {
		text-align: left;
	}

	.dialog-title {
		font-size: 18px;
		font-family: Microsoft YaHei;
		font-weight: bold;
		color: #49494E;
		line-height: 38px;

	}

	.stay-item {
		background: #F8F8F8;
		border: 1px solid #EEEEEE;
		box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.15);
		margin-bottom: 21px;
		padding: 20px 30px;
		box-sizing: border-box;
	}
</style>