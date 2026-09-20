import request from '@/utils/request'

let UserApi = {
	/*用户登录*/
	login(data, errorback) {
		return request._post('/cashier/passport/login', data, errorback);
	},
	/*修改密码*/
	editPassword(data, errorback) {
		return request._post('/cashier/admin.user/renew', data, errorback);
	},
	/*退出登录*/
	loginOut(data, errorback) {
		return request._post('/cashier/passport/logout', data, errorback);
	},
	/*获取版本*/
	getVersion(data, errorback) {
		return request._post('/cashier/index/index', data, errorback);
	},
	/*获取版本*/
	getmember(data, errorback) {
		return request._post('/cashier/user.User/index', data, errorback);
	},
	getmemberDetail(data, errorback) {
		return request._get('/cashier/user.User/detail', data, errorback);
	},
	getExtendType(data, errorback) {
		return request._get('/cashier/index/extendType', data, errorback);
	},
	getPlan(data, errorback) {
		return request._get('/cashier/user.Plan/index', data, errorback);
	},
	buyPlan(data, errorback) {
		return request._post('/cashier/user.Plan/buy', data, errorback);
	},
	planDetail(data, errorback) {
		return request._get('/cashier/user.Plan/detail', data, errorback);
	},
	getCoupon(data, errorback) {
		return request._get('/cashier/user.User/coupon', data, errorback);
	},
	getBalance(data, errorback) {
		return request._get('/cashier/user.User/balance', data, errorback);
	},
	getPoints(data, errorback) {
		return request._get('/cashier/user.User/points', data, errorback);
	},
	getGradeList(data, errorback) {
		return request._get('/cashier/user.User/gradeList', data, errorback);
	},
	registerUser(data, errorback) {
		return request._post('/cashier/user.User/register', data, errorback);
	},
}

export default UserApi;