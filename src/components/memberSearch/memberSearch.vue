<template>
	<el-dialog title="查询会员" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
		:close-on-press-escape="false" width="80%" class="dialog-search">
		<div class="dialog-content">
			<!-- <div v-if="!$store.state.user.member"> -->
			<div v-if="!memberInfo">
				<el-button class="res-btn" type="primary" size="large" icon="Plus"
					@click="isPop = true">注册会员</el-button>
				<el-input placeholder="请输入会员手机号" v-model="phone" class="input-with-select mb10">
					<template #append>
						<el-button class="search-btn" icon="Search" style="cursor: auto;"></el-button>
					</template>
				</el-input>
				<div class="gray6 f12 mb10 tl">请输入会员手机号查询会员，输入完毕后点击确认</div>
				<keyboard v-if="memberList == ''" @addNum="addNum" @confirm="submitFunc"></keyboard>
				<template v-else>
					<div class="member-list">
						<div class="member-item d-s-c" v-for="(item,index) in memberList" :key="index"
							:class="{active:selectId == item.user_id}" @click="selectItem(item)">
							<div class="flex-1 d-s-c">
								<span class="fb">{{item.mobile}} </span>({{item.nickName}}/
								<span>{{item.reg_name}}</span>/
								<span v-if="item.gender == 0">女</span>
								<span v-if="item.gender == 1">男</span>
								<span v-if="item.gender == 2">保密</span>
								)
							</div>
							<el-icon :size="14" color="#FFA500" v-if="selectId == item.user_id">
								<Check />
							</el-icon>
						</div>
					</div>
					<div class="d-c-c cash-drawer-btn">
						<button class="close-btn border" @click="clearFunc()">撤回</button>
						<button class="pay-btn" @click="confirmFunc">确认</button>
					</div>
				</template>

			</div>
			<div v-else class="mt20">
				<div class="d-b-c border f16 bg-white" style="border-bottom: none;">
					<div class="border-r p20">会员昵称</div>
					<!-- <div class="flex-1 p20" style="color: #f4463b;text-align: left;">{{ $store.state.user.member.nickName }}</div> -->
					<div class="flex-1 p20" style="color: #f4463b;text-align: left;">{{ memberInfo.nickName }}</div>
				</div>
				<div class="d-b-c border f16 bg-white">
					<div class="border-r p20">余额总计</div>
					<div class="flex-1 p20" style="text-align: left;">{{ memberInfo.balance }}</div>
				</div>
				<div class="d-c-c cash-drawer-btn">
					<button class="close-btn border" @click="loginout()">退出</button>
					<button class="pay-btn" @click="handleClose">确认</button>
				</div>
			</div>
		</div>
		<register :isPop="isPop" @close="closeRegister"></register>
	</el-dialog>
</template>

<script>
	import UserApi from '@/api/user.js';
	import keyboard from '@/components/keyboard/keyboard.vue';
	import register from '@/components/memberSearch/register.vue';
	import {
		useUserStore
	} from '@/store';
	const {
		setMember,
		removeMember
	} = useUserStore();
	export default {
		components: {
			keyboard,
			register
		},
		data() {
			return {
				dialogVisible: false,
				phone: '',
				memberInfo: null,
				memberList: [],
				selectId: 0,
				selectModel: null,
				isPop: false
			};
		},
		props: {
			is_search: Boolean
		},
		watch: {
			is_search: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						let {
							memberInfo
						} = useUserStore();
						this.memberInfo = memberInfo;
						if (this.memberInfo) {
							this.getDetail();
						}
					}

				}
			}
		},
		methods: {
			closeRegister(e) {
				this.isPop = false;
			},
			handleClose(e) {
				this.$emit('close', e);
			},
			addNum(n) {
				this.phone += n;
			},
			loginout() {
				this.memberInfo = null;
				removeMember();
        //新增一个触发事件
        this.$emit("delCart")
				// this.$store.commit('user/setmember', null);
			},
			clearFunc() {
				this.phone = '';
				this.memberList = [];
				this.selectId = 0;
				this.selectModel = null;
			},
			confirmFunc(e) {
				setMember(this.selectModel);
				this.memberInfo = this.selectModel;
				this.getDetail();
				this.phone = '';
				this.memberList = [];
				this.selectId = 0;
				this.selectModel = null;
			},
			selectItem(e) {
				this.selectId = e.user_id;
				this.selectModel = e;
			},
			getDetail() {
				let self = this;
				UserApi.getmemberDetail({
						user_id: self.memberInfo.user_id
					}, true).then(res => {
						self.memberInfo = res.data.detail;
						setMember(this.memberInfo);
					})
					.catch(error => {});
			},
			submitFunc(n) {
				let self = this;
				if (n == 'clear') {
					this.phone = '';
				} else {
					if (self.phone == '') {
						ElMessage.error('请输入会员手机号');
						return;
					}
					UserApi.getmember({
								mobile: self.phone
							},
							true
						)
						.then(res => {
							if (res.data.list.length > 0) {
								self.memberList = res.data.list;
								self.selectItem(self.memberList[0]);
							} else {
								ElMessage.error('该用户不存在');
							}
						})
						.catch(error => {});
					// this.$emit('close', this.phone);
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.mb30 {
		margin-bottom: 30px;
	}

	.dialog-search {
		.el-dialog {
			background: #fbfaf8;
			box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.25);
			border-radius: 5px;
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

	.member-list {
		width: 100%;
		background: rgba(#2CC3B4, 0.1);

		.member-item {
			font-size: 14px;
			padding: 20px;
		}

		.member-item.active {
			color: #FFA500;
		}
	}

	.cash-drawer-btn {
		margin-top: 20px;
	}

	.cash-drawer-btn .close-btn {
		margin-right: 20px;
	}

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

	.res-btn {
		display: block;
		margin-bottom: 10px;
	}
</style>