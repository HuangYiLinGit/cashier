<template>
	<div>
		<div class="gray6 f12 mb10">请输入会员手机号查询会员，输入完毕后点击确认</div>
		<el-input placeholder="请输入会员手机号" v-model="phone" class="input-with-select mb30">
			<template #append>
				<el-button class="search-btn" icon="Search" style="cursor: auto;"></el-button>
			</template>
		</el-input>
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
</template>

<script>
	import UserApi from '@/api/user.js';
	import keyboard from '@/components/keyboard/keyboard.vue';
	import {
		useUserStore
	} from '@/store';
	const {
		setMember,
		removeMember
	} = useUserStore();
	export default {
		components: {
			keyboard
		},
		data() {
			return {
				memberInfo: null,
				selectId: 0,
				selectModel: null,
				memberList:[],
				phone:''
			}
		},
		created() {
			let {
				memberInfo
			} = useUserStore();
			this.memberInfo = memberInfo;
			if (this.memberInfo) {
				this.getDetail();
			}
		},
		methods: {
			handleClose(e) {
				this.$emit('close', e);
			},
			addNum(n) {
				this.phone += n;
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
			loginout() {
				this.memberInfo = null;
				removeMember();
				// this.$store.commit('user/setmember', null);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.mb30 {
		margin-bottom: 30px;
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
			margin-right: 20px;
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
	}
</style>