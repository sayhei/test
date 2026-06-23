# Wind金融终端 Midscene 自动化 - 快速参考

## 🚀 快速启动（3 步）

### 1️⃣ 安装依赖
```bash
npm install @midscene/computer
```

### 2️⃣ 配置模型（.env）
```env
MIDSCENE_MODEL_BASE_URL="http://localhost:14471/v1"
MIDSCENE_MODEL_API_KEY="ollama"
MIDSCENE_MODEL_NAME="huihui_ai/qwen3-vl-abliterated:4b-instruct"
MIDSCENE_MODEL_FAMILY="qwen3-vl"
MIDSCENE_USE_QWEN3_VL=1
```

### 3️⃣ 运行测试
```bash
npx tsx demo-wind-robust.ts
```

---

## 📁 文件清单

| 文件 | 说明 | 推荐场景 |
|------|------|---------|
| `demo-wind.ts` | 标准测试脚本 | 快速测试 |
| `demo-wind-robust.ts` | 健壮测试脚本 | 生产环境 |
| `demo-wind-example.ts` | 灵活使用示例 | 自定义测试 |
| `WIND_TEST_GUIDE.md` | 完整使用指南 | 参考文档 |
| `QUICK_REFERENCE.md` | 快速参考卡片 | 快速查询 |

---

## ⚡ 常用命令

### 开发调试
```bash
# 标准运行
npx tsx demo-wind-robust.ts

# 启用缓存（加速）
npx tsx demo-wind-robust.ts

# 查看详细日志
MIDSCENE_LOG_LEVEL=debug npx tsx demo-wind-robust.ts
```

### 生产运行
```bash
# 只读缓存（最快）
MIDSCENE_CACHE_MODE=read-only npx tsx demo-wind-robust.ts

# 自定义导出路径
npx tsx demo-wind-robust.ts
```

### 其他模型服务
```bash
# OpenAI
MIDSCENE_MODEL_BASE_URL="https://api.openai.com/v1" \
MIDSCENE_MODEL_API_KEY="sk-xxxx" \
MIDSCENE_MODEL_NAME="gpt-4o" \
npx tsx demo-wind-robust.ts

# 阿里云 DashScope
MIDSCENE_MODEL_BASE_URL="https://dashscope.aliyuncs.com/v1" \
MIDSCENE_MODEL_API_KEY="sk-xxxx" \
MIDSCENE_MODEL_NAME="qwen-vl-plus" \
npx tsx demo-wind-robust.ts
```

---

## 🔧 配置项（demo-wind-robust.ts）

```typescript
const CONFIG = {
  wind: {
    stockCode: '600006',           // ← 修改股票代码
    stockName: '东风股份',         // ← 修改股票名称
    indicators: ['市值', 'PE'],    // ← 修改指标列表
    exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',  // ← 修改导出路径
  },
  retry: {
    maxAttempts: 3,    // 最大重试次数
    delay: 2000,      // 重试延迟（毫秒）
  },
  wait: {
    short: 1000,      // 短等待
    medium: 2000,     // 中等待
    long: 3000,       // 长等待
  },
};
```

---

## 🐛 常见问题

### Q: 连接错误
```bash
# 检查 Ollama 状态
curl http://localhost:14471/api/tags

# 重启 Ollama
ollama serve
```

### Q: 权限被拒绝
```bash
# 以管理员权限运行终端
# 右键点击终端 → "以管理员身份运行"
```

### Q: 找不到元素
```bash
# 增加等待时间
# 编辑 CONFIG.wait 中的值
```

---

## 📊 测试流程（16 步）

1. 输入"股票数据浏览器"
2. 点击选项
3. 输入股票代码 600006
4. 选择东风股份
5. 输入市值
6. 选择 PE
7. 选择内地股票指标
8. 回车确认
9. 右键点击指标
10. 添加指标
11. 确认默认参数
12. 点击确定
13. 点击提取数据
14. 等待数据加载
15. 点击导出数据
16. 修改路径并确认

---

## 💡 提示

- ✅ 首次运行较慢（AI 推理）
- ✅ 后续运行使用缓存，速度快 10-50 倍
- ✅ 健壮版本有自动重试机制
- ✅ 报告文件在 `midscene_run/report/`
- ✅ 截图在 `midscene_run/screenshots/`

---

**版本**: 1.0.0  
**更新**: 2026-06-23
