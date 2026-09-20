# JJJ 连锁收银系统 - Code Wiki

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [项目结构](#3-项目结构)
4. [核心架构](#4-核心架构)
5. [主要模块详解](#5-主要模块详解)
6. [关键类与函数](#6-关键类与函数)
7. [API接口层](#7-api接口层)
8. [状态管理](#8-状态管理)
9. [路由系统](#9-路由系统)
10. [工具函数](#10-工具函数)
11. [过滤器与指令](#11-过滤器与指令)
12. [移动端适配](#12-移动端适配)
13. [项目运行](#13-项目运行)

---

## 1. 项目概述

**项目名称**：JJJ 连锁收银系统（JJJ Food Chain Cashier）

**项目定位**：面向连锁餐饮门店的专业收银系统，支持多种消费场景（堂食、外卖、快餐），提供完整的收银、会员、订单管理功能。

**核心特性**：
- 多屏显示支持（主屏+副屏）
- POS刷卡支付集成（正元POS）
- 完整的会员体系（储值、积分、优惠券）
- 桌台管理与点餐
- 挂单/取单功能
- 订单退款与打印
- 扫码核销功能

---

## 2. 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | 3.2+ |
| 构建工具 | Vite | 4.2+ |
| UI组件库 | Element Plus | 2.3+ |
| 状态管理 | Pinia | 2.0+ |
| 路由 | Vue Router | 4.1+ |
| HTTP请求 | Axios | 1.3+ |
| 移动端框架 | Capacitor | 7.4+ |
| 样式预处理 | SCSS | 1.59+ |
| 图标库 | Element Plus Icons | 2.1+ |
| 响应式 | amfe-flexible | 2.2+ |

---

## 3. 项目结构

```
jjj_food_chain_cashier/
├── android/                    # Android原生代码
│   ├── app/src/main/
│   │   ├── jni/                # JNI串口通信
│   │   ├── res/                # 资源文件
│   │   └── AndroidManifest.xml
│   ├── build.gradle
│   └── gradle/
├── dist/                       # 构建产物
├── src/                        # 源代码
│   ├── api/                    # API接口层
│   │   ├── index.js            # 基础接口
│   │   ├── home.js             # 收银接口
│   │   ├── order.js            # 订单接口
│   │   ├── user.js             # 用户接口
│   │   ├── table.js            # 桌台接口
│   │   ├── member.js           # 员工会员接口
│   │   ├── employee.js         # 员工管理接口
│   │   ├── shop.js             # 店铺管理接口
│   │   ├── setting.js          # 设置接口
│   │   ├── plugs.js            # 插件管理接口
│   │   ├── message.js          # 消息管理接口
│   │   ├── access.js           # 权限管理接口
│   │   └── auth.js             # 认证接口
│   ├── components/             # 公共组件
│   │   ├── keyboard/           # 自定义键盘
│   │   ├── memberSearch/       # 会员搜索
│   │   └── sidentify.vue       # 验证码组件
│   ├── config/                 # 配置文件
│   │   ├── index.js            # 配置入口
│   │   ├── net.config.js       # 网络配置
│   │   ├── env.js              # 环境常量（默认图片）
│   │   └── setting.config.js   # 系统设置
│   ├── router/                 # 路由配置
│   │   ├── index.js            # 路由定义
│   │   ├── permissions.js      # 路由守卫
│   │   └── dealWithRoute.js    # 路由处理
│   ├── store/                  # 状态管理
│   │   ├── index.js            # Store入口
│   │   └── model/
│   │       ├── user.js         # 用户状态
│   │       └── getRolelist.js  # 角色列表获取
│   ├── utils/                  # 工具函数
│   │   ├── request.js          # HTTP请求封装
│   │   ├── screen.js           # 屏幕服务（副屏/POS）
│   │   ├── base.js             # 基础工具（存储等）
│   │   ├── common.js           # 通用工具函数
│   │   ├── validate.js         # 校验工具
│   │   ├── router.js           # 路由工具
│   │   └── storageData.js      # 存储数据工具
│   ├── views/                  # 页面视图
│   │   ├── layout/             # 布局组件
│   │   │   ├── Main.vue        # 主布局
│   │   │   ├── LeftMenu.vue    # 左侧菜单
│   │   │   ├── RightContent.vue# 右侧内容区
│   │   │   └── Head.vue        # 头部组件
│   │   ├── login/              # 登录页
│   │   ├── home/               # 收银模块
│   │   │   ├── index.vue       # 收银主页面
│   │   │   └── part/           # 子组件
│   │   ├── table/              # 桌台模块
│   │   │   ├── index.vue       # 桌台主页面
│   │   │   ├── home/index.vue  # 桌台布局
│   │   │   ├── cart/index.vue  # 桌台购物车
│   │   │   └── part/money.vue  # 桌台折扣
│   │   ├── order/              # 订单模块
│   │   │   ├── index.vue       # 订单列表
│   │   │   └── part/refund.vue # 订单退款
│   │   ├── member/             # 会员模块
│   │   │   ├── index.vue       # 会员主页面
│   │   │   └── part/           # 子组件
│   │   ├── secondary/          # 副屏模块
│   │   ├── index/              # 统计模块
│   │   ├── verification/       # 核销模块
│   │   ├── help/               # 帮助模块
│   │   └── error-page/         # 错误页面
│   ├── assets/                 # 静态资源
│   ├── styles/                 # 全局样式
│   ├── filters/                # 过滤器
│   │   └── index.js            # 过滤器定义
│   ├── directive/              # 自定义指令
│   │   └── index.js            # 指令定义
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── .env                        # 公共环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .env.app                    # APP环境变量
├── package.json
├── vite.config.js
├── capacitor.config.json
└── README.md
```

---

## 4. 核心架构

### 4.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Android App                          │
│  ┌─────────────────┐    ┌────────────────────────────────┐ │
│  │   Main Screen   │    │      Secondary Screen          │ │
│  │  (收银主屏)     │    │      (顾客副屏)                │ │
│  └────────┬────────┘    └──────────────┬─────────────────┘ │
│           │                             │                   │
│           │  Capacitor MultiScreen      │                   │
│           └─────────────────────────────┘                   │
│                        │                                    │
│                        ▼                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Vue 3 Application                         │ │
│  │                                                        │ │
│  │  ┌──────────┐   ┌──────────┐   ┌─────────────────────┐ │ │
│  │  │ Router   │ → │  Views   │ → │   Components        │ │ │
│  │  └──────────┘   └──────────┘   └─────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────┐   ┌──────────┐   ┌─────────────────────┐ │ │
│  │  │  Pinia   │ ← │  API层   │ ← │   Request封装       │ │ │
│  │  └──────────┘   └──────────┘   └─────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   后端API服务   │
                    └─────────────────┘
```

### 4.2 架构特点

1. **前后端分离**：前端通过Axios与后端API通信
2. **状态集中管理**：使用Pinia管理全局状态（用户信息、会员信息等）
3. **模块化设计**：按业务模块划分（收银、桌台、订单、会员等）
4. **多屏支持**：通过Capacitor插件实现主屏与副屏通信
5. **响应式布局**：使用amfe-flexible实现移动端适配

---

## 5. 主要模块详解

### 5.1 收银模块（Home）

**路径**：`src/views/home/`

**功能描述**：核心收银功能，包括商品浏览、购物车管理、结算支付。

**子组件**：
| 组件 | 功能 |
|------|------|
| `cash.vue` | 现金支付组件 |
| `change.vue` | 商品改价组件 |
| `changeWeight.vue` | 计重商品改重组件 |
| `goodsDetail.vue` | 商品详情组件 |
| `money.vue` | 折扣/抹零组件 |
| `remark.vue` | 订单备注组件 |
| `spec.vue` | 商品规格选择组件 |
| `staylist.vue` | 挂单列表组件 |

**核心功能流程**：
```
商品分类浏览 → 选择商品 → 加入购物车 → 修改价格/重量 → 挂单/结算 → 选择支付方式 → 完成支付
```

**关键数据结构**：
```javascript
// 购物车商品
{
  product_id: number,
  product: { product_name, image, product_price },
  product_num: number,
  price: number,
  describe: string,
  is_group: number
}

// 购物车信息
{
  total_price: string,      // 应收金额
  total_bag_price: string,  // 包装费
  discount_money: string,   // 优惠金额
  cart_total_num: number,   // 商品数量
  total_pay_price: string   // 实收金额
}
```

### 5.2 桌台模块（Table）

**路径**：`src/views/table/`

**功能描述**：桌台点餐管理，支持桌台布局展示、点餐、加菜、结账等功能。

**子组件**：
| 组件 | 功能 |
|------|------|
| `home/index.vue` | 桌台布局展示 |
| `cart/index.vue` | 桌台购物车 |
| `part/money.vue` | 桌台折扣/抹零 |

**核心功能**：
- 桌台区域展示（大厅、包间等）
- 桌台状态管理（空闲、占用、预订）
- 桌台点餐与加菜
- 桌台结账

### 5.3 订单模块（Order）

**路径**：`src/views/order/`

**功能描述**：订单查询与管理，支持多种订单类型筛选、订单详情查看、退款、打印等功能。

**订单类型**：
| 类型值 | 名称 | 说明 |
|--------|------|------|
| 10 | 桌台订单 | 堂食点餐订单 |
| 20 | 收银订单 | 前台收银订单 |
| 30 | 外卖订单 | 外卖配送订单 |
| 40 | 快餐订单 | 快餐取餐订单 |

**订单状态**：
| 状态值 | 名称 |
|--------|------|
| 待完成 | 未支付/未结算 |
| 已完成 | 已支付完成 |
| 已取消 | 已取消订单 |

**子组件**：
| 组件 | 功能 |
|------|------|
| `part/refund.vue` | 订单退款组件 |

### 5.4 会员模块（Member）

**路径**：`src/views/member/`

**功能描述**：会员管理功能，包括会员信息查询、储值充值、优惠券管理、积分明细等。

**子组件**：
| 组件 | 功能 |
|------|------|
| `part/recharge.vue` | 会员充值 |
| `part/cash.vue` | 余额消费 |
| `part/coupon.vue` | 优惠券管理 |
| `part/balance.vue` | 储值变更明细 |
| `part/points.vue` | 积分明细 |
| `part/login.vue` | 会员登录 |

**会员信息结构**：
```javascript
{
  user_id: number,
  name: string,
  mobile: string,
  balance: string,      // 余额
  points: number,       // 积分
  grade: string,        // 会员等级
  coupons: []           // 优惠券列表
}
```

### 5.5 副屏模块（Secondary）

**路径**：`src/views/secondary/`

**功能描述**：收银台副屏展示，向顾客展示当前订单信息。

**通信机制**：
- 通过Capacitor MultiScreen插件实现主屏与副屏通信
- 主屏通过`sendToSecondary`发送订单数据
- 副屏监听消息并实时更新展示

### 5.6 统计模块（Index）

**路径**：`src/views/index/`

**功能描述**：营业数据统计展示，包括今日营业额、订单总量、退单额、菜品数等核心指标，以及各支付方式的收入明细和菜品销量排行榜TOP 10。

**核心统计指标**：
| 指标 | 说明 |
|------|------|
| 营业额 | 已付款订单实际支付金额（不含三方券） |
| 订单总量 | 已付款订单数量（不含取消订单） |
| 退单额 | 已退款金额 |
| 菜品数 | 门店商品数量 |

**支付方式统计**：
- 现金、支付宝、微信、余额、抖音、美团、其他

**时间维度**：今日、昨日、7日内、自定义

### 5.7 核销模块（Verification）

**路径**：`src/views/verification/`

**功能描述**：订单核销功能，支持三种核销模式。

**核销模式**：
| 模式 | 说明 | 适用场景 |
|------|------|----------|
| 手动核销 | 手动输入订单号核销 | 普通订单核销 |
| 自动核销 | 扫码枪自动扫码核销 | 快速扫码核销 |
| 团购核销 | 团购券核销 | 团购订单核销 |

**扫码枪集成**：
- 通过监听`keypress`事件实现扫码枪输入识别
- 判断输入间隔小于80毫秒为有效扫码输入
- 自动回车触发核销流程

---

## 6. 关键类与函数

### 6.1 ScreenService（屏幕服务）

**路径**：`src/utils/screen.js`

**功能**：封装Capacitor多屏插件，提供副屏管理、消息通信、打印、POS支付等功能。

**核心方法**：

| 方法名 | 功能 | 参数 | 返回值 |
|--------|------|------|--------|
| `checkIsApp()` | 检查是否在App环境运行 | 无 | `Promise<boolean>` |
| `checkAvailability()` | 检查副屏是否可用 | 无 | `Promise<boolean>` |
| `initCapacitorSecondary(route)` | 初始化副屏 | `route: string` | `Promise<boolean>` |
| `openSecondaryScreen(route)` | 打开副屏 | `route: string` | `Promise<boolean>` |
| `sendToSecondary(msg)` | 主屏发送消息到副屏 | `msg: any` | `Promise<boolean>` |
| `onMainMessage(cb)` | 主屏监听副屏消息 | `cb: function` | 无 |
| `onPrint(msg)` | 发送打印任务 | `msg: any` | `Promise<boolean>` |
| `checkVersion(version)` | 检查版本更新 | `version: object` | `Promise<boolean>` |
| `downloadAPK(version)` | 下载APK更新 | `version: object` | `Promise<boolean>` |
| `zhengYuanPosPay(data)` | 正元POS支付 | `data: {amount, orderIndex}` | `Promise<{status, message, data}>` |
| `cancelZhengYuanPosPay(data)` | 撤销POS支付 | `data: {amount, orderIndex}` | `Promise<{status, message, data}>` |
| `zhengYuanPosRefund(data)` | POS退款 | `data: {originalOrderId, amount}` | `Promise<{status, message, data}>` |

### 6.2 请求封装（Request）

**路径**：`src/utils/request.js`

**功能**：封装Axios请求，统一处理请求头、响应拦截、错误处理。

**核心方法**：

| 方法名 | 功能 | 参数 |
|--------|------|------|
| `_post(url, params, errorback)` | POST请求 | `url: string`, `params: object`, `errorback: function` |
| `_get(url, params, errorback)` | GET请求 | `url: string`, `params: object`, `errorback: function` |
| `_upload(url, formData, errorback)` | 文件上传 | `url: string`, `formData: FormData`, `errorback: function` |

**请求拦截逻辑**：
```
1. 添加token到请求头
2. 添加AppID到请求头
3. POST请求参数序列化(qs.stringify)
```

**响应拦截逻辑**：
```
1. 判断响应码(code)
2. code !== 1时：
   - code === 0：显示错误提示
   - 其他：清除用户状态，跳转到登录页
3. code === 1：返回data
```

### 6.3 用户状态管理（useUserStore）

**路径**：`src/store/model/user.js`

**功能**：管理用户登录状态、会员信息等全局状态。

**State**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 用户登录token |
| `userInfo` | object | 用户信息 |
| `memberInfo` | object | 当前选中会员信息 |
| `list` | object | 事件总线回调列表 |

**Actions**：

| 方法名 | 功能 | 参数 |
|--------|------|------|
| `bus_on(name, fn)` | 订阅事件 | `name: string`, `fn: function` |
| `bus_emit(name, data)` | 发布事件 | `name: string`, `data: any` |
| `bus_off(name)` | 取消订阅 | `name: string` |
| `setMember(info)` | 设置会员信息 | `info: object` |
| `removeMember()` | 清除会员信息 | 无 |
| `afterLogin(info)` | 登录成功处理 | `info: object` |
| `afterLogout()` | 退出登录处理 | 无 |

**UserInfo结构**：
```javascript
{
  userName: string,      // 用户名
  account: string,       // 账号
  AppID: string,         // 应用ID
  cashier_id: number,    // 收银员ID
  mobile: string,        // 手机号
  name: string,          // 姓名
  shop_supplier_id: number // 供应商ID
}
```

### 6.4 角色列表获取（getRolelist）

**路径**：`src/store/model/getRolelist.js`

**功能**：获取用户权限菜单列表。

**核心方法**：

| 方法名 | 功能 | 参数 | 返回值 |
|--------|------|------|--------|
| `getlist()` | 获取角色权限菜单 | 无 | `Promise<Array>` |

---

## 7. API接口层

### 7.1 API目录结构

```
src/api/
├── index.js          # 基础配置接口
├── home.js           # 收银相关接口
├── order.js          # 订单相关接口
├── user.js           # 用户/会员相关接口
├── table.js          # 桌台相关接口
├── member.js         # 员工/会员接口
├── employee.js       # 员工管理接口
├── shop.js           # 店铺管理接口
├── setting.js        # 设置接口
├── plugs.js          # 插件管理接口
├── message.js        # 消息管理接口
├── access.js         # 权限管理接口
└── auth.js           # 认证接口
```

### 7.2 接口规范

**请求格式**：
- BaseURL：`/api/index.php`（开发环境）或 `${VITE_BASIC_URL}/index.php`（生产环境）
- Content-Type：`application/x-www-form-urlencoded`
- 请求头：`token`、`AppID`

**响应格式**：
```javascript
{
  code: number,    // 1表示成功，0表示失败，其他表示未登录
  msg: string,     // 提示信息
  data: object     // 业务数据
}
```

### 7.3 主要接口列表

#### 7.3.1 用户接口（user.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `login` | POST | `/cashier/passport/login` | 用户登录 |
| `loginOut` | POST | `/cashier/passport/logout` | 退出登录 |
| `editPassword` | POST | `/cashier/admin.user/renew` | 修改密码 |
| `getmember` | POST | `/cashier/user.User/index` | 获取会员列表 |
| `getmemberDetail` | GET | `/cashier/user.User/detail` | 获取会员详情 |
| `registerUser` | POST | `/cashier/user.User/register` | 注册会员 |
| `getBalance` | GET | `/cashier/user.User/balance` | 获取余额 |
| `getPoints` | GET | `/cashier/user.User/points` | 获取积分 |
| `getCoupon` | GET | `/cashier/user.User/coupon` | 获取优惠券 |
| `getExtendType` | GET | `/cashier/index/extendType` | 获取扩展类型 |
| `getPlan` | GET | `/cashier/user.Plan/index` | 获取套餐列表 |
| `buyPlan` | POST | `/cashier/user.Plan/buy` | 购买套餐 |
| `planDetail` | GET | `/cashier/user.Plan/detail` | 套餐详情 |
| `getGradeList` | GET | `/cashier/user.User/gradeList` | 获取会员等级列表 |

#### 7.3.2 收银接口（home.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `getCategory` | POST | `/cashier/product.category/index` | 获取商品分类 |
| `getProduct` | POST | `/cashier/product.product/index` | 获取商品列表 |
| `addCart` | POST | `/cashier/order.cart/add` | 添加商品到购物车 |
| `subProduct` | POST | `/cashier/order.cart/sub` | 减少购物车商品 |
| `delProduct` | POST | `/cashier/order.cart/delProduct` | 删除购物车商品 |
| `cartList` | POST | `/cashier/order.cart/list` | 获取购物车列表 |
| `changePrice` | POST | `/cashier/order.cart/changePrice` | 修改商品价格 |
| `changeWeight` | POST | `/cashier/order.cart/changeWeight` | 修改计重商品重量 |
| `changeMoney` | POST | `/cashier/order.cart/changeMoney` | 折扣/抹零 |
| `stay` | POST | `/cashier/order.cart/stay` | 挂单 |
| `stayList` | POST | `/cashier/order.cart/stayList` | 获取挂单列表 |
| `pick` | POST | `/cashier/order.cart/pick` | 取单 |
| `delCart` | POST | `/cashier/order.cart/delCart` | 删除购物车 |
| `delStay` | POST | `/cashier/order.cart/delStay` | 删除挂单 |
| `orderBuy` | POST | `/cashier/order.order/buy` | 结算下单 |
| `getOrderBuy` | GET | `/cashier/order.order/buy` | 获取下单信息 |
| `HallCartList` | POST | `/cashier/order.HallCart/list` | 获取桌台购物车列表 |
| `addHallCart` | POST | `/cashier/order.HallCart/add` | 添加桌台购物车 |
| `subHallCart` | POST | `/cashier/order.HallCart/sub` | 减少桌台购物车 |
| `getTableOrder` | GET | `/cashier/order.Order/orderDetail` | 获取桌台订单详情 |
| `tableBuy` | POST | `/cashier/order.Order/tableBuy` | 桌台结账 |
| `addMeal` | POST | `/cashier/order.Order/addMeal` | 加菜 |
| `changeTable` | POST | `/cashier/order.HallCart/detail` | 换桌查询 |
| `goodsDetail` | GET | `/cashier/product.product/goodsDetail` | 商品详情 |

#### 7.3.3 订单接口（order.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `getList` | POST | `/cashier/order.order/index` | 获取订单列表 |
| `settle` | POST | `/cashier/order.order/settle` | 订单结算 |
| `refund` | POST | `/cashier/order.order/refund` | 订单退款 |
| `print` | POST | `/cashier/order.order/print` | 打印订单 |
| `moveProduct` | POST | `/cashier/order.order/moveProduct` | 退菜 |
| `payment` | POST | `/cashier/order.order/payment` | 支付处理 |
| `paySuccess` | GET | `/cashier/order.order/detail` | 支付成功详情 |
| `payFunc` | POST | `/cashier/order.Order/pay` | 支付接口 |
| `extractDetail` | POST | `/cashier/order.Order/extractDetail` | 核销订单详情 |
| `extract` | POST | `/cashier/order.Order/extract` | 确认核销 |
| `groupDetail` | GET | `/cashier/order.Order/groupDetail` | 团购订单详情 |
| `groupReceipt` | POST | `/cashier/order.Order/receipt` | 团购核销 |
| `cartAddGroup` | POST | `/cashier/order.cart/addGroup` | 购物车添加套餐 |
| `hallCartAddGroup` | POST | `/cashier/order.hallCart/addGroup` | 桌台购物车添加套餐 |

#### 7.3.4 桌台接口（table.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `getCategory` | POST | `/cashier/store.table/area` | 获取桌台区域 |
| `getTable` | POST | `/cashier/store.table/table` | 获取桌台列表 |
| `getHallCart` | POST | `/cashier/order.HallCart/detail` | 获取桌台购物车 |
| `cancelHallCart` | POST | `/cashier/order.HallCart/cancel` | 取消桌台订单 |
| `payFunc` | POST | `/cashier/order.Order/pay` | 支付接口 |
| `changeMoney` | POST | `/cashier/order.HallCart/changeMoney` | 折扣/抹零 |
| `getchangeTable` | POST | `/cashier/store.table/changeTable` | 查询换桌信息 |
| `changeTable` | POST | `/cashier/order.Order/changeTable` | 换桌 |
| `printFunc` | POST | `/cashier/order.Order/print` | 打印订单 |

#### 7.3.5 店铺接口（shop.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `shopList` | POST | `/cashier/shop/index` | 店铺列表 |
| `addShop` | POST | `/cashier/shop/add` | 添加店铺 |
| `editShop` | POST | `/cashier/shop/edit` | 修改店铺 |
| `updateStatus` | POST | `/cashier/shop/updateStatus` | 启用/禁用店铺 |
| `storeEnter` | POST | `/cashier/shop/enter` | 进入店铺 |
| `deleteShop` | POST | `/cashier/shop/delete` | 删除店铺 |

#### 7.3.6 设置接口（setting.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `serviceDetail` | GET | `/cashier/setting.service/index` | 获取客服设置 |
| `editService` | POST | `/cashier/setting.service/index` | 保存客服设置 |

#### 7.3.7 插件接口（plugs.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `plugslist` | POST | `/cashier/plus.plus/index` | 插件列表 |
| `getplugs` | GET | `/cashier/plus.plus/add` | 获取插件信息 |
| `addplugs` | POST | `/cashier/plus.plus/add` | 添加插件 |
| `editplugs` | POST | `/cashier/plus.plus/edit` | 编辑插件 |
| `deleteplugs` | POST | `/cashier/plus.plus/delete` | 删除插件 |
| `updatePlugsStatus` | POST | `/cashier/plus.plus/updateStatus` | 修改插件状态 |
| `updatePlugsRecom` | POST | `/cashier/plus.plus/updateRecom` | 设置推荐 |

#### 7.3.8 消息接口（message.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `messageList` | POST | `/cashier/message/index` | 消息列表 |
| `addMessage` | POST | `/cashier/message/add` | 添加消息 |
| `editMessage` | POST | `/cashier/message/edit` | 修改消息 |
| `deleteMessage` | POST | `/cashier/message/delete` | 删除消息 |
| `fieldList` | POST | `/cashier/message/field` | 消息字段列表 |
| `saveField` | POST | `/cashier/message/saveField` | 保存消息字段 |

#### 7.3.9 权限接口（access.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `accessList` | POST | `/cashier/Access/index` | 菜单列表 |
| `addpAccess` | POST | `/cashier/Access/add` | 添加菜单 |
| `editAccess` | POST | `/cashier/Access/edit` | 编辑菜单 |
| `delAccess` | POST | `/cashier/Access/delete` | 删除菜单 |
| `status` | POST | `/cashier/Access/status` | 修改状态 |
| `supplier` | POST | `/cashier/Access/supplier` | 供应商权限 |
| `supplieraccessList` | POST | `/cashier/SupplierAccess/index` | 供应商菜单列表 |
| `supplieraddpAccess` | POST | `/cashier/SupplierAccess/add` | 添加供应商菜单 |
| `suppliereditAccess` | POST | `/cashier/SupplierAccess/edit` | 编辑供应商菜单 |
| `supplierdelAccess` | POST | `/cashier/SupplierAccess/delete` | 删除供应商菜单 |
| `supplierstatus` | POST | `/cashier/SupplierAccess/status` | 修改供应商状态 |

#### 7.3.10 员工接口（employee.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `getOfficeData` | GET | `/cashier/employee.office/index` | 获取员工数据 |
| `saveData` | POST | `/cashier/employee.office/save` | 保存员工数据 |
| `deleteData` | POST | `/cashier/employee.office/delete` | 删除员工数据 |

#### 7.3.11 基础接口（index.js）

| 接口名 | 方法 | URL | 功能 |
|--------|------|-----|------|
| `base` | POST | `/cashier/index/base` | 基础配置 |
| `getCount` | POST | `/cashier/Index/index` | 商城首页统计 |
| `baseData` | POST | `/cashier/Index/baseData` | 统计数据 |
| `getVersion` | POST | `/cashier/index/get_cashier_version` | 获取版本信息 |

---

## 8. 状态管理

### 8.1 Pinia Store配置

**路径**：`src/store/index.js`

**导出的Store**：
- `useUserStore`：用户状态管理

### 8.2 状态持久化

使用`sessionStorage`实现状态持久化：
- Token存储键：`cashierToken`
- 用户信息存储键：`userInfo`
- 会员信息存储键：`member`

### 8.3 事件总线

通过Pinia实现简易事件总线：
- `bus_on(name, fn)`：订阅事件
- `bus_emit(name, data)`：发布事件
- `bus_off(name)`：取消订阅

**应用场景**：
- 菜单名称切换通知
- 全局消息通知

---

## 9. 路由系统

### 9.1 路由配置

**路径**：`src/router/index.js`

**路由模式**：Hash模式（`createWebHashHistory`）

**路由列表**：

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/login` | login | login/index.vue | 登录页 |
| `/secondary` | secondary | secondary/index.vue | 副屏页 |
| `/home` | Home | layout/Main.vue | 主布局入口 |
| `/home/index` | HomeIndex | home/index.vue | 收银页 |
| `/table/index` | table_index | table/index.vue | 桌台页 |
| `/order/index` | orderIndex | order/index.vue | 订单页 |
| `/index/index` | Index | index/index.vue | 统计页 |
| `/verification/index` | verificationIndex | verification/index.vue | 核销页 |
| `/member/index` | memberIndex | member/index.vue | 会员页 |

### 9.2 路由守卫

**路径**：`src/router/permissions.js`

**守卫逻辑**：
```
1. 白名单路由（/login, /secondary）直接放行
2. 无token且非白名单路由 → 跳转到登录页
3. 有token且访问/login → 跳转到/home
4. 有token且菜单未加载 → 加载菜单并刷新路由
5. 其他情况正常放行
```

### 9.3 菜单配置

**路径**：`src/views/layout/LeftMenu.vue`

**菜单列表**：
| 名称 | 图标 | 路径 |
|------|------|------|
| 收银 | icon-shouyin | /home/index |
| 桌台 | icon-icon-test1 | /table/index |
| 订单 | icon-icon-test | /order/index |
| 统计 | icon-shouyin | /index/index |
| 核销 | icon-zidonghexiao | /verification/index |
| 会员 | icon-zidonghexiao | /member/index |

---

## 10. 工具函数

### 10.1 基础工具（base.js）

**路径**：`src/utils/base.js`

| 函数名 | 功能 | 参数 |
|--------|------|------|
| `setCookie(name, value, expiredays)` | 设置Cookie | 名称、值、过期天数 |
| `getCookie(name)` | 获取Cookie | 名称 |
| `delCookie(name)` | 删除Cookie | 名称 |
| `setSessionStorage(name, val)` | 设置SessionStorage | 名称、值 |
| `getSessionStorage(name)` | 获取SessionStorage | 名称 |
| `deleteSessionStorage(name)` | 删除SessionStorage | 名称 |
| `setLocalStorage(name, val)` | 设置LocalStorage | 名称、值 |
| `getLocalStorage(name)` | 获取LocalStorage | 名称 |
| `deleteLocalStorage(name)` | 删除LocalStorage | 名称 |
| `deepClone(obj)` | 深拷贝对象 | 对象 |
| `deepMerger(obj1, obj2)` | 深合并对象 | 目标对象、源对象 |
| `formatModel(thisObj, sourceObj)` | 格式化对象属性 | 目标对象、源对象 |

### 10.2 通用工具（common.js）

**路径**：`src/utils/common.js`

| 函数名 | 功能 | 参数 |
|--------|------|------|
| `strChangeInt(data)` | 字符串转int数组 | 逗号分隔的字符串 |
| `handCacader(data, idName, name, categoryId)` | 处理级联数据 | 数据、ID字段名、名称字段名、目标ID |
| `handRepeat(data, idName)` | 数据去重 | 数据、ID字段名 |
| `assiginObj(target, sources)` | 对象合并 | 目标对象、源对象 |
| `handClassfiy(data, arrKey)` | 处理分类数据 | 数据、键配置 |
| `upImg(param, fileType)` | 图片上传 | 参数、文件类型 |
| `joinStr(data, props)` | 数组字符串拼接 | 数据、配置项 |

### 10.3 校验工具（validate.js）

**路径**：`src/utils/validate.js`

| 函数名 | 功能 | 参数 |
|--------|------|------|
| `isString(data)` | 判断是否为字符串 | 数据 |
| `isArray(data)` | 判断是否为数组 | 数据 |

---

## 11. 过滤器与指令

### 11.1 过滤器（filters/index.js）

**路径**：`src/filters/index.js`

**全局过滤器列表**：

| 过滤器名 | 功能 | 参数 | 返回值 |
|----------|------|------|--------|
| `testFilter` | 测试过滤 | `val: any` | 字符串 |
| `isNull` | 空值处理 | `val: any` | 值或'-' |
| `returnPercentage` | 转换百分比 | `val: number` | 百分比字符串 |
| `returnToFixed` | 保留小数位 | `val: number`, `num: number` | 格式化数字 |
| `tenThousand` | 转换为万元 | `val: number` | 万元字符串 |
| `numTabWeek` | 数字转星期 | `val: number` | 中文字符串 |
| `convertSex` | 转换性别 | `num: number` | 性别字符串 |
| `replaceSpace` | 去除空格 | `val: string` | 处理后字符串 |
| `hasSpace` | 判断空格 | `val: string` | boolean |
| `passwordForm` | 密码格式校验 | `val: string` | boolean |
| `isAllSpace` | 判断全空格 | `val: string` | boolean |
| `onExportFunc` | 导出功能 | `url: string`, `params: object` | 无 |
| `numberToCurrencyNo` | 千分位格式化 | `value: number` | 格式化金额 |

**注册方式**：
```javascript
app.config.globalProperties.$filter = filters;
app.config.globalProperties.$numTCN = filters.numberToCurrencyNo;
```

### 11.2 自定义指令（directive/index.js）

**路径**：`src/directive/index.js`

**指令列表**：

| 指令名 | 功能 | 参数 |
|--------|------|------|
| `v-demo` | 测试指令 | 任意值 |
| `v-img-url` | 图片加载与默认图 | 图片URL或对象路径 |

**v-img-url指令特性**：
- 支持直接URL或对象路径（如`v-img-url="item.image[0].file_path"`）
- 自动检测图片是否存在
- 图片加载失败时显示默认图片

---

## 12. 移动端适配

### 12.1 Capacitor集成

**配置文件**：`capacitor.config.json`

```json
{
  "appId": "com.jjjcashier.app",
  "appName": "微卡收银台",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

**核心插件**：
- `@capacitor/core`：核心功能
- `@capacitor/android`：Android平台
- `@capacitor/splash-screen`：启动页

**自定义插件**：
- `MultiScreen`：多屏支持插件（通过JNI实现）

### 12.2 Vite配置（vite.config.js）

**关键配置**：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| base | `./`（生产）/ `/`（开发） | 基础路径 |
| host | `0.0.0.0` | 监听地址 |
| port | `8080` | 端口号 |
| proxy | `/api` → `VITE_BASIC_URL` | API代理 |
| rootValue | `160` | 750设计稿基准 |

**插件配置**：
- `vue()`：Vue支持
- `AutoImport`：自动导入Element Plus
- `Components`：自动注册组件
- `viteCompression`：Gzip压缩（非APP模式）
- `legacy`：IE兼容（非APP模式）

**构建优化**：
- `minify: 'terser'`：代码压缩
- `drop_console: true`：移除console
- `manualChunks`：按node_modules分包

### 12.3 响应式布局

**依赖**：`amfe-flexible` + `postcss-pxtorem`

**配置**：
- `amfe-flexible`：动态设置rem基准值
- `postcss-pxtorem`：将px转换为rem

**设计稿基准**：750px宽

### 12.4 串口通信

**路径**：`android/app/src/main/jni/serial_port.c`

**功能**：实现与硬件设备（如秤、打印机）的串口通信。

---

## 13. 项目运行

### 13.1 环境要求

- Node.js：16+
- npm：8+
- Android Studio：用于构建Android应用

### 13.2 安装依赖

```bash
npm install
```

### 13.3 开发模式

```bash
# 开发环境
npm run dev

# 生产环境预览
npm run pro
```

### 13.4 构建

```bash
# 通用构建
npm run build

# APP构建（生成Android资源）
npm run build:app
```

### 13.5 Android构建

```bash
# 进入android目录
cd android

# 构建release版本
.\gradlew assembleRelease

# 构建debug版本
.\gradlew assembleDebug
```

### 13.6 环境变量

**`.env`**：公共环境
```
VITE_NODE_ENV=production
VITE_BASIC_URL=https://zyysxcs.weka.life
```

**`.env.development`**：开发环境
```
VITE_NODE_ENV=development
VITE_BASIC_URL=http://chain.com
```

**`.env.production`**：生产环境
```
VITE_NODE_ENV=production
VITE_BASIC_URL=https://zyysxcs.weka.life
```

**`.env.app`**：APP环境
```
VITE_NODE_ENV=app
VITE_IS_APP=true
VITE_BASIC_URL=https://zyysxcs.weka.life
```

### 13.7 布局组件说明

#### 13.7.1 Head.vue（头部组件）

**功能**：系统顶部导航栏

**特性**：
- 显示店铺名称
- 实时显示当前时间（每秒更新）
- 全屏切换按钮
- 显示当前登录用户名
- 退出登录按钮

**核心方法**：
| 方法名 | 功能 |
|--------|------|
| `launchFullScreen()` | 切换全屏模式 |
| `getData()` | 获取店铺信息 |
| `getNow()` | 更新时间显示 |
| `login_out()` | 退出登录确认 |

---

## 附录

### A. 支付方式编码

| 编码 | 支付方式 |
|------|----------|
| 0 | 现金支付 |
| 1 | POS刷卡 |
| 2 | 余额支付 |
| 3 | 扫码支付 |
| 4 | 挂帐支付 |

### B. 消费方式编码

| 编码 | 消费方式 |
|------|----------|
| 10 | 桌台就餐 |
| 20 | 收银台 |
| 30 | 打包带走 |
| 40 | 店内就餐 |

### C. 版本更新流程

```
1. App.vue挂载时调用checkVersion()
2. 请求后端获取最新版本信息
3. 调用ScreenService.checkVersion()比较版本
4. 需要更新时弹出确认对话框
5. 用户确认后调用ScreenService.downloadAPK()下载安装
```

### D. 打印功能流程

```
1. 订单完成后调用OrderApi.print()
2. 后端返回打印数据
3. 调用ScreenService.onPrint()发送打印任务
4. Android原生层处理打印请求
```

### E. 配置文件说明

**src/config/index.js**：
- 合并`setting.config.js`和`net.config.js`的配置

**src/config/setting.config.js**：
```javascript
{
  layout: "total, sizes, prev, pager, next, jumper",  // 分页布局
  storage: "sessionStorage",                           // 存储方式
  tokenName: "basicStorage",                           // Token名称
  debounce: ["doEdit", "config", "survey"],            // 防抖方法
  errorLog: "development",                             // 错误日志模式
  authentication: "intelligence",                      // 认证模式
}
```

**src/config/net.config.js**：
```javascript
{
  baseURL: "/api/index.php",  // 开发环境API地址
  tokenName: "token",          // 请求头Token名称
  strongToken: "cashierToken", // 本地存储Token键名
  contentType: "application/x-www-form-urlencoded;charset=UTF-8",
  requestTimeout: 50000,       // 请求超时时间
  successCode: [200, 0, '200', '0'],  // 成功响应码
  statusName: "code",          // 状态码字段名
  messageName: "msg",          // 消息字段名
  withCredentials: true,       // 是否携带凭证
  responseType: "json",        // 响应类型
}
```

**src/config/env.js**：
- 导出默认图片`defaultImg`

---

**文档版本**：v1.1  
**生成日期**：2026-07-01  
**适用项目**：JJJ 连锁收银系统