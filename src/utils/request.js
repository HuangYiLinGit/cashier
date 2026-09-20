import axios from 'axios';
import qs from 'qs';
import router from '@/router';
import configObj from "@/config";
import { useUserStore } from "@/store";
import { getDecryptedToken, setEncryptedToken } from './base';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const IS_APP = Capacitor.isNativePlatform();

let { baseURL, tokenName, contentType, withCredentials, responseType } = configObj;

axios.defaults.headers['Content-Type'] = contentType; //配置请求头
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = withCredentials;
axios.defaults.responseType = responseType;

// ========== 原生请求封装 ==========
async function nativeRequest(method, url, data, headers = {}) {
  const userStore = useUserStore();
  const { token, userInfo } = userStore;

  const fullUrl = url.startsWith('http') ? url : baseURL + url;

  const mergedHeaders = {
    'Content-Type': contentType,
    'Authori-Zation': token ? `Bearer ${token}` : '',
    'AppID': userInfo && userInfo.AppID,
    ...headers,
  };

  const options = {
    url: fullUrl,
    headers: mergedHeaders,
  };

  if (method === 'POST' && data) {
    options.data = data;
  } else if (method === 'GET' && data) {
    options.params = data;
  }

  const res = method === 'POST'
    ? await CapacitorHttp.post(options)
    : await CapacitorHttp.get(options);

  if (res.status !== 200) {
    ElMessage({ showClose: true, message: '接口请求异常，请稍后再试~', type: 'error' });
    return Promise.reject(res);
  }

  // 处理token自动续期
  const newToken = res.headers['authori-zation'];
  if (newToken && newToken.startsWith('Bearer ')) {
    const tokenValue = newToken.substring(7);
    userStore.setToken(tokenValue);
  }

  // 处理响应
  if (res.data.code !== 1) {
    if (res.data.code === 0) {
      ElMessage({ showClose: true, message: res.data.msg, type: 'error' });
      return Promise.reject(res.data);
    } else if (res.data.code) {
      userStore.afterLogout();
      router.push({ path: '/login' });
    }
  } else {
    return res.data;
  }
}

//POST传参序列化(添加请求拦截器)
axios.interceptors.request.use((config) => {
  //在发送请求之前做某件事
  const userStore = useUserStore();
	const { token, userInfo } = userStore;

  // 使用新的Authorization请求头格式
  if (token) {
    config.headers['Authori-Zation'] = `Bearer ${token}`;
  }
  config.headers["AppID"] = userInfo && userInfo.AppID;

  if (config.method === 'post' && !config.headers.uploadImg) {
    config.data = qs.stringify(config.data);
  }
  return config;
}, (error) => {
  console.log('错误的传参')
  return Promise.reject(error);
});

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use((res) => {
  // 检查响应头中的新token（自动续期）
  const newToken = res.headers['authori-zation'];
  if (newToken && newToken.startsWith('Bearer ')) {
    const token = newToken.substring(7);
    const userStore = useUserStore();
    userStore.setToken(token);
  }

  //未登陆
  if (res.data.code !== 1) {
    console.log('未登录状态')
    if(res.data.code === 0){
		ElMessage({
			showClose: true,
			message: res.data.msg,
			type: "error",
		});
      return Promise.reject(res.data);
    }else if(res.data.code){
		const userStore = useUserStore();
		const { afterLogout } = userStore;
		afterLogout();
		router.push({
			path: '/login',
		})
    }
  }else{
    return res.data;
  }
}, (error) => {
	ElMessage({
		showClose: true,
		message: '接口请求异常，请稍后再试~',
		type: "error"
	});
  return Promise.reject(error);
});

/**
 * 返回一个Promise(发送post请求)
 * errorback是否错误回调
 */
export function _post(url, params, errorback) {
  if (IS_APP) {
    return nativeRequest('POST', url, params).catch((e) => {
      errorback && Promise.reject(e);
    });
  }
  return new Promise((resolve, reject) => {
    axios.post(url, params)
      .then(response => {
        resolve(response);
      })
      .catch((error) => {
        errorback && reject(error);
      })
  })
}

/**
 * 返回一个Promise(发送get请求)
 * errorback是否错误回调
 */
export function _get(url, param, errorback) {
  if (IS_APP) {
    return nativeRequest('GET', url, param).catch((e) => {
      errorback && Promise.reject(e);
    });
  }
  return new Promise((resolve, reject) => {
    axios.get(url, {
        params: param
      })
      .then(response => {
        resolve(response)
      })
      .catch((error) => {
        errorback && reject(error);
      })
  })
}
/**
 * 返回一个Promise(发送上传请求)
 * errorback是否错误回调
 */
export function _upload(url, formData, errorback)
{
    return new Promise((resolve, reject) =>
    {
        let headers = {
          "Content-Type": "multipart/form-data",
          "uploadImg": true,
        }
        axios.post(url, formData, { headers })
            .then(response =>
            {
                resolve(response);
            })
            .catch((error) =>
            {
                reject(error);
            })
    })
}
export default {
  _post,
  _get,
  _upload
}
