# 🚀 Wind金融终端 Midscene 自动化 - 快速入门

## ⚡ 5 分钟快速开始

### 第一步：验证环境（30 秒）

```bash
npx tsx verify-setup.ts
```

看到 ✅ 就可以继续！

### 第二步：启动 Wind（1 分钟）

打开 Wind金融终端，确保主界面可见。

### 第三步：运行测试（5-10 分钟）

```bash
npx tsx demo-wind-robust.ts
```

完成！🎉

---

## 📚 学习顺序

### 新手（按顺序阅读）

1. **QUICK_REFERENCE.md** - 快速参考（5 分钟）
2. **运行测试** - 实际体验一下
3. **WIND_TEST_GUIDE.md** - 完整指南（15 分钟）
4. **CHECKLIST.md** - 故障排除

### 进阶

- 修改 `demo-wind-robust.ts` 中的参数
- 参考 `demo-wind-example.ts` 自定义测试
- 集成到 CI/CD

---

## 🔧 常用命令

```bash
# 验证环境
npx tsx verify-setup.ts

# 运行测试
npx tsx demo-wind-robust.ts

# 查看报告
start midscene_run\report

# 清理缓存
rmdir /s /q .midscene_cache
```

---

## 📁 核心文件

| 文件 | 用途 |
|------|------|
| `demo-wind-robust.ts` | 主测试脚本（推荐使用） |
| `verify-setup.ts` | 环境验证 |
| `WIND_TEST_GUIDE.md` | 完整文档 |
| `QUICK_REFERENCE.md` | 快速命令参考 |

---

## ⚙️ 修改配置

编辑 `demo-wind-robust.ts` 第 15-22 行：

```typescript
const CONFIG = {
  wind: {
    stockCode: '600006',           // ← 改股票代码
    stockName: '东风股份',         // ← 改股票名称
    indicators: ['市值', 'PE'],    // ← 改指标
    exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',  // ← 改路径
  },
};
```

---

## 🐛 遇到问题？

1. 运行 `npx tsx verify-setup.ts` 检查环境
2. 查看 `CHECKLIST.md` 故障排除章节
3. 查看 `WIND_TEST_GUIDE.md` 高级配置

---

**版本**: 1.0.0 | **更新**: 2026-06-23 | **状态**: ✅ 就绪
