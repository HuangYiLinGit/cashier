<template>
	<el-dialog title="会员注册" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
		:close-on-press-escape="false" width="600" class="dialog-search">
		<el-form ref="form" :model="form" :rules="formRules">
			<el-form-item label="" prop="real_name">
				<div class="d-b-c ww100">
					<el-input placeholder="请输入姓名(必填)" v-model="form.real_name"
						class="input-with-select flex-1 mr20"></el-input>
					<el-radio-group fill="#409eff" v-model="form.gender" size="large">
						<el-radio-button label="女" :value="0" />
						<el-radio-button label="男" :value="1" />
						<el-radio-button label="保密" :value="2" />
					</el-radio-group>
				</div>
			</el-form-item>
			<el-form-item label="" prop="mobile">
				<el-input placeholder="请输入手机号(必填)" v-model="form.mobile" class="input-with-select"></el-input>
			</el-form-item>
			<el-form-item label="">
				<el-select v-model="form.grade_id" placeholder="请选择默认会员等级" size="large" class="mb10">
					<el-option v-for="(item,index) in gradeList" :key="index" :label="item.name"
						:value="item.grade_id" />
				</el-select>
			</el-form-item>
			<el-form-item label="">
				<el-date-picker v-model="form.birthday" type="date" placeholder="请选择生日" style="width: 100%;"
					class="mb10" />
			</el-form-item>

			<div class="d-c-c">
				<el-button class="btn-left" round size="large" @click="handleClose">取消</el-button>
				<el-button class="btn-right" type="primary" round size="large" @click="onSubmit"
					:loading="loading">提交</el-button>
			</div>
		</el-form>
	</el-dialog>
</template>

<script>
	import UserApi from '@/api/user.js';
	import {
		useUserStore
	} from '@/store';
	const {
		setMember,
		removeMember
	} = useUserStore();
	export default {
		components: {},
		data() {
			return {
				loading: false,
				form: {
					real_name: '',
					gender: 0,
					mobile: '',
					grade_id: '',
					birthday: ''
				},
				dialogVisible: false,
				phone: '',
				memberInfo: null,
				memberList: [],
				gradeList: [],
				formRules: {
					real_name: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					mobile: [{
						required: true,
						message: '请输入手机号',
						trigger: 'blur'
					}],
				},
			};
		},
		props: {
			isPop: Boolean
		},
		watch: {
			isPop: function(n, o) {
				if (n != o) {
					this.dialogVisible = n;
					if (n) {
						this.getGrade();
					}

				}
			}
		},
		methods: {
			onSubmit() {
				let self = this;
				let form = self.form;
				console.log(form)
				// form.reward_data = self.form.reward_data;
				self.$refs.form.validate((valid) => {
					if (valid) {
						self.loading = true;
						UserApi.registerUser(form, true).then(data => {
								self.loading = false;
								ElMessage({
									message: data.msg,
									type: 'success'
								});
								self.handleClose();
							})
							.catch(error => {
								self.loading = false;
							});
					}
				});
			},
			getGrade() {
				let self = this;
				UserApi.getGradeList({}, true).then(res => {
						self.gradeList = res.data.list;
						self.form.grade_id = self.gradeList[0].grade_id;
					})
					.catch(error => {});
			},
			handleClose(e) {
				this.$emit('close', e);
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

	.btn-left {
		padding: 0 32px;
		min-width: 120px;
		box-sizing: border-box;
	}

	.btn-right {
		padding: 0 32px;
		min-width: 120px;
		box-sizing: border-box;
	}
</style>