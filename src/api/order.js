import request from '@/utils/request'

let orderApi = {

	/*基础配置*/
	getList(data, errorback) {
		return request._post('/cashier/order.order/index', data, errorback);
	},
	/*基础配置*/
	settle(data, errorback) {
		return request._post('/cashier/order.order/settle', data, errorback);
	},
	/*基础配置*/
	refund(data, errorback) {
		return request._post('/cashier/order.order/refund', data, errorback);
	},
	print(data, errorback) {
		return request._post('/cashier/order.order/print', data, errorback);
	},
	/*退菜*/
	moveProduct(data, errorback) {
		return request._post('/cashier/order.order/moveProduct', data, errorback);
	},
	paySuccess(data, errorback) {
		return request._get('/cashier/order.order/detail', data, errorback);
	},
	payFunc(data, errorback) {
		return request._post('/cashier/order.Order/pay', data, errorback);
	},
	extractDetail(data, errorback) {
		return request._post('/cashier/order.Order/extractDetail', data, errorback);
	},
	groupDetail(data, errorback) {
		return request._get('/cashier/order.Order/groupDetail', data, errorback);
	},
	groupReceipt(data, errorback) {
		return request._post('/cashier/order.Order/receipt', data, errorback);
	},
	extract(data, errorback) {
		return request._post('/cashier/order.Order/extract', data, errorback);
	},
	cartAddGroup(data, errorback) {
		return request._post('/cashier/order.cart/addGroup', data, errorback);
	},
	hallCartAddGroup(data, errorback) {
		return request._post('/cashier/order.hallCart/addGroup', data, errorback);
	},
}

export default orderApi;