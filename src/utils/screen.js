// src/utils/screen.js
import { Capacitor, registerPlugin } from '@capacitor/core'

// 注册 MultiScreen 插件
const MultiScreen = registerPlugin('MultiScreen', {
  showOnSecondaryScreen: function (options) {
    return Promise.resolve({ success: false, message: 'Plugin not available' })
  },
  updateSecondaryContent: function (options) {
    return Promise.resolve()
  },
  closeSecondaryScreen: function () {
    return Promise.resolve()
  },
  isSecondaryScreenAvailable: function () {
    return Promise.resolve({ available: false, message: 'Plugin is unavailable' })
  },
  isWebViewReallyAvailable: function () {
    return Promise.resolve({ available: false, message: 'WebView is not supported' })
  },
  sendToSecondaryScreen: function (options) {
    return Promise.resolve()
  },
  sendToMainScreen: function (options) {
    return Promise.resolve()
  },
  sendPrint: function (options) {
    return Promise.resolve()
  },
  checkVersion: function (options) {
    return Promise.resolve({ needUpdate: false })
  },
  downloadAPK: function (options) {
    return Promise.resolve()
  },
  hideInputMethod() {
    return Promise.resolve()
  },
  showInputMethod() {
    return Promise.resolve()
  },
  checkZhengYuanPos: function () {
    return Promise.resolve({ available: false, message: 'POS machine is unavailable' })
  },
  zhengYuanPosPay: function (options) {
    return Promise.resolve({ status: false, message: 'Plugin not available', data: {} })
  },
  cancelZhengYuanPosPay: function (options) {
    return Promise.resolve({ status: false, message: 'Plugin not available', data: {} })
  },
  zhengYuanPosRefund: function (options) {
    return Promise.resolve({ status: false, message: 'Plugin not available', data: {} })
  },
  // ===================== 扫码相关方法 =====================
  startScan: function (options) {
    return Promise.resolve({ code: '', type: options?.type || 'product' })
  },
  addListener: function () {
    return { remove: () => {} }
  },
})

// 获取当前环境的URL
function getBaseUrl() {
  if (import.meta.env.DEV) {
    return window.location.origin
  } else {
    return 'file:///android_asset/public/index.html'
  }
}

