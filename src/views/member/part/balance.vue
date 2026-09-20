<template>
	<div class="coupon-box">
		<div class="coupon-conten">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" @current-change="openDetail">
				<el-table-column prop="scene.text" label="余额变动场景">
					<template #default="scope">
						<span v-if="scope.row.scene.value==10"
							style="color: #409EFF">{{scope.row.scene.text}}</span>
						<span v-if="scope.row.scene.value==20"
							style="color: #67C23A">{{scope.row.scene.text}}</span>
						<span v-if="scope.row.scene.value==30"
							style="color: #F56C6C">{{scope.row.scene.text}}</span>
						<span v-if="scope.row.scene.value==40"
							style="color: #E6A23C">{{scope.row.scene.text}}</span>
						<span v-if="scope.row.scene.value==50"
							style="color: #E63C81">{{scope.row.scene.text}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="money" label="变动金额">
					<template #default="scope">
						<p v-if="scope.row.money >0">+{{scope.row.money}}</p>
						<p v-else>{{scope.row.money}}</p>
					</template>
				</el-table-column>
				<el-table-column prop="supplier" label="消费门店	">
					<template #default="scope">
						<p v-if="scope.row.supplier" class="red">{{scope.row.supplier.name}}</p>
					</template>
				</el-table-column>
				<el-table-column prop="describe" label="描述/说明" width="200">
					<template #default="scope">
						<p>{{scope.row.describe}}</p>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="管理员备注">
					<template #default="scope">
						<p v-if="scope.row.remark ==''">--</p>
						<p v-else>{{scope.row.remark}}</p>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" width="140"></el-table-column>
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
				UserApi.getBalance(Params, true)
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