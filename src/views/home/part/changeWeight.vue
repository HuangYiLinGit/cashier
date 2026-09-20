<template>
  <el-dialog title="修改重量" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
    :close-on-press-escape="false" width="80%" class="dialog-search">
    <div class="dialog-content changeProduct">
		<div class="gray6 f16 tl mb30">原始价格：<span class="yellow  fb" v-if="promodel!=null">{{promodel.product_price || 0}}</span>
		</div>
      <div class="gray6 f16 tl mb30">当前价格：<span class="yellow  fb" v-if="promodel!=null">{{promodel.price || 0}}</span>
      </div>
	  <div class="gray6 f16 tl mb30">当前重量：<span class="yellow  fb" >1.00kg</span>
      </div>
      <div class="d-s-c mb30">
        <div class="f16 gray9 mr10"><span class="red">*</span>本次重量</div>
        <el-input placeholder="请输入本次重量" v-model="net_weight" class="input-with-select changeinput">
          <template #append>g</template>
        </el-input>
      </div>
      <keyboard @addNum="addNum" @confirm='submitFunc'></keyboard>
    </div>
  </el-dialog>
</template>

<script>

import keyboard from "../../../components/keyboard/keyboard.vue";

export default {
	components: {
		keyboard
	},
	data() {
		return {
			dialogVisible: false,
			net_weight: ''
		};
	},
	props: {
		isChange: Boolean,
		promodel: Object
	},
	watch: {
		isChange: function(n, o) {
			if (n != o) {
				this.dialogVisible = n;
				if (n) {
					this.net_weight = '';
				}
				console.log('获取当前数据1111',this.promodel);
			}
		}
	},
	methods: {
		handleClose(e) {
			this.$emit('close', null);
		},
		addNum(n) {
			this.net_weight += n;
		},
		submitFunc(n) {
			if (n == 'clear') {
				this.net_weight = '';
			} else {
				this.$emit('close', this.net_weight);
			}
		}
	}
};
</script>

<style lang="scss">
  .tl {
    text-align: left;
  }

  .yellow {
    color: #FFA500;
  }

  .changeinput {
    width: 297px;
  }

  .changeProduct .changeinput .el-input__inner:focus {
    border-color: #5CB85C;
  }

  .changeProduct .changeinput .el-input__inner:focus {
    border-color: #5CB85C;
  }

  .changeProduct .el-input-group__append {
    color: #FFFFFF;
    background-color: #5CB85C;
    border: 1px solid #5CB85C;
    border-left: none;
    font-size: 16px;

  }

  .mb30 {
    margin-bottom: 30px;
  }

  .dialog-search {
    .el-dialog {
      background: #FBFAF8;
      box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.25);
      border-radius: 5px;
    }
  }

  .dialog-title {
    font-size: 18px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #49494E;
    line-height: 38px;

  }

  .dialog-content {
    padding: 24px 40px;
    border-top: 1px solid #EEEEEE;
  }
</style>
