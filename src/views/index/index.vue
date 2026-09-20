<template>
	<div class="home-box">
		<div class="home-top">
			<div class="home-t-item">
				<div class="d-b-s border-b home-titem-t">
					<div>
						<div class="f20 gray3 mb6">
							营业额<span class="f13 gray9">(元)</span>
							<el-popover placement="top-start" :width="200" trigger="hover"
								:content="'已付款订单实际支付金额(不包含三方券)'">
								<template #reference>
									<el-icon class="f18" color="#DDD">
										<QuestionFilled />
									</el-icon>
								</template>
							</el-popover>
						</div>
						<div class="fb f24 gray3">
							{{ $numTCN(top_data.today_money || 0) }}
						</div>
					</div>
					<div class="today-icon">今</div>
				</div>
				<div class="home-titem-b gray9">
					<div class="f13">
						已优惠金额 <span>{{ $numTCN(top_data.discount_money || 0) }}</span>元
					</div>
					<div class="f13">
						三方券金额 <span>{{ $numTCN(top_data.extend_money || 0) }}</span>元
					</div>
				</div>
			</div>
			<div class="home-t-item">
				<div class="d-b-s border-b home-titem-t">
					<div>
						<div class="f20 gray3 mb6">
							订单总量<span class="f13 gray9">(笔)</span>
							<el-popover placement="top-start" :width="200" trigger="hover"
								:content="'已付款订单数量(不包含取消订单)'">
								<template #reference>
									<el-icon class="f18" color="#DDD">
										<QuestionFilled />
									</el-icon>
								</template>
							</el-popover>
						</div>
						<div class="fb f24 gray3">{{ top_data.order_total || 0 }}</div>
					</div>
					<div class="today-icon">今</div>
				</div>
				<div class="home-titem-b gray9">
					<div class="d-b-c">
						<div>
							<div class="f13">
								收银台订单总量
								<span class="ml10">{{ top_data.fast_order_total || 0 }}</span>笔
							</div>
							<div class="f13">
								桌台订单总量
								<span class="ml10">{{ top_data.table_order_total || 0 }}</span>笔
							</div>
						</div>
						<div>
							<div class="f13">
								外卖订单总量
								<span class="ml10">{{ top_data.take_order_total || 0 }}</span>笔
							</div>
							<div class="f13">
								快餐订单总量
								<span class="ml10">{{ top_data.quick_order_total || 0 }}</span>笔
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="home-t-item">
				<div class="d-b-s border-b home-titem-t">
					<div>
						<div class="f20 gray3 mb6">
							退单额<span class="f13 gray9">(元)</span>
							<el-popover placement="top-start" :width="200" trigger="hover" :content="'已退款金额'">
								<template #reference>
									<el-icon class="f18" color="#DDD">
										<QuestionFilled />
									</el-icon>
								</template>
							</el-popover>
						</div>
						<div class="fb f24 gray3">
							{{ $numTCN(top_data.refund_money || 0) }}
						</div>
					</div>
					<div class="today-icon">今</div>
				</div>
				<div class="home-titem-b gray9">
					<div class="f13">
						退单笔数<span class="ml10">{{ top_data.refund_total || 0 }}</span>笔
					</div>
				</div>
			</div>
			<div class="home-t-item">
				<div class="d-b-s border-b home-titem-t">
					<div>
						<div class="f20 gray3 mb6">
							菜品数<span class="f13 gray9">(个)</span>
							<el-popover placement="top-start" :width="200" trigger="hover" :content="'门店店内商品和外卖商品数量'">
								<template #reference>
									<el-icon class="f18" color="#DDD">
										<QuestionFilled />
									</el-icon>
								</template>
							</el-popover>
						</div>
						<div class="fb f24 gray3">{{ top_data.product_total || 0 }}</div>
					</div>
					<div class="today-icon">今</div>
				</div>
				<div class="home-titem-b gray9">
					<div class="f13">
						菜品新增
						<span class="ml10">{{ top_data.today_product_total || 0 }}</span>个
					</div>
				</div>
			</div>
		</div>
		<div class="d-b-s">
			<div class="home-center">
				<div class="">
					<div class="f18 gray3 fb title-before">统计概况</div>
					<div class="home-cr-left d-s-c pt20">
						<el-radio-group v-model="search_time_type" @change="timeClick()">
							<el-radio-button :value="1">今日</el-radio-button>
							<el-radio-button :value="2">昨日</el-radio-button>
							<el-radio-button :value="3">7日内</el-radio-button>
							<el-radio-button :value="4">自定义</el-radio-button>
						</el-radio-group>
						<span class="mr10 ml10 f14" style="color: #333333" v-if="search_time_type == 4">统计时间</span>
						<div class="" v-if="search_time_type == 4">
							<el-date-picker v-model="searchTimeDate" class="ww220" type="daterange"
								value-format="YYYY-MM-DD" range-separator="~" start-placeholder="开始日期"
								end-placeholder="结束日期" @change="changeTime2"></el-date-picker>
						</div>
						<button class="clearbtn ml10" v-if="search_time_type == 4" @click="clear">
							清空
						</button>
					</div>
				</div>
				<div class="d-b-s home-c-l border-b ww100">
					<img class="h-c-icon" src="/static/imgs/icon/sy01.png" alt="" />
					<div class="flex-1">
						<div class="f20 mb16">
							总收入<span class="gray9 f13">(元)</span>
							<el-popover placement="top-start" :width="200" trigger="hover"
								:content="'已付款订单实际支付金额总和(包含三方券)'">
								<template #reference>
									<el-icon class="f18" color="#DDD">
										<QuestionFilled />
									</el-icon>
								</template>
							</el-popover>
						</div>
						<div class="price-red f24 fb">
							{{ $numTCN(top_data.income_money || 0) }}
						</div>
					</div>
				</div>
				<div class="flex-1 home-c-r">
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy02.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">现金</div>
							<div class="gray3 f18">
								{{ $numTCN(top_data.show_money || 0) }}
							</div>
							<div class="f16 gray9">
								退款金额:<span style="color: #f4463b">{{ $numTCN(top_data.refund_show_money || 0) }}</span>
							</div>
						</div>
					</div>
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy04.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">支付宝</div>
							<div class="gray3 f18">
								{{ $numTCN(top_data.alipay_money || 0) }}
							</div>
							<div class="f16 gray9">
								退款金额:<span
									style="color: #f4463b">{{ $numTCN(top_data.refund_alipay_money || 0) }}</span>
							</div>
						</div>
					</div>
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy02.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">微信</div>
							<div class="gray3 f18">{{ $numTCN(top_data.wx_money || 0) }}</div>
							<div class="f16 gray9">
								退款金额:<span style="color: #f4463b">{{ $numTCN(top_data.refund_wx_money || 0) }}</span>
							</div>
						</div>
					</div>
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy05.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">其他</div>
							<div class="gray3 f18">
								{{ $numTCN(top_data.other_money || 0) }}
							</div>
							<div class="f16 gray9">
								退款金额:<span style="color: #f4463b">{{ $numTCN(top_data.refund_other_money || 0) }}</span>
							</div>
						</div>
					</div>
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy06.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">余额</div>
							<div class="gray3 f18">
								{{ $numTCN(top_data.balance_money || 0) }}
							</div>
							<div class="f16 gray9">
								退款金额:<span
									style="color: #f4463b">{{ $numTCN(top_data.refund_balance_money || 0) }}</span>
							</div>
						</div>
					</div>
					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy08.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">抖音</div>
							<div class="gray3 f18">{{ $numTCN(top_data.dy_money || 0) }}</div>
							<div class="f16 gray9">
								退款金额:<span style="color: #f4463b">{{ 0 }}</span>
							</div>
						</div>
					</div>

					<div class="d-b-s home-c-ritem">
						<img class="h-c-icon" src="/static/imgs/icon/sy07.png" alt="" />
						<div class="flex-1">
							<div class="f16 gray9">美团</div>
							<div class="gray3 f18">{{ $numTCN(top_data.mt_money || 0) }}</div>
							<div class="f16 gray9">
								退款金额:<span style="color: #f4463b">{{ 0 }}</span>
							</div>
						</div>
					</div>
					<!-- <div class="d-b-s home-c-ritem">
            <img class="h-c-icon" src="/static/imgs/icon/sy09.png" alt="" />
            <div class="flex-1">
              <div class="f16 gray9">退款</div>
              <div class="gray3 f18">
                {{ $numTCN(top_data.total_refund_money || 0) }}
              </div>
            </div>
          </div> -->
				</div>
			</div>
			<div class="home-cr">
				<div class="home-cr-left d-b-c">
					<div class="f18 gray3 fb title-before">菜品排行榜TOP 10</div>
					<el-radio-group v-model="time_type" @change="timeClick()">
						<el-radio-button :value="1">近一周</el-radio-button>
						<el-radio-button :value="2">近30天</el-radio-button>
						<el-radio-button :value="3">本月</el-radio-button>
						<el-radio-button :value="4">本年</el-radio-button>
					</el-radio-group>
				</div>
				<el-table class="rank-table" :data="tableData" @sort-change="sortChange">
					<el-table-column align="center" prop="index" label="排名" width="80">
						<template #default="scope">
							<div class="rankball" :class="'rankball_' + scope.$index">
								{{ scope.$index + 1 }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="product_name" label="商品名称"></el-table-column>
					<el-table-column align="center" sortable="custom" prop="total_num" label="销量"
						width="120"></el-table-column>
					<el-table-column align="center" sortable="custom" prop="total_price" label="销售额"
						width="120"></el-table-column>
				</el-table>
			</div>
		</div>
	</div>
</template>

<script>
	import IndexApi from "@/api/index.js";
	export default {
		data() {
			return {
				time_type: 1,
				search_time_type: 1,
				tableData: [],
				searchTimeDate: [],
				top_data: {},
				type: 0,
			};
		},
		mounted() {
			this.getData();
		},
		methods: {
			changeTime2(val) {
				if (val && val.length === 2) {
					this.acteStartDate = val[0];
					this.acteEndDate = val[1];
					this.getData();
				} else {
					delete this.acteStartDate;
					delete this.acteEndDate;
				}
			},
			clear() {
				this.searchTimeDate = [];
				this.getData()
			},
			sortChange(column) {
				console.log(column);
				//判断排序规则
				if (column.order) {
					/* 降序 */
					if (column.order === "descending") {
						/*  */
						if (column.prop == "total_price") {
							this.type = 4;
							console.log("销售额降序");
						} else {
							this.type = 2;
							console.log("销量降序");
						}
					} /* 升序*/
					else if (column.order === "ascending") {
						if (column.prop == "total_price") {
							this.type = 3;
							console.log("销售额升序");
						} else {
							this.type = 1;
							console.log("销量升序");
						}
					}
				} else {
					this.type = 0;
				}
				//调用查询list接口
				this.getData();
			},
			/*获取数据*/
			getData() {
				let self = this;
				let Params = {
					time: self.time_type,
					type: self.type,
					search_time_type: self.search_time_type,
					searchTimeDate: self.searchTimeDate
				};
				IndexApi.baseData(Params, true)
					.then((res) => {
						self.top_data = res.data.data.top_data;
						self.tableData = res.data.data.product_data.salesNumRank;
					})
					.catch((error) => {
						// self.loading = false;
					});
			},
			timeClick() {
				this.getData();
			},
		},
	};
</script>

<style lang="scss">
	.clearbtn {
		width: 62px;
		height: 32px;
		background: #67c23a;
		border-radius: 5px;
		color: #ffffff;
		border: 1px solid #67c23a;
	}

	.home-box {
		height: calc(100vh - 87px);
		padding: 12px;
		box-sizing: border-box;

		.home-top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;

			.home-t-item {
				flex: 1;
				margin-right: 12px;
				background-color: #fff;
				padding: 10px 15px;
				height: 156px;

				.home-titem-t {
					padding-bottom: 6px;

					.today-icon {
						width: 30px;
						height: 30px;
						color: #fff;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 16px;
						background-color: #ffa500;
						border-radius: 5px;
					}
				}

				.home-titem-b {
					padding-top: 10px;
				}
			}

			.home-t-item:last-child {
				margin-right: 0;
			}
		}

		.home-center {
			background-color: #fff;
			padding: 32px 20px 120px 20px;
			margin-bottom: 15px;
			width: 696px;
			margin-right: 12px;
			// flex: 1;
			box-sizing: border-box;
			flex-shrink: 0;

			.home-c-l {
				// width: 215px;
				// flex-shrink: 0;
				padding-bottom: 20px;
				margin-bottom: 60px;
			}

			.home-c-r {
				position: relative;
				// padding-left: 52px;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				flex-wrap: wrap;

				.home-c-ritem {
					width: 33.3%;
					flex-shrink: 0;
					display: flex;
					margin-bottom: 26px;
				}
			}

			.h-c-icon {
				width: 40px;
				height: 40px;
				margin-right: 10px;
				display: block;
				border-radius: 50%;
			}
		}
	}

	.home-cr {
		background-color: #fff;
		padding: 25px 26px;
		flex-shrink: 0;
		// width: 688px;
		flex: 1;
		box-sizing: border-box;
	}

	.price-red {
		color: #f4463b;
	}

	.rank-table {
		.rankball {
			width: 24px;
			height: 24px;
			background: #d0d0d0;
			border-radius: 50%;
			font-size: 14px;
			font-weight: bold;
			color: #fff;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto;
		}

		.rankball_0 {
			background: #ebca80;
		}

		.rankball_1 {
			background: #abb4c7;
		}

		.rankball_2 {
			background: #ccb3a0;
		}
	}

	.home-cr-left {
		margin-bottom: 20px;
	}

	#app .el-table.rank-table .cell {
		font-weight: 400;
		font-size: 13px;
		color: #333;
	}

	.el-table .ascending .sort-caret.ascending {
		border-bottom-color: #67c23a;
	}

	.el-table.rank-table .descending .sort-caret.descending {
		border-top-color: #67c23a;
	}
</style>