import { _post } from './request';

/**
 * 智能轮询管理器（PC端）
 * 用于替代WebSocket的轮询方案
 */
class PollingManager {
  constructor(config = {}) {
    this.config = {
      baseInterval: config.baseInterval || 3000,
      maxInterval: config.maxInterval || 30000,
      minInterval: config.minInterval || 2000,
      enableAdaptive: config.enableAdaptive !== false,
      enableVisibility: config.enableVisibility !== false,
      ...config
    };

    this.tasks = new Map();
    this.lastData = new Map();
    this.consecutiveNoChange = new Map();
    this.consecutiveErrors = new Map();
    this.isPageVisible = true;

    this.init();
  }

  init() {
    if (this.config.enableVisibility) {
      this.setupVisibilityListener();
    }
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      console.log('[Polling] 页面可见性变化:', this.isPageVisible);

      if (this.isPageVisible) {
        this.tasks.forEach((task, key) => {
          this.pollOnce(key);
        });
      }
    });
  }

  startPolling(key, options = {}) {
    if (this.tasks.has(key)) {
      console.warn(`[Polling] 轮询任务 ${key} 已存在`);
      return;
    }

    const config = {
      url: options.url,
      params: options.params || {},
      interval: options.interval || this.config.baseInterval,
      onUpdate: options.onUpdate || (() => {}),
      onError: options.onError || (() => {}),
      onFatalError: options.onFatalError || null,
      compareFunc: options.compareFunc || null
    };

    console.log(`[Polling] 开始轮询任务: ${key}, 间隔: ${config.interval}ms`);

    this.consecutiveNoChange.set(key, 0);
    this.consecutiveErrors.set(key, 0);

    this.pollOnce(key, config);

    const timer = setInterval(() => {
      this.pollOnce(key, config);
    }, this.calculateInterval(key, config.interval));

    this.tasks.set(key, { timer, config, baseInterval: config.interval });
  }

  async pollOnce(key, config) {
    if (!config) {
      const task = this.tasks.get(key);
      if (!task) return;
      config = task.config;
    }

    try {
      // 使用全局封装的 _post，确保 token、baseURL、拦截器等生效
      // errorback 设为 true，确保错误能被 catch 捕获
      const response = await _post(config.url, config.params, true);

      // 注意：_post 已经通过响应拦截器处理
      // 响应拦截器在 request.js line 64 返回 res.data
      // 所以这里的 response 可能是：
      // 1. 标准格式: { code: 1, data: {...} }
      // 2. 直接的数据对象（各种API返回的数据）
      let newData = null;
      let isSuccess = false;

      if (response && response.code === 1) {
        // 标准格式: { code: 1, data: {...} }
        // 如果有 data 字段，提取 data；否则使用整个 response
        newData = response.data || response;
        isSuccess = true;
      } else if (response && typeof response === 'object') {
        // 直接返回数据对象（任何非标准格式的API）
        newData = response;
        isSuccess = true;
      }

      if (isSuccess && newData) {
        const hasChanged = this.hasDataChanged(key, newData, config.compareFunc);

        if (hasChanged) {
          this.consecutiveNoChange.set(key, 0);
          this.consecutiveErrors.set(key, 0);
          config.onUpdate(newData);
        } else {
          const count = this.consecutiveNoChange.get(key) || 0;
          this.consecutiveNoChange.set(key, count + 1);
        }

        this.lastData.set(key, newData);
      }
    } catch (error) {
      const errorCount = (this.consecutiveErrors.get(key) || 0) + 1;
      this.consecutiveErrors.set(key, errorCount);

      // 判断错误类型
      const is500Error = error?.response?.status === 500;
      const isServerError = error?.response?.status >= 500;

      console.error(`[Polling] 轮询失败 ${key} (${errorCount}次):`, error?.response?.status || 'Network Error');
      config.onError(error, errorCount);

      // 500错误或服务器错误：快速熔断（2次失败即停止）
      if (isServerError && errorCount >= 2) {
        console.warn(`[Polling] 任务 ${key} 遭遇服务器错误(${error?.response?.status})，立即停止轮询`);
        this.stopPolling(key);
        // 通知用户
        if (typeof config.onFatalError === 'function') {
          config.onFatalError(error, errorCount);
        }
      }
      // 网络错误：允许更多重试（5次）
      else if (errorCount >= 5) {
        console.warn(`[Polling] 任务 ${key} 连续失败5次，暂停轮询`);
        this.pausePolling(key);
      }
    }
  }

  hasDataChanged(key, newData, compareFunc) {
    const oldData = this.lastData.get(key);
    if (!oldData) return true;

    if (compareFunc) {
      return compareFunc(oldData, newData);
    }

    try {
      return JSON.stringify(oldData) !== JSON.stringify(newData);
    } catch (e) {
      return true;
    }
  }

  calculateInterval(key, baseInterval) {
    if (!this.config.enableAdaptive) {
      return baseInterval;
    }

    const noChangeCount = this.consecutiveNoChange.get(key) || 0;
    const errorCount = this.consecutiveErrors.get(key) || 0;

    let interval = baseInterval;

    // 数据连续无变化时，逐步降低轮询频率
    if (noChangeCount > 10) {
      interval = Math.min(interval * 2, this.config.maxInterval);
    } else if (noChangeCount > 5) {
      interval = Math.min(interval * 1.5, this.config.maxInterval);
    } else if (noChangeCount > 3) {
      interval = Math.min(interval * 1.2, this.config.maxInterval);
    }

    // 网络错误时，增加重试间隔
    if (errorCount >= 3) {
      interval = Math.min(interval * 2, this.config.maxInterval);
    }

    // 页面不可见时，降低轮询频率
    if (!this.isPageVisible) {
      interval = Math.min(interval * 3, this.config.maxInterval);
    }

    return Math.max(interval, this.config.minInterval);
  }

  stopPolling(key) {
    const task = this.tasks.get(key);
    if (task) {
      clearInterval(task.timer);
      this.tasks.delete(key);
      this.lastData.delete(key);
      this.consecutiveNoChange.delete(key);
      this.consecutiveErrors.delete(key);
      console.log(`[Polling] 停止轮询任务: ${key}`);
    }
  }

  stopAll() {
    console.log('[Polling] 停止所有轮询任务');
    this.tasks.forEach((task, key) => {
      clearInterval(task.timer);
    });
    this.tasks.clear();
    this.lastData.clear();
    this.consecutiveNoChange.clear();
    this.consecutiveErrors.clear();
  }

  pausePolling(key) {
    const task = this.tasks.get(key);
    if (task && task.timer) {
      clearInterval(task.timer);
      task.timer = null;
      console.log(`[Polling] 暂停轮询任务: ${key}`);
    }
  }

  resumePolling(key) {
    const task = this.tasks.get(key);
    if (task && !task.timer) {
      this.consecutiveErrors.set(key, 0);

      this.pollOnce(key);

      task.timer = setInterval(() => {
        this.pollOnce(key);
      }, task.baseInterval);

      console.log(`[Polling] 恢复轮询任务: ${key}`);
    }
  }

  triggerPoll(key) {
    const task = this.tasks.get(key);
    if (task) {
      console.log(`[Polling] 手动触发轮询: ${key}`);
      this.pollOnce(key);
    }
  }

  getStatus() {
    const status = {};
    this.tasks.forEach((task, key) => {
      status[key] = {
        active: !!task.timer,
        interval: task.baseInterval,
        noChangeCount: this.consecutiveNoChange.get(key) || 0,
        errorCount: this.consecutiveErrors.get(key) || 0
      };
    });
    return status;
  }
}

export default PollingManager;
