<template>
  <div class="douyin-verify-container">
    <el-card class="verify-card">
      <template #header>
        <div class="card-header">
          <span class="title">抖音团购核销</span>
          <el-button type="text" @click="handleBack">返回</el-button>
        </div>
      </template>

      <div v-loading="loading" class="verify-content">
        <!-- 券码信息 -->
        <el-descriptions title="券码信息" :column="2" border>
          <el-descriptions-item label="抖音订单号">
            {{ douyinOrderId }}
          </el-descriptions-item>
          <el-descriptions-item label="券码状态">
            <el-tag type="success">待核销</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名称" :span="2">
            {{ certificate.sku_title }}
          </el-descriptions-item>
          <el-descriptions-item label="券码金额">
            ￥{{ certificate.pay_amount }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ certificate.expire_time }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 系统商品信息 -->
        <div class="product-section" v-if="productDetail">
          <div class="section-heading">
            <div>
              <div class="section-title">系统商品信息</div>
              <div class="section-subtitle">当前券码已匹配到以下系统商品，确认无误后可核销。</div>
            </div>
            <el-tag v-if="isGroupProduct" type="warning">套组商品</el-tag>
            <el-tag v-else type="success">普通商品</el-tag>
          </div>
          <div class="product-info">
            <div class="product-image">
              <img v-if="productDetail.productImage" :src="productDetail.productImage" alt="商品图片" />
            </div>
            <div class="product-details">
              <div class="product-name">{{ productDetail.product_name }}</div>
              <div class="product-price">￥{{ productDetail.product_price }}</div>
              <div class="product-meta">
                <span v-if="selectedSkuText">规格：{{ selectedSkuText }}</span>
                <span v-if="productAttrText">属性：{{ productAttrText }}</span>
                <span v-if="productFeedText">加料：{{ productFeedText }}</span>
              </div>
            </div>
          </div>

          <!-- 规格选择（多规格商品） -->
          <div v-if="productDetail.spec_type == 20 && productDetail.sku_list && productDetail.sku_list.length > 0" class="selection-section">
            <div class="selection-title">选择规格</div>
            <div class="attr-list">
              <div
                v-for="(item, index) in productDetail.sku_list"
                :key="index"
                class="attr-item"
                :class="{ active: selectedSkuId == item.product_sku_id }"
                @click="selectSpec(item)"
              >
                {{ item.spec_name || '默认' }} ￥{{ item.product_price }}
              </div>
            </div>
          </div>

          <!-- 属性选择 -->
          <div
            v-if="productDetail.product_attr_list && productDetail.product_attr_list.length > 0"
            class="selection-section"
          >
            <div
              v-for="(attrItem, attrIndex) in productDetail.product_attr_list"
              :key="attrIndex"
              class="attr-group"
            >
              <div class="selection-title">{{ attrItem.attribute_name || attrItem.attributeName }}</div>
              <div class="attr-list">
                <template v-for="(item, index) in (attrItem.attribute_value || attrItem.attributeValue)" :key="index">
                  <div
                    v-if="item"
                    class="attr-item"
                    :class="{ active: selectedAttrs[attrIndex] == index }"
                    @click="selectAttr(attrIndex, index, item)"
                  >
                    {{ item }}
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 加料选择 -->
          <div
            v-if="productDetail.product_feed && productDetail.product_feed.length > 0"
            class="selection-section"
          >
            <div class="selection-title">选择加料（可多选）</div>
            <div class="feed-list">
              <div
                v-for="(feedItem, feedIndex) in productDetail.product_feed"
                :key="feedIndex"
                class="feed-item"
                :class="{ active: selectedFeeds.includes(feedItem.feed_name) }"
                @click="toggleFeed(feedItem)"
              >
                <span>{{ feedItem.feed_name }}</span>
                <span class="feed-price">+￥{{ feedItem.price }}</span>
              </div>
            </div>
          </div>

          <!-- 套餐选择（套组商品） -->
          <div v-if="isGroupProduct" class="selection-section group-selection-section">
            <div class="group-section-header">
              <div>
                <div class="selection-title">套餐内容</div>
                <div class="selection-tip">
                  <template v-if="hasGroupData">
                    已选择 {{ groupData.length }} 个商品，共 {{ groupTotalNum }} 份
                  </template>
                  <template v-else>请先配置本次核销对应的套餐内容</template>
                </div>
              </div>
              <el-button type="primary" plain @click="openGroupSelector">
                {{ hasGroupData ? "修改套餐内容" : "配置套餐内容" }}
              </el-button>
            </div>
            <div v-if="hasGroupData" class="group-summary">
              <div
                v-for="group in groupedSelectedGroups"
                :key="group.groupId"
                class="group-card"
              >
                <div class="group-card-header">
                  <span>{{ group.groupName }}</span>
                  <span>{{ group.selectedNum }}/{{ group.selectNum }}</span>
                </div>
                <div
                  v-for="(item, index) in group.items"
                  :key="`${group.groupId}-${item.productSkuId}-${index}`"
                  class="group-item"
                >
                  <div class="group-item-main">
                    <div class="group-item-name">{{ item.productName }}</div>
                    <div v-if="formatGroupItemDesc(item)" class="group-item-desc">
                      {{ formatGroupItemDesc(item) }}
                    </div>
                  </div>
                  <div class="group-item-extra">
                    <span>x{{ item.productNum }}</span>
                    <span v-if="formatGroupItemPrice(item)">+￥{{ formatGroupItemPrice(item) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="group-empty">
              <el-empty description="尚未配置套餐内容" :image-size="72" />
            </div>
          </div>

          <!-- 库存提示 -->
          <div v-if="stockInfo" class="stock-section">
            <el-alert
              :title="stockInfo.message"
              :type="stockInfo.enough ? 'success' : 'error'"
              :closable="false"
              show-icon
            />
          </div>
        </div>

        <!-- 未配置商品映射 -->
        <div v-else class="no-product-section">
          <el-alert
            title="该券码未配置系统商品映射"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <div>请联系管理员在后台配置抖音商品与系统商品的映射关系</div>
            </template>
          </el-alert>
        </div>

        <!-- 桌台信息 -->
        <div v-if="tableNo" class="table-section">
          <el-descriptions title="桌台信息" :column="2" border>
            <el-descriptions-item label="桌台号">
              {{ tableNo }}
            </el-descriptions-item>
            <el-descriptions-item label="就餐人数">
              {{ mealNum }}人
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 订单备注 -->
        <div class="remark-section">
          <div class="section-title">订单备注</div>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="请输入订单备注（选填）"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button size="large" @click="handleBack">取消</el-button>
          <el-button
            type="primary"
            size="large"
            @click="handleVerify"
            :disabled="!canVerify"
            :loading="verifying"
          >
            确认核销
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 套组商品选择弹窗 -->
    <GoodsDetail
      v-if="showGroupSelector"
      :productModel="groupProductModel"
      :selectOnly="true"
      :selectedGroupData="groupData"
      @close="handleGroupSelectorClose"
    />
  </div>
</template>

<script>
import * as DouyinApi from "@/api/douyin.js";
import HomeApi from "@/api/home.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store";
import GoodsDetail from "@/views/home/part/goodsDetail.vue";

const DOUYIN_VERIFY_CACHE_MAX_AGE = 10 * 60 * 1000;

export default {
  name: "DouyinVerify",
  components: {
    GoodsDetail,
  },
  data() {
    return {
      loading: false,
      verifying: false,
      verifyToken: "",
      douyinOrderId: "",
      poiId: "",
      certificate: {},
      shopSupplierId: "",
      tableId: 0,
      tableNo: "",
      mealNum: 0,
      productDetail: null,
      selectedSkuId: 0,
      selectedAttrs: [],
      selectedAttrNames: [],
      selectedFeeds: [],        // 选中的加料
      remark: "",
      stockInfo: null,
      userInfo: null,
      showGroupSelector: false,
      groupProductModel: null,
      groupData: [],
      verifyKey: "",
    };
  },
  computed: {
    isGroupProduct() {
      return this.productDetail && this.productDetail.is_group == 20;
    },
    hasGroupData() {
      return this.groupData && this.groupData.length > 0;
    },
    groupTotalNum() {
      if (!this.hasGroupData) {
        return 0;
      }
      return this.groupData.reduce((total, item) => total + Number(item.productNum || 0), 0);
    },
    selectedSkuText() {
      if (!this.productDetail) {
        return "";
      }
      if (this.productDetail.spec_type == 20 && this.productDetail.sku_list) {
        const sku = this.productDetail.sku_list.find(item => item.product_sku_id == this.selectedSkuId);
        return sku ? sku.spec_name || "默认" : "";
      }
      if (this.productDetail.productSku) {
        return this.productDetail.productSku.spec_name || "默认";
      }
      return "";
    },
    productAttrText() {
      return this.selectedAttrNames.filter((item) => item).join("；");
    },
    productFeedText() {
      return this.selectedFeeds.join("、");
    },
    groupedSelectedGroups() {
      if (!this.productDetail || !this.productDetail.selectData || !this.hasGroupData) {
        return [];
      }

      // 调试：打印分组数据
      console.log('selectData 原始数据:', this.productDetail.selectData);
      console.log('groupData:', this.groupData);

      return this.productDetail.selectData.map((group) => {
        const items = this.groupData.filter(item => item.groupId === group.group_id);
        const selectedNum = items.reduce((total, item) => total + Number(item.productNum || 0), 0);

        // 调试：打印每个分组的数据
        console.log('分组数据:', {
          group_id: group.group_id,
          name: group.name,
          select_num: group.select_num,
          items: items
        });

        return {
          groupId: group.group_id,
          groupName: group.name || "套餐分组",
          selectNum: group.select_num || 0,
          selectedNum,
          items,
        };
      }).filter(group => group.items.length > 0);
    },
    isGroupSelectionComplete() {
      if (!this.isGroupProduct) {
        return true;
      }
      if (!this.productDetail.selectData || this.productDetail.selectData.length === 0) {
        return false;
      }
      return this.productDetail.selectData.every((group) => {
        const selectedNum = this.groupData
          .filter(item => item.groupId === group.group_id)
          .reduce((total, item) => total + Number(item.productNum || 0), 0);
        return selectedNum === Number(group.select_num || 0);
      });
    },
    canVerify() {
      if (!this.productDetail) {
        return false;
      }
      if (this.productDetail.spec_type == 20 && !this.selectedSkuId) {
        return false;
      }
      if (this.productDetail.is_group == 20 && !this.isGroupSelectionComplete) {
        return false;
      }
      if (this.stockInfo && !this.stockInfo.enough) {
        return false;
      }
      return true;
    },
  },
  mounted() {
    const userStore = useUserStore();
    this.userInfo = userStore.userInfo;
    this.initData();
  },
  methods: {
    getRouteVerifyKey() {
      const verifyKey = this.$route.query.verifyKey;
      return Array.isArray(verifyKey) ? verifyKey[0] : verifyKey || "";
    },
    normalizeVerifyCache(rawData, createdAt) {
      if (!rawData) {
        return null;
      }
      const cacheCreatedAt = Number(createdAt || Date.now());
      if (Date.now() - cacheCreatedAt > DOUYIN_VERIFY_CACHE_MAX_AGE) {
        return null;
      }
      return rawData;
    },
    getVerifyDataFromStorage(verifyKey) {
      if (!verifyKey) {
        return null;
      }
      try {
        const cacheText = sessionStorage.getItem(verifyKey);
        if (!cacheText) {
          return null;
        }
        const cache = JSON.parse(cacheText);
        const verifyData = this.normalizeVerifyCache(cache.data, cache.createdAt);
        if (!verifyData) {
          sessionStorage.removeItem(verifyKey);
        }
        return verifyData;
      } catch (error) {
        console.error("读取抖音核销缓存失败：", error);
        sessionStorage.removeItem(verifyKey);
        return null;
      }
    },
    resolveVerifyData() {
      const stateData = this.normalizeVerifyCache(
        history.state?.verifyData,
        history.state?.verifyCreatedAt
      );
      const stateVerifyKey = history.state?.verifyKey || "";
      const routeVerifyKey = this.getRouteVerifyKey();
      this.verifyKey = stateVerifyKey || routeVerifyKey;

      if (stateData) {
        return stateData;
      }
      return this.getVerifyDataFromStorage(routeVerifyKey);
    },
    clearVerifyCache() {
      if (this.verifyKey) {
        sessionStorage.removeItem(this.verifyKey);
      }
    },
    redirectToHome() {
      this.clearVerifyCache();
      this.$router.replace({
        path: "/home/index",
      });
    },
    initData() {
      // 优先从 history.state 获取，刷新后再用 URL 中的临时 key 读取 sessionStorage。
      const stateData = this.resolveVerifyData();
      if (!stateData) {
        ElMessage.error("核销数据不存在，请重新扫码");
        this.redirectToHome();
        return;
      }

      this.verifyToken = stateData.verify_token || "";
      this.douyinOrderId = stateData.douyin_order_id || "";
      this.poiId = stateData.poi_id || "";
      this.shopSupplierId = stateData.shop_supplier_id || "";
      this.tableId = parseInt(stateData.table_id) || 0;
      this.tableNo = stateData.table_no || "";
      this.mealNum = parseInt(stateData.meal_num) || 0;

      try {
        const certificates = stateData.certificates || [];
        if (certificates.length > 0) {
          this.certificate = certificates[0];
          if (this.certificate.product_id) {
            this.loadProductDetail();
          }
        } else {
          ElMessage.error("券码信息不存在");
          this.redirectToHome();
        }
      } catch (error) {
        console.error("解析券码信息失败：", error);
        ElMessage.error("券码信息解析失败");
        this.redirectToHome();
      }
    },

    async loadProductDetail() {
      if (!this.certificate.product_id) {
        return;
      }

      this.loading = true;
      try {
        const res = await HomeApi.productDetail({
          product_id: this.certificate.product_id,
        });

        if (res.code == 1 && res.data && res.data.detail) {
          this.productDetail = res.data.detail;

          // 调试：打印原始数据
          console.log('商品详情原始数据:', this.productDetail);

          // ✅ 字段映射：PHP后端返回的字段名转换
          // 规格列表：sku -> sku_list
          if (this.productDetail.sku && !this.productDetail.sku_list) {
            this.productDetail.sku_list = this.productDetail.sku;
          }

          // 商品属性：product_attr -> product_attr_list
          if (this.productDetail.product_attr && !this.productDetail.product_attr_list) {
            this.productDetail.product_attr_list = this.productDetail.product_attr;
          }

          // 确保必需字段存在
          if (!this.productDetail.selectData) {
            this.productDetail.selectData = [];
          }

          // 处理商品图片 - 添加便捷访问字段
          if (this.productDetail.image && this.productDetail.image.length > 0) {
            this.productDetail.productImage = this.productDetail.image[0].file_path;
          }

          // 调试：打印转换后的数据
          console.log('规格列表 sku_list:', this.productDetail.sku_list);
          console.log('属性列表 product_attr_list:', this.productDetail.product_attr_list);

          this.initDefaultSelection();
          this.checkStock();

          // 套组商品自动打开选择器
          if (this.isGroupProduct && !this.hasGroupData) {
            this.$nextTick(() => {
              this.openGroupSelector();
            });
          }
        }
      } catch (error) {
        console.error("加载商品详情失败：", error);
      } finally {
        this.loading = false;
      }
    },

    initDefaultSelection() {
      if (!this.productDetail) {
        return;
      }

      // 规格选择：无论单规格还是多规格，都默认选中第一个SKU（参考spec.vue的逻辑）
      if (this.productDetail.sku_list && this.productDetail.sku_list.length > 0) {
        this.selectSpec(this.productDetail.sku_list[0]);
      }

      // 属性选择 - 兼容两种字段命名
      if (this.productDetail.product_attr_list && this.productDetail.product_attr_list.length > 0) {
        this.productDetail.product_attr_list.forEach((attrItem, attrIndex) => {
          const attrValue = attrItem.attribute_value || attrItem.attributeValue;
          if (attrValue && attrValue.length > 0) {
            this.selectedAttrs[attrIndex] = 0;
            this.selectedAttrNames[attrIndex] = attrValue[0];
          }
        });
      }
    },

    selectSpec(item) {
      this.selectedSkuId = item.product_sku_id;
      this.checkStock();
    },

    selectAttr(attrIndex, index, value) {
      this.selectedAttrs[attrIndex] = index;
      this.selectedAttrNames[attrIndex] = value;
      this.$forceUpdate();
    },

    toggleFeed(feedItem) {
      const feedName = feedItem.feed_name;
      const index = this.selectedFeeds.indexOf(feedName);
      if (index > -1) {
        // 已选中，取消选择
        this.selectedFeeds.splice(index, 1);
      } else {
        // 未选中，添加选择
        this.selectedFeeds.push(feedName);
      }
    },

    async checkStock() {
      if (!this.productDetail) {
        return;
      }

      if (this.productDetail.spec_type == 20 && !this.selectedSkuId) {
        return;
      }

      try {
        // 使用商品的库存信息
        const stock = this.productDetail.product_stock || 0;
        this.stockInfo = {
          enough: stock > 0,
          stock: stock,
          message: stock > 0
            ? `库存充足（剩余${stock}件）`
            : "库存不足，无法核销",
        };
      } catch (error) {
        console.error("检查库存失败：", error);
      }
    },

    openGroupSelector() {
      if (!this.productDetail) {
        ElMessage.error("商品信息加载中，请稍后");
        return;
      }

      // 构建套组商品模型，传递给GoodsDetail组件
      this.groupProductModel = {
        ...this.productDetail,
        tableId: 0, // 抖音核销不需要桌台
      };
      this.showGroupSelector = true;
    },

    handleGroupSelectorClose(result) {
      this.showGroupSelector = false;

      console.log('GoodsDetail 返回的数据:', result);

      if (Array.isArray(result)) {
        const normalized = this.normalizeGroupData(result);
        console.log('规范化后的 groupData:', normalized);
        this.groupData = normalized;
        ElMessage.success("套餐内容已更新");
      }
    },

    normalizeGroupData(data) {
      return data.map((item) => ({
        ...item,
        groupId: item.group_id || item.groupId,  // ✅ 支持两种命名
		goodsId: item.goods_id || item.goodsId,
        productNum: Number(item.product_num || item.productNum || 0),
        productId: item.product_id || item.origin_product_id || item.originProductId || item.productId,
        originProductId: item.origin_product_id || item.originProductId || item.productId,
        productSkuId: item.product_sku_id || item.productSkuId,
        productName: item.product_name || item.productName || "",
        describe: item.describe || item.described || "",
        described: item.described || item.describe || "",
        attr: item.attr || "",
        feed: item.feed || "",
      }));
    },

    formatGroupItemDesc(item) {
      return item.described || item.describe || item.specName || "";
    },

    formatGroupItemPrice(item) {
      const price = Number(item.price || 0);
      if (!price) {
        return "";
      }
      return price.toFixed(2);
    },

    async handleVerify() {
      if (!this.canVerify) {
        return;
      }

      try {
        await ElMessageBox.confirm("确认核销该券码？", "提示", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        });

        this.verifying = true;

        const productAttr = this.selectedAttrNames.filter((item) => item).join(";");
        const productFeed = this.selectedFeeds.join(",");

        // 生成完整的describe字段（参考spec.vue的逻辑）
        const describe = this.generateDescribe();

        // 转换 groupData 为后端期望的下划线格式
        const groupData = this.groupData.map((item) => ({
		  group_id: item.groupId || 0,
		  goods_id:item.goodsId || 0,
          product_id: item.productId || 0,
          product_sku_id: item.productSkuId || 0,
          product_num: item.productNum || 1,
          product_name: item.productName || "",
          describe: item.describe || "",
          attr: item.attr || "",
          feed: item.feed || "",
        }));

        const params = {
          verify_token: this.verifyToken,
          douyin_order_id: this.douyinOrderId,
          encrypted_code: this.certificate.encrypted_code,
          certificate_id: this.certificate.certificate_id,
          douyin_product_id: this.certificate.douyin_product_id,
          douyin_sku_id: this.certificate.sku_id,
          poi_id: this.poiId,
          amount: this.certificate.pay_amount || 0,
          shop_supplier_id: this.shopSupplierId,
          product_id: this.productDetail.product_id,
          product_sku_id: this.selectedSkuId || 0,
          product_attr: productAttr || "",
          product_feed: productFeed || "",
          describe: describe,
          table_id: this.tableId || 0,
          meal_num: this.mealNum || 0,
          remark: this.remark || "",
          group_data: groupData,
        };

        const res = await DouyinApi.verify(params);

        if (res.code == 1) {
          ElMessage.success("核销成功");
          this.clearVerifyCache();
          this.$router.replace({
            path: "/home/index",
          });
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("核销失败：", error);
        }
      } finally {
        this.verifying = false;
      }
    },

    handleBack() {
      this.clearVerifyCache();
      this.$router.back();
    },

    // 生成完整的describe字段（参考spec.vue的逻辑）
    generateDescribe() {
      let spaceName = this.selectedSkuText;
      if (spaceName !== "") {
        spaceName += ";";
      }

      let attrName = this.selectedAttrNames.filter((item) => item).join(";");
      if (attrName !== "") {
        attrName += ";";
      }

      let feedName = this.selectedFeeds.join(",");
      if (feedName !== "") {
        feedName += ";";
      }

      return spaceName + attrName + feedName;
    },
  },
};
</script>

<style scoped lang="scss">
.douyin-verify-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.verify-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.verify-content {
  padding: 20px 0;
}

.product-section,
.table-section,
.remark-section,
.no-product-section {
  margin-top: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 15px;
}

.section-subtitle {
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;

  .product-image {
    width: 80px;
    height: 80px;
    margin-right: 15px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-details {
    flex: 1;

    .product-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }

    .product-price {
      font-size: 18px;
      color: #f56c6c;
      font-weight: bold;
    }

    .product-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      margin-top: 8px;
      color: #666;
      font-size: 13px;
      line-height: 20px;
    }
  }
}

