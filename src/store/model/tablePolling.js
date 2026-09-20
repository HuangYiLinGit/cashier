import { defineStore } from 'pinia';
import PollingManager from '@/utils/polling';
import { ElMessage } from 'element-plus';

export const useTablePollingStore = defineStore('tablePolling', {
  state: () => ({
    pollingManager: null,
    tableList: [],
    typeList: [],
    currentTableDetail: null,
    cartData: null,
    pollingStatus: {
      tableList: false,
      tableDetail: false,
      cart: false
    }
  }),

  getters: {
    getTableById: (state) => (tableId) => {
      return state.tableList.find(table => table.table_id === tableId);
    },

    isPollingActive: (state) => (type) => {
      return state.pollingStatus[type];
    }
  },

  actions: {
    initPolling() {
      if (!this.pollingManager) {
        this.pollingManager = new PollingManager({
          baseInterval: 3000,
          maxInterval: 30000,
          minInterval: 2000,
          enableAdaptive: true,
          enableVisibility: true
        });
        console.log('[TablePolling] PollingManager已初始化');
      }
    },

    startTableListPolling(params) {
      this.initPolling();

      if (this.pollingStatus.tableList) {
        console.warn('[TablePolling] 桌台列表轮询已在运行');
        return;
      }

      this.pollingManager.startPolling('table_list', {
        url: '/cashier/store.table/table',
        params: params,
        interval: 5000,
        onUpdate: (data) => {
          const changedTables = this.detectTableStatusChange(data.list || []);

          // 只在有重要状态变化时才提示（静默更新其他变化）
          if (changedTables.length > 0) {
            console.log('[TablePolling] 桌台状态变化:', changedTables);
            // 可选：只在特定状态变化时才显示消息
            // ElMessage({
            //   message: `${changedTables.length}个桌台状态已更新`,
            //   type: 'info',
            //   duration: 2000
            // });
          }

          this.updateTableList(data.list || []);
          this.updateTypeList(data.typeList || []);
        },
        onError: (error, errorCount) => {
          console.error('[TablePolling] 桌台列表轮询失败:', error);

          // 第一次失败时静默处理
          if (errorCount === 1) {
            console.log('[TablePolling] 首次请求失败，将自动重试');
          }
          // 第二次失败时提示用户（针对500等服务器错误）
          else if (errorCount === 2 && error?.response?.status >= 500) {
            ElMessage({
              message: '服务器异常，请稍后手动刷新',
              type: 'warning',
              duration: 3000
            });
          }
        },
        onFatalError: (error, errorCount) => {
          // 服务器错误导致停止轮询时的通知
          ElMessage({
            message: '数据加载失败，请点击刷新按钮重试',
            type: 'error',
            duration: 0,
            showClose: true
          });
          this.pollingStatus.tableList = false;
        }
      });

      this.pollingStatus.tableList = true;
      console.log('[TablePolling] 桌台列表轮询已启动');
    },

    startTableDetailPolling(tableId, params = {}) {
      this.initPolling();

      const key = `table_detail_${tableId}`;

      this.pollingManager.startPolling(key, {
        url: '/cashier/order.HallCart/detail',
        params: { table_id: tableId, ...params },
        interval: 3000,
        onUpdate: (data) => {
          // 提取 detail 字段（API 返回结构可能是 { data: { detail: {...} } }）
          const detail = data.detail || data;
          const hasChanged = this.hasOrderChanged(detail);

          if (hasChanged) {
            console.log('[TablePolling] 订单详情已更新');
          }

          // 添加 table_id 到数据中
          this.updateTableDetail({ ...detail, table_id: tableId });
        },
        onError: (error, errorCount) => {
          console.error(`[TablePolling] 桌台${tableId}详情轮询失败:`, error);

          // 详情轮询失败时静默处理，不影响用户体验
          if (errorCount >= 2 && error?.response?.status >= 500) {
            console.warn(`[TablePolling] 桌台${tableId}详情获取失败，已停止更新`);
          }
        },
        onFatalError: (error, errorCount) => {
          // 服务器错误导致停止详情轮询时，静默处理
          console.error(`[TablePolling] 桌台${tableId}详情轮询已停止`);
          this.pollingStatus.tableDetail = false;
        }
      });

      this.pollingStatus.tableDetail = true;
      console.log(`[TablePolling] 桌台${tableId}详情轮询已启动`);
    },

    startCartPolling(tableId, params = {}) {
      this.initPolling();

      const key = `cart_${tableId}`;

      this.pollingManager.startPolling(key, {
        url: '/cashier/order.HallCart/list',
        params: { table_id: tableId, ...params },
        interval: 3000,
        onUpdate: (data) => {
          if (this.hasCartChanged(data)) {
            ElMessage({
              message: '购物车已更新',
              type: 'success',
              duration: 2000
            });
          }

          this.updateCartData(data);
        },
        onError: (error, errorCount) => {
          console.error(`[TablePolling] 桌台${tableId}购物车轮询失败:`, error);

          // 购物车轮询失败时静默处理
          if (errorCount >= 2 && error?.response?.status >= 500) {
            console.warn(`[TablePolling] 桌台${tableId}购物车获取失败，已停止更新`);
          }
        },
        onFatalError: (error, errorCount) => {
          // 服务器错误导致停止购物车轮询时，静默处理
          console.error(`[TablePolling] 桌台${tableId}购物车轮询已停止`);
          this.pollingStatus.cart = false;
        }
      });

      this.pollingStatus.cart = true;
      console.log(`[TablePolling] 桌台${tableId}购物车轮询已启动`);
    },

    stopTableListPolling() {
      if (this.pollingManager) {
        this.pollingManager.stopPolling('table_list');
        this.pollingStatus.tableList = false;
        console.log('[TablePolling] 桌台列表轮询已停止');
      }
    },

    stopTableDetailPolling(tableId) {
      if (this.pollingManager) {
        this.pollingManager.stopPolling(`table_detail_${tableId}`);
        this.pollingStatus.tableDetail = false;
        console.log(`[TablePolling] 桌台${tableId}详情轮询已停止`);
      }
    },

    stopCartPolling(tableId) {
      if (this.pollingManager) {
        this.pollingManager.stopPolling(`cart_${tableId}`);
        this.pollingStatus.cart = false;
        console.log(`[TablePolling] 桌台${tableId}购物车轮询已停止`);
      }
    },

    stopAllPolling() {
      if (this.pollingManager) {
        this.pollingManager.stopAll();
        this.pollingStatus = {
          tableList: false,
          tableDetail: false,
          cart: false
        };
        console.log('[TablePolling] 所有轮询已停止');
      }
    },

    triggerManualPoll(key) {
      if (this.pollingManager) {
        this.pollingManager.triggerPoll(key);
      }
    },

    updateTableList(list) {
      this.tableList = list;
    },

    updateTypeList(list) {
      const hasChanged = this.hasTypeCountChanged(list);
      if (hasChanged) {
        console.log('[TablePolling] 桌台类型数量已变化');
      }
      this.typeList = list;
    },

    updateTableDetail(data) {
      this.currentTableDetail = data;
    },

    updateCartData(data) {
      this.cartData = data;
    },

    detectTableStatusChange(newList) {
      if (!this.tableList || this.tableList.length === 0) {
        return [];
      }

      const changedTables = [];

      newList.forEach(newTable => {
        const oldTable = this.tableList.find(t => t.table_id === newTable.table_id);
        if (oldTable && oldTable.status !== newTable.status) {
          changedTables.push({
            table_id: newTable.table_id,
            table_no: newTable.table_no,
            oldStatus: oldTable.status,
            newStatus: newTable.status
          });
        }
      });

      return changedTables;
    },

    hasOrderChanged(newData) {
      if (!this.currentTableDetail) return true;

      const oldDetail = this.currentTableDetail;

      if (oldDetail.product_num !== newData.product_num) return true;
      if (oldDetail.total_price !== newData.total_price) return true;
      if (oldDetail.pay_status?.value !== newData.pay_status?.value) return true;

      return false;
    },

    hasCartChanged(newData) {
      if (!this.cartData) return true;

      const oldCart = this.cartData;

      // 修复：API返回的数据结构是 { productList: [...], cartInfo: {...} }
      // 而不是直接的 { cart_total_num, total_price, cart_list }
      const oldCartInfo = oldCart.cartInfo || oldCart;
      const newCartInfo = newData.cartInfo || newData;
      const oldProductList = oldCart.productList || oldCart.cart_list || [];
      const newProductList = newData.productList || newData.cart_list || [];

      if (oldCartInfo.cart_total_num !== newCartInfo.cart_total_num) return true;
      if (oldCartInfo.total_price !== newCartInfo.total_price) return true;
      if (oldProductList.length !== newProductList.length) return true;

      return false;
    },

    hasTypeCountChanged(newTypeList) {
      if (!this.typeList || this.typeList.length === 0) return false;

      for (let i = 0; i < newTypeList.length; i++) {
        const oldType = this.typeList.find(t => t.type_id === newTypeList[i].type_id);
        if (oldType && oldType.num !== newTypeList[i].num) {
          return true;
        }
      }

      return false;
    },

    getPollingStatus() {
      if (this.pollingManager) {
        return this.pollingManager.getStatus();
      }
      return {};
    }
  }
});
