<template>
	<div class="coupon-box">
		<div class="coupon-conten">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" @current-change="openDetail">
				<el-table-column prop="name" label="券名称"></el-table-column>
				<el-table-column prop="coupon_type.text" label="券类型"></el-table-column>
				<el-table-column prop="create_time" label="获得时间"></el-table-column>
				<el-table-column prop="state.text" label="使用状态">
					<template #default="scope">
						<span v-if="scope.row.state&&scope.row.state.text">{{scope.row.state.text}}</span>
						<span v-else>未使用</span>
					</template>
				</el-table-column>
				<el-table-column prop="seckill_stock" label="开始使用时间">
					<template #default="scope">
						<span>
							{{scope.row.start_time.text}}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="seckill_stock" label="结束使用时间">
					<template #default="scope">
						<span>
							{{scope.row.end_time.text}}
						</span>
					</template>
				</el-table-column>
			</el-table>
			<!--分页-->
			<div class="pagination">
				<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background
					:current-page="curPage" :page-size="pageSize" layout="total, prev, pager, next, jumper"
					:total="totalDataNumber"></el-pagination>
			</div>
		</div>
	</div>

</template>

<script>
	import UserApi from '@/api/user.js';
	import {
		useUserStore
	} from '@/store';
	export default {
		data() {
			return {
				memberInfo: null,
				/*是否加载完成*/
				loading: true,
				/*列表数据*/
				tableData: [],
				/*一页多少条*/
				pageSize: 10,
				/*一共多少条数据*/
				totalDataNumber: 0,
				/*当前是第几页*/
				curPage: 1,

			}
		},
		created() {
			let {
				memberInfo
			} = useUserStore();
			this.memberInfo = memberInfo;

			if (this.memberInfo) {
				this.getData();
			}
		},
		methods: {
			/*选择第几页*/
			handleCurrentChange(val) {
				let self = this;
				self.curPage = val;
				self.getData();
			},

			/*每页多少条*/
			handleSizeChange(val) {
				this.curPage = 1;
				this.pageSize = val;
				this.getData();
			},
			getData() {
				let self = this;
				let Params = {
					user_id: self.memberInfo.user_id
				};
				Params.page = self.curPage;
				Params.list_rows = self.pageSize;
				self.loading = true;
				UserApi.getCoupon(Params, true)
					.then(res => {
						self.tableData = res.data.list.data;
						self.totalDataNumber = res.data.list.total;
						self.loading = false;
					})
					.catch(error => {
						console.log(error)
					});
			}
		}
	}
</script>

<style lang="scss">
	.coupon-box {
		padding: 12px;

		.coupon-conten {
			background-color: #fff;
			height: calc(100vh - 171px);
			padding: 12px;
			box-sizing: border-box;
		}

	}
</style>