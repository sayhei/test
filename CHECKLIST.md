# Wind金融终端 Midscene 自动化 - 测试前检查清单

## ✅ 运行前必须检查

### 1. 环境检查

- [ ] **Node.js 版本**: `node -v` (需要 ≥ 18.19.0)
- [ ] **npm 版本**: `npm -v` (需要 ≥ 8.0.0)
- [ ] **Ollama 状态**: `curl http://localhost:14471/api/tags`
- [ ] **模型可用**: 确认 qwen3-vl 模型已下载

### 2. 依赖检查

- [ ] **@midscene/computer 已安装**: `npm list @midscene/computer`
- [ ] **dotenv 已安装**: `npm list dotenv`

### 3. 配置检查

- [ ] **.env 文件存在**: 项目根目录包含 .env 文件
- [ ] **模型配置正确**: 
  - MIDSCENE_MODEL_BASE_URL
  - MIDSCENE_MODEL_API_KEY
  - MIDSCENE_MODEL_NAME
  - MIDSCENE_MODEL_FAMILY

### 4. Wind 终端检查

- [ ] **Wind 终端已安装**: 在开始菜单可找到
- [ ] **Wind 终端可启动**: 双击可正常启动
- [ ] **权限正常**: 非管理员模式或管理员模式（需同步）

### 5. 导出路径检查

- [ ] **桌面路径存在**: `C:\Users\gyy\Desktop`
- [ ] **可写入权限**: 有权在该路径创建文件夹

---

## 🔍 快速验证命令

### 检查 Ollama 和模型

```bash
# 检查 Ollama 状态
curl http://localhost:14471/api/tags

# 如果失败，启动 Ollama
ollama serve

# 列出可用模型
ollama list

# 测试特定模型
ollama run huihui_ai/qwen3-vl-abliterated:4b-instruct "Hello"
```

### 检查 Midscene 安装

```bash
# 列出已安装的 midscene 包
npm list @midscene

# 检查 @midscene/computer 版本
npm list @midscene/computer
```

### 检查配置文件

```bash
# 检查 .env 文件
cat .env

# 或手动查看 .env 文件内容
```

---

## ⚠️ 常见问题及解决方案

### ❌ 问题 1: Ollama 连接失败

**症状**:
```
Error: Connection error
```

**解决方案**:
```bash
# 1. 检查 Ollama 进程
tasklist | findstr ollama

# 2. 如果没有运行，启动 Ollama
ollama serve

# 3. 检查端口
netstat -ano | findstr 14471

# 4. 重启 Ollama（如果端口被占用）
taskkill /F /IM ollama.exe
ollama serve
```

### ❌ 问题 2: 模型不可用

**症状**:
```
Error: model not found
```

**解决方案**:
```bash
# 1. 列出可用模型
ollama list

# 2. 拉取模型（如果不存在）
ollama pull huihui_ai/qwen3-vl-abliterated:4b-instruct

# 3. 或使用默认模型
ollama pull qwen2.5-vl
```

### ❌ 问题 3: Wind 终端无响应

**症状**:
```
Error: Cannot locate element
```

**解决方案**:
1. 确保 Wind 终端完全启动
2. 关闭 Wind 终端并重新启动
3. 检查屏幕分辨率设置
4. 尝试最大化窗口

### ❌ 问题 4: 权限被拒绝

**症状**:
```
Error: Access denied
```

**解决方案**:
```bash
# 方案 1: 以管理员权限运行
# 右键点击 PowerShell/终端 → "以管理员身份运行"

# 方案 2: 修改 Wind 终端权限
# 1. 右键点击 Wind 终端快捷方式
# 2. 选择"属性"
# 3. 取消"以管理员身份运行"
# 4. 点击"确定"
```

### ❌ 问题 5: 导出路径不存在

**症状**:
```
Error: Path not found
```

**解决方案**:
```bash
# 1. 手动创建文件夹
mkdir "C:\Users\gyy\Desktop\新建文件夹"

# 2. 或修改脚本中的导出路径
# 编辑 demo-wind-robust.ts 中的 CONFIG.wind.exportPath
```

---

## 🚀 快速启动流程

### 第一步：验证环境（2 分钟）

```bash
# 检查 Node.js
node -v

# 检查 Ollama
curl http://localhost:14471/api/tags

# 检查 Midscene
npm list @midscene/computer
```

### 第二步：确认配置（1 分钟）

```bash
# 查看 .env 文件
cat .env
```

### 第三步：启动 Wind（1 分钟）

- 打开 Wind金融终端
- 等待完全启动
- 确认主界面可见

### 第四步：运行测试（5-10 分钟）

```bash
# 方式 1: 使用健壮版本（推荐）
npx tsx demo-wind-robust.ts

# 方式 2: 使用标准版本
npx tsx demo-wind.ts
```

### 第五步：检查结果（1 分钟）

- 查看终端输出
- 检查桌面下载文件夹
- 查看 Midscene 报告

---

## 📞 故障排除资源

### 官方文档
- [Midscene 官方文档](https://v1.midscenejs.com/)
- [PC Desktop 入门](https://v1.midscenejs.com/computer-getting-started)
- [API 参考](https://v1.midscenejs.com/computer-api-reference)

### 社区资源
- [GitHub Issues](https://github.com/web-infra-dev/midscene/issues)
- [示例项目](https://github.com/web-infra-dev/midscene-example)

### 日志文件
- Midscene 报告: `midscene_run/report/`
- 截图文件: `midscene_run/screenshots/`
- 缓存文件: `.midscene_cache/`

---

## ✅ 测试通过标准

- [ ] 所有 16 个步骤成功执行
- [ ] 终端无错误输出
- [ ] 数据成功导出到指定路径
- [ ] Midscene 报告生成成功
- [ ] Wind 终端保持正常状态

---

**最后更新**: 2026-06-23  
**检查清单版本**: 1.0.0
