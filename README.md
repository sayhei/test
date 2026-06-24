# Wind 金融终端自动化测试

本项目提供两种自动化测试方案：**Midscene（AI 驱动）** 和 **Ui.Vision RPA（图像识别）**。

---

## 📊 两种方案对比

| 特性 | Midscene (AI) | Ui.Vision RPA |
|------|---------------|---------------|
| **识别方式** | AI 视觉识别 | 图像匹配 + OCR |
| **稳定性** | 中等（受页面变化影响） | **高**（基于图像模板） |
| **学习成本** | 低（YAML 配置） | 中（宏文件 + 截图） |
| **桌面支持** | 原生支持 | 需要 XModules |
| **调试难度** | 中 | 低（可视化编辑器） |
| **API Key** | 需要（本地 Ollama 可免费） | **不需要** |
| **推荐场景** | 快速原型开发 | 生产环境稳定运行 |

---

## 🚀 快速开始

### 方案一：Midscene（推荐新手）

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置模型（.env）

⚠️ **安全提示**：`.env` 文件包含敏感信息，**不要提交到代码库**。

```bash
# 从模板创建配置文件
cp .env.example .env
```

编辑 `.env` 文件，选择模型服务：

```env
# 方式一：本地 Ollama（免费，推荐）
MIDSCENE_MODEL_BASE_URL="http://localhost:14471/v1"
MIDSCENE_MODEL_API_KEY="ollama"
MIDSCENE_MODEL_NAME="huihui_ai/qwen3-vl-abliterated:4b-instruct"
MIDSCENE_MODEL_FAMILY="qwen3-vl"
MIDSCENE_USE_QWEN3_VL=1

# 方式二：阿里云 DashScope（需要 API Key）
# MIDSCENE_MODEL_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
# MIDSCENE_MODEL_API_KEY="your-api-key-here"  # 替换为你的 API Key
# MIDSCENE_MODEL_NAME="qwen3.7-plus"
# MIDSCENE_MODEL_FAMILY="qwen3"
```

#### 3. 启动 Ollama

```bash
ollama serve
ollama pull huihui_ai/qwen3-vl-abliterated:4b-instruct
```

#### 4. 运行测试

```bash
# YAML 方式（推荐）
npm run test:wind:yaml

# TypeScript 方式
npm run test:wind
```

---

### 方案二：Ui.Vision RPA（推荐生产）

#### 1. 安装浏览器扩展

| 浏览器 | 下载地址 |
|--------|---------|
| Edge | https://microsoftedge.microsoft.com/addons/detail/goapmjinbaeomoemgdcnnhoedopjnddd |
| Chrome | https://chrome.google.com/webstore/detail/uivision-rpa/gcbalfbdmfieckjlnblleoemohcganoc |

#### 2. 安装 XModules（桌面自动化）

下载地址：https://ui.vision/rpa/x/download  
选择 Windows 版本安装。

#### 3. 运行测试

```bash
npm run test:wind:rpa
```

或双击 `run-wind-rpa.bat`。

---

## 📁 项目结构

```
test-proj/
├── src/
│   ├── config/              # 配置文件
│   │   ├── index.ts
│   │   └── wind.ts
│   ├── lib/                 # 工具库
│   │   ├── performance.ts   # 性能监控
│   │   ├── retry.ts         # 重试机制
│   │   ├── sleep.ts         # 等待函数
│   │   └── window.ts        # 窗口管理
│   └── tests/
│       ├── web/             # Web 测试
│       └── wind/            # Wind 终端测试
│           ├── stock-browser.ts        # Midscene TS 脚本
│           ├── stock-browser.yaml      # Midscene YAML 配置
│           ├── stock-browser-yaml.ts   # YAML 运行脚本
│           ├── stock-browser-macro.csv # Ui.Vision 宏文件
│           └── stock-browser-rpa.ts    # RPA 运行脚本
├── report-output/           # 测试报告
│   ├── screenshots/         # 截图
│   ├── *.execution.json     # 执行日志
│   └── report.md            # 报告汇总
├── .env.example             # 环境配置模板（复制为 .env 使用）
├── .gitignore               # Git 忽略文件（包含 .env）
├── README.md                # 本文档
├── WIND_TEST_GUIDE.md       # Midscene 详细指南
├── UIVISION_GUIDE.md        # Ui.Vision 详细指南
├── PERFORMANCE_OPTIMIZATION.md  # 性能优化
└── CHECKLIST.md             # 测试前检查清单
```

---

## 📋 测试流程

测试 Wind 金融终端的股票数据浏览器功能：

1. 打开股票数据浏览器
2. 输入股票代码（如 600006）
3. 选择股票（如 东风股份）
4. 添加指标（市值、PE）
5. 提取数据
6. 导出数据到指定路径

---

## 🛠️ 常用命令

### Midscene

```bash
# 标准运行
npm run test:wind:yaml

# 缓存模式（加速）
npm run test:wind:yaml:write   # 写入缓存
npm run test:wind:yaml:read    # 使用缓存
npm run test:wind:yaml:off     # 关闭缓存

# TypeScript 方式
npm run test:wind
```

### Ui.Vision RPA

```bash
npm run test:wind:rpa
```

### 其他

```bash
# 验证环境
npm run verify

# Web 测试
npm run test:ebay
```

---

## 📚 详细文档

| 文档 | 说明 |
|------|------|
| [WIND_TEST_GUIDE.md](WIND_TEST_GUIDE.md) | Midscene 详细使用指南 |
| [UIVISION_GUIDE.md](UIVISION_GUIDE.md) | Ui.Vision RPA 详细使用指南 |
| [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) | 性能优化方案 |
| [CHECKLIST.md](CHECKLIST.md) | 测试前检查清单 |

---

## ⚠️ 常见问题

### Midscene 问题

**Q: 操作不稳定，经常选错元素？**

A: 使用缓存模式提高稳定性：
```bash
npm run test:wind:yaml:write  # 首次写入缓存
npm run test:wind:yaml:read   # 后续使用缓存
```

**Q: Ollama 连接失败？**

A: 检查 Ollama 服务：
```bash
ollama serve
curl http://localhost:14471/api/tags
```

**Q: 如何保护 API Key 安全？**

A: 
1. `.env` 文件已添加到 `.gitignore`，不会提交到代码库
2. 使用 `.env.example` 作为模板，复制为 `.env` 后填入真实 API Key
3. 如果使用云端 API，建议设置访问限制和过期时间

### Ui.Vision 问题

**Q: 找不到宏文件？**

A: 确保 `stock-browser-macro.csv` 在正确路径，或手动导入：
1. 打开 Ui.Vision IDE
2. File → Open → 选择 CSV 文件

**Q: XModules 未安装？**

A: 下载安装：https://ui.vision/rpa/x/download

---

## 🎯 推荐使用方式

| 场景 | 推荐方案 |
|------|---------|
| 快速原型开发 | Midscene YAML |
| 生产环境稳定运行 | Ui.Vision RPA |
| 需要调试和可视化 | Ui.Vision RPA |
| 不需要 API Key | Ui.Vision RPA |
| 页面经常变化 | Midscene（AI 自适应） |

---

**版本**: 2.0.0 | **更新**: 2026-06-24 | **状态**: ✅ 就绪