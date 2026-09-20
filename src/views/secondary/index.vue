<template>
  <div class="secondary-view">
    <div class="content">
      <div class="order-table">
        <el-table :data="tableData" :show-header="false" empty-text=" ">
          <el-table-column type="index" align="center">
            <template #default="scope">
              <span class="f30">{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="product_name" label="商品名称">
            <template #default="scope">
              <div class="f36">{{ scope.row.product.product_name }}</div>
              <div class="gray9 f24" v-if="scope.row.is_group != 20">
                {{ scope.row.describe }}
              </div>
              <div
                class="gray9 f24"
                v-if="scope.row.is_group == 20"
                v-for="(item, index) in scope.row.describe"
                :key="index">
                <div class="gray9 f24">
                  x{{ item.product_num }} {{ item.product_name }}{{ item.describe }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="商品价格">
            <template #default="scope">
              <div class="pro-price">
                <span class="red f30">￥{{ scope.row.price }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="right" prop="total_num" label="商品数量">
            <template #default="scope">
              <div class="pro-num">
                <span class="f30">x {{ scope.row.product_num }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="statistics p20">
      <div>应收：￥{{ cartInfo.total_price || '0.00' }}元</div>
      <div class="mr20" v-if="model.delivery == 30">包装费：￥{{ cartInfo.total_bag_price }}元</div>
      <div class="price-color">优惠：￥{{ cartInfo.discount_money || '0.00' }}元</div>
      <div>数量 {{ cartInfo.cart_total_num }} 件</div>
      <div>
        实收：
        <span class="price-color f28 fb">￥</span>
        <span class="price-color f52 fb">{{ cartInfo.total_pay_price }}</span>
        元
      </div>
    </div>
  </div>
</template>

<script>
import { ScreenService } from '@/utils/screen'

export default {
  data() {
    return {
      tableData: [],
      cartInfo: {
        total_price: '0.00',
        total_bag_price: '0.00',
        discount_money: '0.00',
        cart_total_num: 0,
        total_pay_price: '0.00'
      },
      model: {
        delivery: null
      }
    }
  },
  mounted() {
    // 注册方法以接收主屏消息
    if (ScreenService.checkIsApp() && ScreenService.checkAvailability()) {
      window.onSecondaryMessage = msg => {
        let mainMessageData = JSON.parse(msg)
        const {
          tableData = [],
          cartInfo = {
            total_price: '0.00',
            total_bag_price: '0.00',
            discount_money: '0.00',
            cart_total_num: 0,
            total_pay_price: '0.00'
          },
          model = {
            delivery: null
          }
        } = mainMessageData
        this.tableData = tableData
        this.cartInfo = cartInfo
        this.model = model
      }
    }
  },
  beforeUnmount() {
    // 组件销毁时清理
    if (window.onSecondaryMessage) window.onSecondaryMessage = null
  }
}
</script>

<style lang="scss" scoped>
.secondary-view {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100vh;
  background-color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    .order-table {
      color: black;
      .pro-price {
        width: calc(50% + 80px);
        float: right;
      }
      .pro-num {
        padding-right: 30px;
        float: right;
      }
    }
    :deep(.el-table) {
      .cell {
        line-height: normal !important;
      }
    }
  }

  .statistics {
    width: 500px;
    font-size: 28px;
    background-color: #ecf5ff;
    div {
      height: 80px;
      line-height: 80px;
    }
  }
}

.f24 {
  font-size: 24px;
}
.f28 {
  font-size: 28px;
}
.f30 {
  font-size: 30px;
}
.f36 {
  font-size: 36px;
}
.f52 {
  font-size: 52px;
}
.mr20 {
  margin-right: 20px;
}
.price-color {
  color: #f4463b;
}
</style>
