import request from '@/utils/request'

let IndexApi = {

	/*基础配置*/
	base(data, errorback) {
		return request._post('/cashier/index/base', data, errorback);
	},

	/*商城首页*/
	getCount(data, errorback) {
		return request._post('/cashier/Index/index', data, errorback);
	},
	/*商城首页*/
	baseData(data, errorback) {
		return request._post('/cashier/Index/baseData', data, errorback);
	},
	/*获取版本信息*/
	getVersion(errorback) {
		return request._post('/cashier/index/get_cashier_version', {}, errorback);
	},
}

export default IndexApi;