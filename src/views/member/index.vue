<template>
	<div class="home-container">
		<template v-if="memberInfo">
			<div class="d-s-c ww100 hh100 tab-nav">
				<el-button class="mr20 ml0" :type="activeType == 0?'danger':'info'" round @click="changeType(0)"><span
						class="f14">会员信息</span></el-button>
				<el-button class="mr20 ml0" :type="activeType == 1?'danger':'info'" round @click="changeType(1)"><span
						class="f14">优惠券</span></el-button>
				<el-button class="mr20 ml0" :type="activeType == 2?'danger':'info'" round @click="changeType(2)"><span
						class="f14">储值变更明细</span></el-button>
				<el-button class="mr20 ml0" :type="activeType == 3?'danger':'info'" round @click="changeType(3)"><span
						class="f14">积分明细</span></el-button>
				<!-- <el-button class="mr20 ml0" :type="activeType == 4?'danger':'info'" round @click="changeType(4)"><span
						class="f14">会员卡明细</span></el-button> -->
			</div>
			<recharge v-if="activeType == 0" @loginout="loginout"></recharge>
			<coupon v-if="activeType == 1"></coupon>
			<balance v-if="activeType == 2"></balance>
			<points v-if="activeType == 3"></points>
		</template>
		<div class="d-c d-c-c login-content" v-else>
			<div class="f18 fb gray3">查询会员</div>
			<div class="f13 gray3 member-tips">请点击此处跳转查询会员，获取更多信息！</div>
			<div class="member-btn" @click="isMember = true">立即查询</div>
		</div>
		<memberSearch :is_search="isMember" @close="closeSearch"></memberSearch>
	</div>
</template>

<script>
	import memberSearch from '@/components/memberSearch/memberSearch.vue';
	import recharge from './part/recharge.vue';
	import coupon from './part/coupon.vue';
	import balance from './part/balance.vue';
	import points from './part/points.vue';
	import UserApi from '@/api/user.js';
	import {
		useUserStore
	} from '@/store';
	const {
		setMember,
		removeMember
	} = useUserStore();
	export default {
		components: {
			memberSearch,
			recharge,
			coupon,
			balance,
			points,
		},
		data() {
			return {
				memberInfo: null,
				activeType: 0,
				isMember: false
			}
		},
		mounted() {
			this.getInfo();
		},
		methods: {
			changeType(e) {
				this.activeType = e;
			},
			getInfo() {
				let {
					memberInfo
				} = useUserStore();
				this.memberInfo = memberInfo;
				console.log(this.memberInfo)
				if (this.memberInfo) {
					this.getDetail();
				}
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
			closeSearch(e) {
				console.log(e);
				this.isMember = false;
				this.getInfo();
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
	.tab-nav {
		height: 62px;
		background: #FFFFFF;
		padding-left: 10px;
	}

	.home-container {
		height: calc(100vh - 87px);
		display: flex;
		flex-direction: column;
	}

	.login-content {
		height: calc(100vh - 87px);
	}

	.member-tips {
		margin: 18px 0 27px 0;
	}

	.member-btn {
		width: 202px;
		height: 46px;
		background: linear-gradient(0deg, #409EFF, #409EFF);
		border-radius: 23px;
		font-size: 16px;
		color: #FFFFFF;
		line-height: 46px;
		text-align: center;
		margin-bottom: 140px;
		cursor: pointer;
	}
</style>