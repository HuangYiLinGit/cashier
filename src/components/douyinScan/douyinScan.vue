<template>
  <el-dialog
    v-model="visible"
    title="抖音核销扫码"
    width="600px"
    class="douyin-scan-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="douyin-scan-content">
      <el-form :model="form" label-width="80px" class="douyin-scan-form">
        <el-form-item label="券码" class="scan-code-item">
          <el-input
            ref="qrCodeInput"
            v-model="form.qrCode"
            placeholder="请扫描或输入抖音券码"
            @keyup.enter="handleScan"
            clearable
            autofocus
            size="large"
          >
            <template #append>
              <el-button icon="Search" @click="handleScan">扫描</el-button>
            </template>
          </el-input>
        </el-form-item>
        <div class="scan-help">
          <div class="scan-help-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="scan-help-text">
            <div class="scan-help-title">提示</div>
            <div class="scan-help-content">
              <p>请使用扫码枪扫描用户出示的抖音团购券二维码</p>
              <p>或手动输入券码后点击"扫描"按钮</p>
              <p>一次只能核销一张券</p>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <template #footer>
      <div class="douyin-scan-footer">
        <el-button size="large" @click="handleClose">取消</el-button>
        <el-button size="large" type="primary" @click="handleScan" :loading="loading">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as douyinApi from '@/api/douyin'

const DOUYIN_VERIFY_CACHE_PREFIX = "douyin_verify_";

export default {
  name: 'DouyinScan',
  components: {
    InfoFilled
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    tableId: {
      type: [String, Number],
      default: 0
    },
    tableNo: {
      type: String,
      default: ''
    },
    mealNum: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      form: {
        qrCode: ''
      }
    }
  },
  watch: {
    isShow(val) {
      this.visible = val
      if (val) {
        this.$nextTick(() => {
          if (this.$refs.qrCodeInput) {
            this.$refs.qrCodeInput.focus()
          }
        })
      }
    }
  },
  methods: {
    handleClose() {
      this.form.qrCode = ''
      this.visible = false
      this.$emit('close')
    },
    createVerifyKey() {
      return `${DOUYIN_VERIFY_CACHE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2)}`;
    },
    saveVerifyData(verifyKey, verifyData, createdAt) {
      try {
        sessionStorage.setItem(
          verifyKey,
          JSON.stringify({
            createdAt,
            data: verifyData,
          })
        );
      } catch (error) {
        console.error("缓存抖音核销数据失败：", error);
      }
    },
    async handleScan() {
      if (!this.form.qrCode) {
        ElMessage.warning('请输入券码')
        return
      }

      this.loading = true
      try {
        const res = await douyinApi.prepare({
          qrCode: this.form.qrCode,
        })

        if (res.code == 1 && res.data) {
          const verifyData = {
            verify_token: res.data.verify_token,
            douyin_order_id: res.data.douyin_order_id,
            poi_id: res.data.poi_id,
            certificates: res.data.certificates,
            table_id: this.tableId || 0,
            table_no: this.tableNo || '',
            meal_num: this.mealNum || 0,
          };
          const createdAt = Date.now();
          const verifyKey = this.createVerifyKey();
          this.saveVerifyData(verifyKey, verifyData, createdAt);

          // URL only carries a temporary key. Sensitive data stays in state/sessionStorage.
          this.$router.push({
            path: '/douyin/verify',
            query: {
              verifyKey,
            },
            state: {
              verifyKey,
              verifyData,
              verifyCreatedAt: createdAt,
            },
          });
          this.handleClose();
        } else {
          this.loading = false
        }
      } catch (error) {
        this.loading = false
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.douyin-scan-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
  }

  :deep(.el-dialog__header) {
    text-align: center;
    padding: 30px 0 20px;
  }

  :deep(.el-dialog__title) {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;

    .el-dialog__close {
      font-size: 20px;
      color: #909399;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px 50px 30px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 50px 40px;
    text-align: center;
  }
}

.douyin-scan-content {
  width: 100%;
}

.douyin-scan-form {
  .scan-code-item {
    margin-bottom: 30px;

    :deep(.el-form-item__label) {
      font-size: 18px;
      color: #333;
      font-weight: 500;
    }

    :deep(.el-input__wrapper) {
      font-size: 16px;
    }

    :deep(.el-input-group__append) {
      background: #fff;

      .el-button {
        font-size: 16px;
        padding: 0 20px;
      }
    }
  }
}

.scan-help {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.scan-help-icon {
  display: flex;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  font-size: 24px;
}

.scan-help-text {
  flex: 1;
}

.scan-help-title {
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.scan-help-content {
  p {
    margin: 0 0 5px 0;
    padding: 0;
    color: #666;
    font-size: 14px;
    line-height: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.douyin-scan-footer {
  display: flex;
  justify-content: center;
  gap: 20px;

  .el-button {
    min-width: 100px;
    font-size: 16px;
  }
}
</style>
