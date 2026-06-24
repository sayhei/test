# Midscene 使用指南

Midscene 是 AI 驱动的自动化测试工具，支持 YAML 配置和 TypeScript 脚本。

---

## 📋 目录

- [YAML 配置方式](#yaml-配置方式)
- [TypeScript 脚本方式](#typescript-脚本方式)
- [缓存模式](#缓存模式)
- [YAML 指令说明](#yaml-指令说明)
- [常见问题](#常见问题)

---

## 📝 YAML 配置方式

### YAML 文件结构

`stock-browser.yaml` 定义测试流程：

```yaml
computer:
  displayId: '0'

tasks:
  - name: 点击右下角搜索框
    flow:
      - aiTap: ''
        locate: Wind金融终端窗口右下角的搜索输入框
      - sleep: 500

  - name: 输入"股票数据浏览器"
    flow:
      - aiInput: ''
        value: 股票数据浏览器
        locate: Wind金融终端窗口右下角的搜索输入框
      - sleep: 1500
```

### 运行 YAML 测试

```bash
npm run test:wind:yaml
```

---

## 💻 TypeScript 脚本方式

### 脚本文件

`stock-browser.ts` 使用 Midscene API：

```typescript
import { agentForComputer } from '@midscene/computer';

const agent = await agentForComputer();

await agent.aiAct('点击右下角搜索框');
await agent.aiInput('股票数据浏览器');
```

### 运行 TypeScript 测试

```bash
npm run test:wind
```

---

## 🚀 缓存模式

缓存模式可以大幅提高稳定性。

### 缓存模式说明

| 模式 | 说明 | 使用场景 |
|------|------|---------|
| `write` | 写入缓存 | 首次运行 |
| `read` | 只读缓存 | 后续运行（最快） |
| `off` | 关闭缓存 | 页面变化后 |

### 运行命令

```bash
# 首次运行：写入缓存
npm run test:wind:yaml:write

# 后续运行：使用缓存
npm run test:wind:yaml:read

# 关闭缓存
npm run test:wind:yaml:off
```

---

## 📋 YAML 指令说明

### 基础指令

| 指令 | 说明 | 示例 |
|------|------|------|
| `aiTap` | 左键单击 | `aiTap: ''` + `locate` |
| `aiInput` | 输入文本 | `aiInput: ''` + `value` |
| `aiAct` | 自由描述操作 | `aiAct: 右击元素` |
| `aiWaitFor` | 等待条件 | `aiWaitFor: 元素出现` |
| `sleep` | 固定等待 | `sleep: 2000` |

### locate 描述规范

```yaml
# ✅ 正确：精确描述
locate: Wind金融终端窗口内左侧面板，带有"按拼音查找指标"提示的输入框

# ❌ 错误：模糊描述
locate: 找到输入框
```

**关键特征**：
- 窗口范围：`Wind金融终端窗口内`
- 位置：`左侧面板`、`右下角`
- 提示文字：`带有"xxx"提示`
- 排除项：`（不是"xxx"）`

### 复杂操作

```yaml
# 右键点击
- aiAct: 在Wind金融终端窗口内，找到元素并执行鼠标右键点击

# 双击
- aiAct: 在Wind金融终端窗口内，找到元素并执行鼠标左键双击

# 等待元素
- aiWaitFor: Wind金融终端窗口内弹出对话框
  timeout: 10000
```

---

## ⚠️ 常见问题

### Q1: 操作不稳定？

**解决方案**：使用缓存模式

```bash
npm run test:wind:yaml:write  # 首次写入
npm run test:wind:yaml:read   # 后续使用
```

### Q2: 选错元素？

**解决方案**：精确 `locate` 描述

```yaml
# 添加排除项
locate: Wind金融终端窗口内第二行选项（不是第一行"全球股票指标"）

# 添加完整路径
locate: Wind金融终端窗口内"区间日均总市值 - 内地股票指标 - 行情指标"选项
```

### Q3: 右键/双击无效？

**解决方案**：使用 `aiAct` 而不是 `aiTap`

```yaml
# ❌ aiTap 只支持左键单击
- aiTap: ''
  locate: ...右键点击  # 无效

# ✅ aiAct 支持复杂操作
- aiAct: 执行鼠标右键点击
```

### Q4: 弹窗消失太快？

**解决方案**：增加等待时间

```yaml
- aiInput: ''
  value: 股票数据浏览器
- sleep: 2000  # 增加等待
- aiWaitFor: 弹出下拉列表  # 验证弹窗
```

### Q5: Ollama 连接失败？

**解决方案**：检查 Ollama 服务

```bash
ollama serve
curl http://localhost:14471/api/tags
```

---

## 🛠️ 高级配置

### 自定义 YAML 流程

编辑 `stock-browser.yaml`：

```yaml
# 修改等待时间
- sleep: 3000  # 增加到 3 秒

# 添加新步骤
- name: 新步骤
  flow:
    - aiTap: ''
      locate: Wind金融终端窗口内新元素
    - sleep: 1000
```

### 自定义 TypeScript 脚本

编辑 `stock-browser.ts`：

```typescript
// 修改股票代码
const stockCode = '600006';

// 修改指标
const indicators = ['市值', 'PE'];

// 修改导出路径
const exportPath = 'C:\\Users\\gyy\\Desktop\\新建文件夹';
```

---

## 📊 与 Ui.Vision 对比

| 特性 | Midscene | Ui.Vision RPA |
|------|----------|---------------|
| **稳定性** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 高 |
| **学习成本** | ⭐⭐⭐⭐⭐ 低 | ⭐⭐⭐ 中 |
| **调试难度** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 低 |
| **API Key** | ✅ 需要 | ❌ 不需要 |
| **桌面支持** | 原生支持 | 需要 XModules |
| **页面变化** | ✅ AI 自适应 | ❌ 需重新截图 |

---

## 📚 相关文档

- [README.md](README.md) - 项目主文档
- [UIVISION_GUIDE.md](UIVISION_GUIDE.md) - Ui.Vision 使用指南
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - 性能优化
- [CHECKLIST.md](CHECKLIST.md) - 测试前检查清单

---

**版本**: 2.0.0 | **更新**: 2026-06-24