.selection-section {
  margin-bottom: 20px;

  .attr-group {
    margin-bottom: 20px;
  }

  .selection-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #666;
  }

  .attr-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .attr-item {
    min-width: 100px;
    padding: 0 20px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    cursor: pointer;
    background: #efefef;
    color: #49494e;
    text-align: center;
    transition: all 0.3s;

    &:hover {
      background: #e0e0e0;
    }

    &.active {
      background: #ffa500;
      color: #ffffff;
    }
  }
}

.feed-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;

  .feed-item {
    min-width: 120px;
    padding: 0 20px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    cursor: pointer;
    background: #efefef;
    color: #49494e;
    text-align: center;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .feed-price {
      color: #ff6b00;
      font-weight: 500;
    }

    &:hover {
      background: #e0e0e0;
    }

    &.active {
      background: #ffa500;
      color: #ffffff;

      .feed-price {
        color: #ffffff;
      }
    }
  }
}

.stock-section {
  margin-top: 20px;
}

.action-section {
  margin-top: 30px;
  text-align: center;

  .el-button {
    min-width: 120px;
    margin: 0 10px;
  }
}

.group-selection-section {
  padding: 16px;
  background: #fffaf2;
  border: 1px solid #ffe1b8;
  border-radius: 8px;
}

.group-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  .selection-title {
    margin-bottom: 4px;
  }

  .selection-tip {
    color: #909399;
    font-size: 13px;
    line-height: 20px;
  }
}

.group-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.group-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #f0d8b7;
  border-radius: 8px;
}

.group-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  background: #fff4e4;
  color: #6b4a1e;
  font-size: 14px;
  font-weight: bold;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-top: 1px solid #f5eadc;
}

.group-item-main {
  min-width: 0;
}

.group-item-name {
  color: #333;
  font-size: 14px;
  font-weight: bold;
  line-height: 20px;
}

.group-item-desc {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.group-item-extra {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: #f56c6c;
  font-size: 13px;
  font-weight: bold;
}

.group-empty {
  background: #ffffff;
  border: 1px dashed #f0d8b7;
  border-radius: 8px;
}
</style>