export const ScreenService = {
  // ===================== 环境检测 =====================

  /** 检查是否在 App 原生环境中运行 */
  async checkIsApp() {
    return Capacitor.isNativePlatform()
  },

  /** 检查副屏是否可用 */
  async checkAvailability() {
    try {
      const result = await MultiScreen.isSecondaryScreenAvailable()
      return result.available
    } catch (error) {
      console.error('检查副屏可用性失败:', error)
      return false
    }
  },

  /** 检查 WebView 是否可用 */
  async checkWebViewAvailable() {
    try {
      const result = await MultiScreen.isWebViewReallyAvailable()
      return result.available
    } catch (error) {
      console.error('检查 WebView 可用性失败:', error)
      return false
    }
  },

  // ===================== 副屏管理 =====================

  /** 初始化副屏（检查环境 → 检查可用性 → 打开） */
  async initCapacitorSecondary(route) {
    try {
      if (
        (await ScreenService.checkIsApp()) &&
        (await ScreenService.checkAvailability()) &&
        (await ScreenService.checkWebViewAvailable())
      ) {
        await ScreenService.openSecondaryScreen(route)
      }
      return true
    } catch (error) {
      console.error('初始化失败:', error)
      return false
    }
  },

  /** 打开副屏并加载指定路由 */
  async openSecondaryScreen(route) {
    try {
      const { available } = await MultiScreen.isSecondaryScreenAvailable()
      if (!available) {
        window.alert('无可用副屏')
        return false
      }
      const url = `${getBaseUrl()}#${route}`
      const result = await MultiScreen.showOnSecondaryScreen({ url })
      return result.success
    } catch (error) {
      if (
        error &&
        (error.message?.includes('WebView not available') ||
          error.message?.includes('System WebView is not supported'))
      ) {
        window.alert(
          '您的设备未安装或禁用了系统WebView组件，无法正常展示网页内容。\n\n' +
            '请到应用市场安装或启用"Android System WebView"或"Chrome 浏览器"，然后重试。'
        )
      } else {
        window.alert('副屏启动失败: ' + (error.message || error))
      }
      console.error('副屏启动失败:', error)
      return false
    }
  },

  /** 更新副屏内容（切换路由） */
  async updateSecondaryContent(route) {
    try {
      const url = `${getBaseUrl()}#${route}`
      await MultiScreen.updateSecondaryContent({ url })
      return true
    } catch (error) {
      console.error('副屏内容更新失败:', error)
      return false
    }
  },

  /** 关闭副屏 */
  async closeSecondaryScreen() {
    try {
      await MultiScreen.closeSecondaryScreen()
      return true
    } catch (error) {
      console.error('副屏关闭失败:', error)
      return false
    }
  },

  // ===================== 消息通信 =====================

  /** 主屏 → 副屏 发送消息 */
  async sendToSecondary(msg) {
    try {
      const payload = typeof msg === 'string' ? msg : JSON.stringify(msg)
      await MultiScreen.sendToSecondaryScreen({ message: payload })
      return true
    } catch (e) {
      console.error('主屏发消息到副屏失败', e)
      return false
    }
  },

  /** 副屏 → 主屏 发送消息 */
  async sendToMain(msg) {
    try {
      const payload = typeof msg === 'string' ? msg : JSON.stringify(msg)
      await MultiScreen.sendToMainScreen({ message: payload })
      return true
    } catch (e) {
      console.error('副屏发消息到主屏失败', e)
      return false
    }
  },

  /** 主屏监听副屏消息（只在主屏使用） */
  onMainMessage(cb) {
    if (typeof MultiScreen.addListener === 'function') {
      MultiScreen.addListener('onMainMessage', (data) => {
        let parsed
        try {
          parsed = JSON.parse(data.message)
        } catch (e) {
          parsed = data.message
        }
        cb && cb(parsed)
      })
    }
  },

  // ===================== 打印 =====================

  /** 发送打印任务 */
  async onPrint(msg) {
    try {
      const payload = typeof msg === 'string' ? msg : JSON.stringify(msg)
      await MultiScreen.sendPrint({ param: payload })
      return true
    } catch (e) {
      console.error('打印错误', e)
      return false
    }
  },

  // ===================== 版本更新 =====================

  /**
   * 检查是否需要更新
   * @param {{ versionCode: number }} version
   * @returns {Promise<boolean>}
   */
  async checkVersion(version) {
    try {
      const result = await MultiScreen.checkVersion({ version })
      return result.needUpdate
    } catch (error) {
      console.error('版本检查失败:', error)
      return false
    }
  },

  /** 下载并安装新版 APK */
  async downloadAPK(version) {
    try {
      await MultiScreen.downloadAPK({ version })
      return true
    } catch (error) {
      console.error('APK 下载失败:', error)
      return false
    }
  },

  // ===================== 输入法控制 =====================

  /** 隐藏输入法，禁止软键盘弹出 */
  async hideInputMethod() {
    try {
      await MultiScreen.hideInputMethod()
      return true
    } catch (e) {
      console.error('hideInputMethod 失败', e)
      return false
    }
  },

  /** 显示输入法，允许软键盘弹出 */
  async showInputMethod() {
    try {
      await MultiScreen.showInputMethod()
      return true
    } catch (e) {
      console.error('showInputMethod 失败', e)
      return false
    }
  },

  // ===================== POS 机 =====================

  /** 检查正元 POS 机是否在线 */
  async checkZhengYuanPos() {
    try {
      const result = await MultiScreen.checkZhengYuanPos()
      return result.available
    } catch (error) {
      console.error('POS 检测失败:', error)
      return false
    }
  },

  /**
   * 正元 POS 支付
   * @param {{ amount: number, orderIndex?: number }} data
   *   amount     - 支付金额，单位：分
   *   orderIndex - 订单序号（可选，默认 1）
   * @returns {Promise<{ status: boolean, message: string, data: object }>}
   *   成功时 data 包含：amount, balanceAfter, discount, manageFee,
   *                      orderId, siteNo, terminalSeq,
   *                      name, phone, account, personalNo, physicalCard, txTime
   */
  async zhengYuanPosPay(data) {
    try {
      const result = await MultiScreen.zhengYuanPosPay(data)
      return result
    } catch (error) {
      console.error('POS 支付失败:', error)
      return { status: false, message: error?.message || '支付异常', data: {} }
    }
  },

  /**
   * 撤销正元 POS 支付（0xC3）
   * 仅限支付完成后、结算前使用；已结算请用 zhengYuanPosRefund
   *
   * orderId 由 Native 侧通过 posOrderMap 自动查找，前端只需传 orderIndex + amount
   *
   * @param {{ orderIndex?: number, amount: number }} data
   *   orderIndex - 原支付时的订单序号（默认 1，需与支付时一致）
   *   amount     - 原支付金额，单位：分（必须与原支付金额完全一致）
   * @returns {Promise<{ status: boolean, message: string, data: object }>}
   */
  async cancelZhengYuanPosPay(data) {
    try {
      if (!data?.amount || data.amount <= 0) {
        return { status: false, message: 'amount 必须大于 0（单位：分）', data: {} }
      }
      const result = await MultiScreen.cancelZhengYuanPosPay({
        orderIndex: data.orderIndex ?? 1,
        amount: data.amount,
      })
      return result
    } catch (error) {
      console.error('POS 撤销失败:', error)
      return { status: false, message: error?.message || '撤销异常', data: {} }
    }
  },

  /**
   * 正元 POS 退款（已结算订单使用）
   * @param {{ originalOrderId: string, amount: number, orderIndex?: number }} data
   *   originalOrderId - 原支付订单号，16位HEX（来自 zhengYuanPosPay 返回的 data.orderId）
   *   amount          - 退款金额，单位：分
   *   orderIndex      - 订单序号（可选，默认 1）
   * @returns {Promise<{ status: boolean, message: string, data: object }>}
   */
  async zhengYuanPosRefund(data) {
    try {
      if (!data?.originalOrderId || data.originalOrderId.length !== 16) {
        return { status: false, message: 'originalOrderId 必须是16位HEX字符串', data: {} }
      }
      if (!data?.amount || data.amount <= 0) {
        return { status: false, message: 'amount 必须大于 0（单位：分）', data: {} }
      }
      const result = await MultiScreen.zhengYuanPosRefund({
        originalOrderId: data.originalOrderId,
        amount: data.amount,
        orderIndex: data.orderIndex ?? 1,
      })
      return result
    } catch (error) {
      console.error('POS 退款失败:', error)
      return { status: false, message: error?.message || '退款异常', data: {} }
    }
  },

  // ===================== 扫码功能 =====================

  /**
   * 扫码类型枚举
   */
  ScanType: {
    PRODUCT: 'product', // 商品搜索（69码）
    PAYMENT: 'payment', // 扫码支付（微信/支付宝）
  },

  /**
   * 检查扫码功能是否可用
   * @returns {Promise<boolean>}
   */
  async checkScannerAvailable() {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('当前在 Web 环境，原生扫码功能不可用')
        return true
      }
      return typeof MultiScreen !== 'undefined'
    } catch (error) {
      console.error('检查扫码功能失败:', error)
      return false
    }
  },

  /**
   * 主动触发扫码（如果设备支持）
   * @param {Object} options - 配置项
   * @param {string} options.type - 扫码类型: 'product' | 'payment'
   * @returns {Promise<{ code: string, type: string }>}
   */
  async startScan(options = {}) {
    try {
      const scanType = options.type || this.ScanType.PRODUCT
      const result = await MultiScreen.startScan({ type: scanType })
      return {
        code: result.code || '',
        type: result.type || scanType,
      }
    } catch (error) {
      console.error('启动扫码失败:', error)
      // Web 环境降级处理
      if (!Capacitor.isNativePlatform()) {
        const code = prompt(`请输入模拟扫码内容 (${options.type || 'product'}):`) || ''
        return { code, type: options.type || this.ScanType.PRODUCT }
      }
      throw error
    }
  },

  /**
   * 监听扫码结果（推荐使用）
   * @param {Function} callback - 回调函数 (result: { code: string, type: string }) => void
   * @param {Object} options - 配置项
   * @param {string} options.type - 监听的扫码类型: 'product' | 'payment' | 'all'
   * @returns {Promise<{ remove: Function }>}
   */
  async addScanListener(callback, options = {}) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('callback 必须是函数')
      }

      const filterType = options.type || 'all'

      const listener = await MultiScreen.addListener('scanResult', (result) => {
        console.log('📱 收到扫码事件:', result)

        // 类型过滤
        if (filterType !== 'all' && result.type !== filterType) {
          console.log(`⏭️ 跳过类型: ${result.type}, 期望: ${filterType}`)
          return
        }

        callback(result)
      })

      console.log(`✅ 扫码监听已注册 (类型: ${filterType})`)
      return listener
    } catch (error) {
      console.error('❌ 注册扫码监听失败:', error)
      return { remove: () => {} }
    }
  },

  /**
   * 移除所有扫码监听
   * @returns {Promise<void>}
   */
  async removeAllScanListeners() {
    try {
      // MultiScreen 的 addListener 返回的监听器对象有 remove 方法
      // 这里不需要特殊处理，由调用方保存 listener 并调用 remove()
      console.log('✅ 请调用监听器的 remove() 方法移除监听')
    } catch (error) {
      console.error('❌ 移除扫码监听失败:', error)
    }
  },

  /**
   * 便捷方法：一次性扫码（扫完自动移除监听）
   * @param {Object} options - 配置项
   * @param {string} options.type - 扫码类型: 'product' | 'payment'
   * @param {number} options.timeout - 超时时间（毫秒），默认 30000ms
   * @returns {Promise<{ code: string, type: string }>}
   */
  async scanOnce(options = {}) {
    const { type = this.ScanType.PRODUCT, timeout = 30000 } = options

    return new Promise((resolve, reject) => {
      let listener = null
      let timer = null

      const cleanup = async () => {
        if (timer) clearTimeout(timer)
        if (listener) await listener.remove()
      }

      // 超时处理
      timer = setTimeout(async () => {
        await cleanup()
        reject(new Error('扫码超时'))
      }, timeout)

      // 添加监听
      this.addScanListener(
        async (result) => {
          await cleanup()
          resolve(result)
        },
        { type }
      ).then((l) => {
        listener = l
      })
    })
  },

  /**
   * 识别扫码类型（根据内容自动判断）
   * @param {string} code - 扫码内容
   * @returns {string} 'product' | 'payment' | 'unknown'
   */
  detectScanType(code) {
    if (!code) return 'unknown'

    // 微信支付码: 18位数字，前缀 10-15
    if (/^1[0-5]\d{16}$/.test(code)) {
      return this.ScanType.PAYMENT
    }

    // 支付宝付款码: 25-30位数字，前缀 25-30
    if (/^[2-3][0-9]\d{23,28}$/.test(code)) {
      return this.ScanType.PAYMENT
    }

    // 商品条形码: 8位、13位、14位数字（EAN-8, EAN-13, ITF-14）
    if (/^(\d{8}|\d{13}|\d{14})$/.test(code)) {
      return this.ScanType.PRODUCT
    }

    // 默认返回商品类型
    return this.ScanType.PRODUCT
  },
}
