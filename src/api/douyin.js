import request from '@/utils/request'

/**
 * 抖音团购核销API
 */

/**
 * 验券准备 - 扫码解析
 */
export function prepare(data) {
  return request._post('/cashier/douyin.verify/prepare', data, true)
}

/**
 * 确认核销
 */
export function verify(data) {
  return request._post('/cashier/douyin.verify/verify', data,true)
}
