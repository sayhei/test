# Wind金融终端自动化测试指南

## 📋 目录

- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [测试脚本说明](#测试脚本说明)
- [运行脚本](#运行脚本)
- [故障排除](#故障排除)
- [高级配置](#高级配置)

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @midscene/computer
```

### 2. 配置模型

在 `.env` 文件中添加：

```env
# 模型配置（本地 Ollama）
MIDSCENE_MODEL_BASE_URL="http://localhost:14471/v1"
MIDSCENE_MODEL_API_KEY="ollama"
MIDSCENE_MODEL_NAME="huihui_ai/qwen3-vl-abliterated:4b-instruct"
MIDSCENE_MODEL_FAMILY="qwen3-vl"
MIDSCENE_USE_QWEN3_VL=1

# 缓存配置（可选，加速后续运行）
MIDSCENE_CACHE=true
MIDSCENE_CACHE_MODE=read-write
```

### 3. 启动 Wind金融终端

确保 Wind金融终端已启动并处于可操作状态。

### 4. 运行测试

```bash
# 标准版本
npx tsx demo-wind.ts

# 健壮版本（带重试机制）
npx tsx demo-wind-robust.ts
```

---

## 🔧 环境配置

### 系统要求

- **操作系统**: Windows 10/11
- **Node.js**: 18.19.0 或更高版本
- **模型服务**: Ollama（本地）或云端 API

### Windows 权限说明

⚠️ **重要**：Windows 隔离了不同权限级别的输入（UIPI）：
- 非管理员进程 **无法** 向管理员窗口发送鼠标或键盘输入
- 如果目标应用程序以管理员权限运行，请也以管理员权限启动终端

**解决方案**：
1. 首选：目标应用程序和 Midscene 都以普通权限运行
2. 备选：都以管理员权限运行

### Ollama 配置

```bash
# 启动 Ollama
ollama serve

# 确认模型列表
curl http://localhost:14471/api/tags
```

---

## 📝 测试脚本说明

### demo-wind.ts - 标准版本

**特点**：
- 代码简洁，易于理解
- 16 个步骤完整覆盖用户需求
- 无额外错误处理

**适用场景**：
- 初步测试
- 调试简单问题

### demo-wind-robust.ts - 健壮版本

**特点**：
- 自动重试机制（最多 3 次）
- 详细的步骤日志
- 更好的错误处理和恢复
- 集中配置管理

**适用场景**：
- 生产环境
- 复杂自动化流程
- 长时间运行的测试

---

## ▶️ 运行脚本

### 方式 1：直接运行

```bash
npx tsx demo-wind.ts
```

### 方式 2：使用健壮版本

```bash
npx tsx demo-wind-robust.ts
```

### 方式 3：使用缓存加速

```bash
# 首次运行（生成缓存）
npx tsx demo-wind-robust.ts

# 后续运行（使用缓存）
npx tsx demo-wind-robust.ts
```

### 方式 4：只读缓存模式（生产环境）

```bash
MIDSCENE_CACHE_MODE=read-only npx tsx demo-wind-robust.ts
```

---

## 🐛 故障排除

### 问题 1：无法连接到模型服务

**症状**：
```
Error: Connection error
```

**解决方案**：
1. 检查 Ollama 是否运行：`curl http://localhost:14471/api/tags`
2. 确认端口配置正确（默认是 14471）
3. 检查防火墙设置

### 问题 2：操作无法执行

**症状**：
```
TaskExecutionError: AI model request failed
```

**解决方案**：
1. 确保 Wind金融终端已启动
2. 检查屏幕分辨率是否正常
3. 尝试以管理员权限运行

### 问题 3：权限被拒绝

**症状**：
```
Error: Access denied
```

**解决方案**：
1. 右键点击终端 → "以管理员身份运行"
2. 或者关闭 Wind 终端的管理员权限模式

### 问题 4：找不到元素

**症状**：
```
Error: Cannot locate element
```

**解决方案**：
1. 检查屏幕是否可见
2. 确认应用程序窗口未被最小化
3. 尝试调整 `CONFIG.wait` 中的等待时间

---

## ⚙️ 高级配置

### 自定义测试参数

编辑 `demo-wind-robust.ts` 中的 `CONFIG` 对象：

```typescript
const CONFIG = {
  wind: {
    stockCode: '600006',           // 股票代码
    stockName: '东风股份',         // 股票名称
    indicators: ['市值', 'PE'],    // 要添加的指标
    exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',  // 导出路径
  },
  retry: {
    maxAttempts: 3,              // 最大重试次数
    delay: 2000,                 // 重试延迟（毫秒）
  },
  wait: {
    short: 1000,                 // 短等待（毫秒）
    medium: 2000,                // 中等等待
    long: 3000,                  // 长等待
  },
};
```

### 使用其他模型服务

#### OpenAI API

```env
MIDSCENE_MODEL_BASE_URL="https://api.openai.com/v1"
MIDSCENE_MODEL_API_KEY="sk-xxxx"
MIDSCENE_MODEL_NAME="gpt-4o"
MIDSCENE_MODEL_FAMILY="gpt-4o"
```

#### Azure OpenAI

```env
MIDSCENE_MODEL_BASE_URL="https://xxx.openai.azure.com/v1"
MIDSCENE_MODEL_API_KEY="your-api-key"
MIDSCENE_MODEL_NAME="gpt-4o"
MIDSCENE_MODEL_FAMILY="azure-openai"
```

#### 阿里云 DashScope

```env
MIDSCENE_MODEL_BASE_URL="https://dashscope.aliyuncs.com/v1"
MIDSCENE_MODEL_API_KEY="sk-xxxx"
MIDSCENE_MODEL_NAME="qwen-vl-plus"
MIDSCENE_MODEL_FAMILY="qwen-vl"
```

### 启用调试日志

```bash
# 启用详细日志
MIDSCENE_LOG_LEVEL=debug npx tsx demo-wind-robust.ts
```

### 截取屏幕快照

Midscene 会自动生成报告文件，包含每一步的屏幕快照：

```
midscene_run/
├── report/
│   └── computer-2026-06-23_22-xx-xx-xxxx.html
└── screenshots/
    └── ...
```

---

## 📊 测试流程详解

### 完整流程（16 步）

1. **输入"股票数据浏览器"** → 在左下角搜索框输入
2. **点击选项** → 打开股票数据浏览器
3. **输入股票代码** → 输入"600006"
4. **选择股票** → 选择"东风股份"
5. **输入指标** → 输入"市值"
6. **选择 PE** → 从列表中选择
7. **选择分类** → 选择"内地股票指标"
8. **确认输入** → 按回车键
9. **右键点击** → 右键点击指标
10. **添加指标** → 在菜单中选择
11. **确认参数** → 使用默认值
12. **确认添加** → 点击确定
13. **提取数据** → 点击提取数据按钮
14. **等待加载** → 等待表格数据加载
15. **导出数据** → 点击导出数据按钮
16. **保存文件** → 修改路径并确认

---

## 💡 最佳实践

### 1. 开发阶段

- 使用健壮版本（`demo-wind-robust.ts`）
- 启用缓存加速调试
- 保持应用程序状态一致

### 2. 生产环境

- 使用只读缓存模式
- 增加重试次数
- 添加超时保护
- 定期清理缓存文件

### 3. CI/CD 集成

```bash
# 在 CI 环境中运行
MIDSCENE_CACHE_MODE=read-only npx tsx demo-wind-robust.ts
```

---

## 📚 相关资源

- [Midscene 官方文档](https://v1.midscenejs.com/)
- [PC Desktop 入门](https://v1.midscenejs.com/computer-getting-started)
- [API 参考](https://v1.midscenejs.com/computer-api-reference)
- [缓存机制](https://v1.midscenejs.com/caching.html)

---

## 🤝 支持

如遇问题，请：
1. 查看[故障排除](#故障排除)章节
2. 检查[官方文档](https://v1.midscenejs.com/)
3. 提交 Issue 到 [GitHub](https://github.com/web-infra-dev/midscene)

---

**版本**: 1.0.0  
**更新日期**: 2026-06-23  
**作者**: Midscene Windows Automation Team
