<template>
	<div class="coupon-box">
		<div class="coupon-conten">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" @current-change="openDetail">
				<el-table-column prop="log_id" label="ID" width="60"></el-table-column>
				<el-table-column prop="value" label="变动数量"></el-table-column>
				<el-table-column prop="describe" label="描述/说明"></el-table-column>
				<el-table-column prop="remark" label="管理员备注">
					<template #default="scope">
						<span v-if="scope.row.remark==''">--</span>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间"></el-table-column>
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
				UserApi.getPoints(Params, true)
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