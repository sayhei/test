# Ui.Vision RPA 使用指南

Ui.Vision RPA 是基于图像识别的自动化测试工具，稳定性高，不需要 API Key。

---

## 📋 目录

- [安装配置](#安装配置)
- [运行测试](#运行测试)
- [宏文件说明](#宏文件说明)
- [手动导入宏](#手动导入宏)
- [常见问题](#常见问题)

---

## 🔧 安装配置

### 1. 安装浏览器扩展

| 浏览器 | 下载地址 |
|--------|---------|
| **Edge** | https://microsoftedge.microsoft.com/addons/detail/goapmjinbaeomoemgdcnnhoedopjnddd |
| Chrome | https://chrome.google.com/webstore/detail/uivision-rpa/gcbalfbdmfieckjlnblleoemohcganoc |
| Firefox | https://addons.mozilla.org/en-US/firefox/addon/rpa/ |

### 2. 安装 XModules（桌面自动化）

**必须安装**：桌面自动化需要 XModules 组件。

下载地址：https://ui.vision/rpa/x/download

选择 **Windows** 版本下载并安装。

### 3. 配置 Ui.Vision

1. 打开浏览器，点击 Ui.Vision 扩展图标
2. 进入 **Settings** → **XModule** 标签
3. 确认 XModules 已正确安装
4. 设置 **Ui.Vision RPA Home** 为项目目录（可选）

---

## 🚀 运行测试

### 方式一：命令行运行

```bash
npm run test:wind:rpa
```

### 方式二：批处理文件

双击 `run-wind-rpa.bat`。

### 方式三：手动运行

1. 打开浏览器，进入 Ui.Vision
2. 导入 `stock-browser-macro.csv` 宏文件
3. 点击 **Play** 运行

---

## 📝 宏文件说明

宏文件 `stock-browser-macro.csv` 定义了测试流程。

### 宏文件格式

```csv
Command,Target,Value
SelectWindow,Wind金融终端,10000
Pause,2000,
XClick,image=wind_search_box.png,
XType,stockdata,股票数据浏览器
```

### 常用命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `SelectWindow` | 选择窗口 | `SelectWindow,Wind金融终端,10000` |
| `XClick` | 图像/文本点击 | `XClick,image=button.png` |
| `XType` | 键盘输入 | `XType,stockdata,股票数据浏览器` |
| `XWaitForText` | 等待文本出现 | `XWaitForText,股票数据浏览器,10000` |
| `Pause` | 等待毫秒数 | `Pause,2000` |
| `XMove` | 移动鼠标 | `XMove,image=target.png` |
| `XClick,right` | 右键点击 | `XClick,right,image=element.png` |

### 参数说明

| 参数 | 说明 |
|------|------|
| `image=xxx.png` | 使用图像匹配 |
| `text=xxx` | 使用 OCR 文本识别 |
| `#123,456` | 使用固定坐标 |
| `timeout` | 超时时间（毫秒） |

---

## 🎯 手动导入宏

如果命令行运行失败，可以手动导入宏文件：

### 步骤 1：打开 Ui.Vision IDE

1. 点击浏览器扩展图标
2. 点击底部 **Open IDE** 按钮

### 步骤 2：导入宏文件

1. 在 IDE 中点击 **File** → **Open**
2. 选择 `E:\code\test-proj\src\tests\wind\stock-browser-macro.csv`
3. 宏文件会显示在左侧列表中

### 步骤 3：运行宏

1. 选择导入的宏
2. 点击 **Play** 按钮
3. 观察执行过程

---

## ⚠️ 常见问题

### Q1: 找不到宏文件？

**原因**：`storage=local` 模式从浏览器内部存储查找，而不是磁盘。

**解决方案**：
- 使用 `storage=file` 模式（已修复）
- 或手动导入宏文件

### Q2: XModules 未安装？

**症状**：桌面自动化命令无法执行。

**解决方案**：
1. 下载 XModules：https://ui.vision/rpa/x/download
2. 安装后重启浏览器
3. 在 Settings → XModule 中确认安装成功

### Q3: 图像识别失败？

**原因**：截图与实际界面不匹配。

**解决方案**：
1. 在 IDE 中重新截图
2. 使用 OCR 文本识别代替图像匹配：
   ```csv
   XClick,text=股票数据浏览器
   ```
3. 调整图像匹配阈值

### Q4: 窗口选择失败？

**原因**：窗口标题不匹配。

**解决方案**：
1. 检查窗口标题是否正确
2. 使用 `SelectWindow` 的通配符：
   ```csv
   SelectWindow,*Wind*,10000
   ```

### Q5: 需要 API Key？

**答案**：**不需要**。

传统 RPA 命令（`XClick`、`XType` 等）不需要 API Key。

只有 AI Computer Use 功能（`CU_*` 命令）需要 Anthropic API Key。

---

## 📊 与 Midscene 对比

| 特性 | Ui.Vision RPA | Midscene |
|------|---------------|----------|
| **稳定性** | ⭐⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中 |
| **学习成本** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 低 |
| **调试难度** | ⭐⭐⭐⭐⭐ 低 | ⭐⭐⭐ 中 |
| **API Key** | ❌ 不需要 | ✅ 需要 |
| **桌面支持** | 需要 XModules | 原生支持 |
| **页面变化** | ❌ 需重新截图 | ✅ AI 自适应 |

---

## 🛠️ 高级配置

### 自定义宏文件

编辑 `stock-browser-macro.csv`：

```csv
# 修改等待时间
Pause,5000,  # 增加到 5 秒

# 使用 OCR 文本识别
XClick,text=股票数据浏览器,  # 代替图像匹配

# 添加新步骤
XClick,image=new_button.png,
Pause,1000,
```

### 添加截图

1. 在 IDE 中点击 **Record**
2. 执行操作，自动截图
3. 截图保存到宏目录

### 调整匹配阈值

在 Settings 中调整：
- **Image Match Threshold**: 0.7-0.9（越高越严格）
- **OCR Confidence**: 0.5-0.8（越高越严格）

---

## 📚 相关文档

- [README.md](README.md) - 项目主文档
- [WIND_TEST_GUIDE.md](WIND_TEST_GUIDE.md) - Midscene 使用指南
- [CHECKLIST.md](CHECKLIST.md) - 测试前检查清单

---

**版本**: 1.0.0 | **更新**: 2026-06-24