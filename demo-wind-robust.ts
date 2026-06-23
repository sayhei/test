/**
 * Midscene.js Windows 桌面应用测试脚本（健壮版）
 * 
 * 测试目标：Wind金融终端 - 股票数据浏览器
 * 
 * 改进特性：无尘
 * - 自动启动 Wind 终端
 * - 等待窗口出现后再执行操作
 * - 更准确的步骤描述
 * - 管理员权限检查
 * - 详细的调试信息
 * 
 * 运行方式：
 *   npx tsx demo-wind-robust.ts
 */

import { agentForComputer } from '@midscene/computer';
import 'dotenv/config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 性能监控
const performanceMetrics = {
  steps: [] as Array<{ name: string; duration: number; timestamp: Date }>,
  startTime: new Date(),
  
  startStep(name: string) {
    return {
      name,
      startTime: Date.now(),
    };
  },
  
  endStep(step: { name: string; startTime: number }) {
    const duration = Date.now() - step.startTime;
    this.steps.push({
      name: step.name,
      duration,
      timestamp: new Date(),
    });
    console.log(`⏱️  ${step.name} 耗时: ${(duration / 1000).toFixed(2)}秒`);
    return duration;
  },
  
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 性能统计');
    console.log('='.repeat(60));
    
    const totalDuration = Date.now() - this.startTime.getTime();
    console.log(`总耗时: ${(totalDuration / 1000).toFixed(2)}秒`);
    console.log('');
    
    console.log('各步骤耗时:');
    this.steps.forEach((step, index) => {
      const percentage = ((step.duration / totalDuration) * 100).toFixed(1);
      console.log(`  ${index + 1}. ${step.name}: ${(step.duration / 1000).toFixed(2)}秒 (${percentage}%)`);
    });
    
    console.log('');
    console.log('最慢的 5 个步骤:');
    const sortedSteps = [...this.steps].sort((a, b) => b.duration - a.duration);
    sortedSteps.slice(0, 5).forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name}: ${(step.duration / 1000).toFixed(2)}秒`);
    });
    
    console.log('');
    console.log('💡 性能优化建议:');
    
    // 分析瓶颈
    const avgStepDuration = this.steps.reduce((sum, step) => sum + step.duration, 0) / this.steps.length;
    const slowSteps = this.steps.filter(step => step.duration > avgStepDuration * 2);
    
    if (slowSteps.length > 0) {
      console.log('  - 以下步骤耗时较长，建议优化:');
      slowSteps.forEach(step => {
        console.log(`    • ${step.name}: ${(step.duration / 1000).toFixed(2)}秒`);
      });
    }
    
    // 检查缓存配置
    if (process.env.MIDSCENE_CACHE !== 'true') {
      console.log('  - 启用缓存可以显著提升速度 (MIDSCENE_CACHE=true)');
    }
    
    if (process.env.MIDSCENE_CACHE_MODE !== 'read-write') {
      console.log('  - 设置缓存模式为 read-write 可以复用之前的决策');
    }
    
    console.log('='.repeat(60));
  },
};

// 配置项
const CONFIG = {
  wind: {
    stockCode: '600006',
    stockName: '东风股份',
    indicators: ['市值', 'PE'],
    exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',
    executablePath: process.env.WIND_EXECUTABLE_PATH || '',
  },
  retry: {
    maxAttempts: 3,
    delay: 3000,
  },
  wait: {
    short: 1500,
    medium: 3000,
    long: 5000,
    startup: 15000,
  },
  performance: {
    logEachStep: true, // 记录每个步骤的耗时
    slowThreshold: 10000, // 超过 10 秒视为慢操作
  },
};

// 辅助函数：带重试的操作
async function withRetry(
  operation: () => Promise<void>,
  operationName: string,
  maxAttempts: number = CONFIG.retry.maxAttempts
): Promise<boolean> {
  const step = performanceMetrics.startStep(operationName);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptStart = Date.now();
    try {
      console.log(`  尝试 ${attempt}/${maxAttempts}...`);
      await operation();
      const attemptDuration = Date.now() - attemptStart;
      console.log(`  ✅ ${operationName} - 成功 (本次尝试: ${(attemptDuration / 1000).toFixed(2)}秒)`);
      performanceMetrics.endStep(step);
      return true;
    } catch (error: any) {
      const attemptDuration = Date.now() - attemptStart;
      console.warn(`  ⚠️ ${operationName} - 失败 (${attempt}/${maxAttempts}) (本次尝试: ${(attemptDuration / 1000).toFixed(2)}秒)`);
      console.warn(`     错误信息: ${error.message?.slice(0, 100)}`);
      if (attempt < maxAttempts) {
        console.log(`  ⏳ 等待 ${CONFIG.retry.delay}ms 后重试...`);
        await sleep(CONFIG.retry.delay);
      } else {
        console.error(`  ❌ ${operationName} - 最终失败`);
        performanceMetrics.endStep(step);
        throw error;
      }
    }
  }
  return false;
}

// 使用 PowerShell 脚本精确激活 WMain 进程窗口
async function activateWindWindow(): Promise<void> {
  console.log('\n🔍 正在尝试激活 Wind 终端窗口...');
  
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  // 精确方法：通过进程名 WMain 找到窗口并激活
  const psScript = `
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Diagnostics;
    public class Win32 {
      [DllImport("user32.dll")]
      public static extern bool SetForegroundWindow(IntPtr hWnd);
      [DllImport("user32.dll")]
      public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
      [DllImport("user32.dll")]
      public static extern bool IsWindow(IntPtr hWnd);
      [DllImport("user32.dll")]
      public static extern bool IsWindowVisible(IntPtr hWnd);
      [DllImport("user32.dll")]
      public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
      [DllImport("user32.dll", SetLastError = true)]
      public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
      [DllImport("user32.dll")]
      public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
      public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    }
    "@
    
    # 获取 WMain 进程
    \$wmainProcess = Get-Process -Name "WMain" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (-not \$wmainProcess) {
      Write-Output "NoProcess"
      exit
    }
    
    \$targetHwnd = [IntPtr]::Zero
    \$targetTitle = ""
    
    # 枚举所有窗口，找到属于 WMain 进程的可见窗口
    \$callback = {
      param([IntPtr]\$hwnd, [IntPtr]\$lParam)
      
      if (-not [Win32]::IsWindowVisible(\$hwnd)) {
        return \$true  # 继续枚举
      }
      
      \$pid = 0
      [Win32]::GetWindowThreadProcessId(\$hwnd, [ref]\$pid) | Out-Null
      
      if (\$pid -eq \$wmainProcess.Id) {
        \$sb = New-Object System.Text.StringBuilder 256
        [Win32]::GetWindowText(\$hwnd, \$sb, 256) | Out-Null
        \$title = \$sb.ToString()
        
        # 只接受包含"Wind"或"金融"的窗口标题
        if (\$title -match "Wind|金融") {
          \$script:targetHwnd = \$hwnd
          \$script:targetTitle = \$title
          return \$false  # 停止枚举
        }
      }
      
      return \$true  # 继续枚举
    }
    
    \$proc = [Win32+EnumWindowsProc]\$callback
    [Win32]::EnumWindows(\$proc, [IntPtr]::Zero) | Out-Null
    
    if (\$script:targetHwnd -ne [IntPtr]::Zero) {
      [Win32]::ShowWindow(\$script:targetHwnd, 9)  # SW_RESTORE = 9
      [Win32]::SetForegroundWindow(\$script:targetHwnd)
      Write-Output "Success:\$(\$script:targetTitle)"
    } else {
      Write-Output "NotFound"
    }
  `;
  
  try {
    const { stdout } = await execAsync(`powershell -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { timeout: 10000 });
    const result = stdout.trim();
    
    if (result.startsWith('Success:')) {
      const title = result.split(':').slice(1).join(':');
      console.log(`✅ 已精确激活 WMain 进程窗口: ${title}`);
      
      // 二次验证：确认当前前台窗口确实是 Wind
      await sleep(500);
      try {
        const { stdout: verifyStdout } = await execAsync('powershell -Command "(Get-Process | Where-Object { $_.ProcessName -eq \'WMain\' -and $_.MainWindowHandle -ne 0 }).MainWindowTitle"');
        if (verifyStdout.trim() && verifyStdout.trim().includes('Wind')) {
          console.log(`✅ 验证成功: Wind 窗口已在前台`);
        }
      } catch (e) {
        // 验证失败不影响主流程
      }
      
      return;
    } else if (result === 'NoProcess') {
      console.warn('⚠️ 未找到 WMain 进程，Wind 终端可能未运行');
    } else {
      console.warn('⚠️ 无法找到 Wind 终端窗口');
    }
  } catch (error) {
    console.warn('⚠️ 窗口激活脚本执行失败');
  }
  
  console.warn('💡 请手动将 Wind 终端窗口带到最前面');
  console.log('⏳ 等待 5 秒...');
  await sleep(5000);
}

// 启动 Wind 终端
async function startWindTerminal(): Promise<void> {
  if (!CONFIG.wind.executablePath) {
    console.warn('⚠️ 未配置 Wind 终端路径，跳过自动启动');
    console.warn('💡 请确保 Wind 终端已手动启动');
    return;
  }

  if (!fs.existsSync(CONFIG.wind.executablePath)) {
    console.warn(`⚠️ Wind 终端路径不存在: ${CONFIG.wind.executablePath}`);
    console.warn('💡 请确保 Wind 终端已手动启动');
    return;
  }

  console.log(`🚀 启动 Wind 终端: ${CONFIG.wind.executablePath}`);
  
  try {
      // 检查是否已经在运行（进程名是 WMain）
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq WMain.exe" /FO CSV');
        if (stdout.includes('WMain.exe')) {
          console.log('✅ Wind 终端已在运行 (WMain 进程)');
          await activateWindWindow();
          return;
        }
      } catch (err) {
        // 进程未运行，继续启动
      }
      
      // 启动 Wind 终端
      spawn(CONFIG.wind.executablePath, [], {
        detached: true,
        stdio: 'ignore',
      });
      
      console.log(`⏳ 等待 Wind 终端启动... (${CONFIG.wait.startup}ms)`);
      await sleep(CONFIG.wait.startup);
      
      console.log('✅ Wind 终端启动完成');
      
      // 启动后激活窗口
      await activateWindWindow();
      
    } catch (error) {
      console.warn('⚠️ 启动 Wind 终端时出错');
      console.warn('💡 请确保 Wind 终端已手动启动');
  }
}

// 检查管理员权限
async function checkAdminRights(): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync('net session 2>&1');
    if (stdout.includes('Access is denied')) {
      console.warn('⚠️ 当前终端未以管理员身份运行');
      console.warn('💡 如果 Wind 终端以管理员身份运行，请以管理员身份启动终端');
      console.warn('   右键点击终端 → "以管理员身份运行"');
      console.log('');
    } else {
      console.log('✅ 当前终端以管理员身份运行');
      console.log('');
    }
  } catch (error) {
    // 忽略错误
  }
}

Promise.resolve(
  (async () => {
    console.log('🚀 Midscene Windows 桌面应用测试');
    console.log('=' .repeat(50));
    
    // 检查管理员权限
    await checkAdminRights();
    
    // 启动 Wind 终端
    await startWindTerminal();
    
    // 检查环境变量
    if (!process.env.MIDSCENE_MODEL_BASE_URL) {
      console.warn('⚠️ 警告：未检测到模型配置');
      console.warn('💡 请确保 .env 文件包含模型配置');
    }
    
    console.log('\n📦 初始化 Agent...\n');
    
    try {
      const agent = await agentForComputer();
      console.log('✅ Agent 初始化成功！\n');
      
      // ========== 激活 Wind 窗口 ==========
      console.log('📍 确保 Wind金融终端窗口在最前面...');
      await activateWindWindow();
      await sleep(CONFIG.wait.medium);
      
      // ========== 等待 Wind 界面加载 ==========
      console.log('📍 等待 Wind金融终端界面加载...');
      await agent.aiWaitFor('Wind金融终端主界面');
      await sleep(CONFIG.wait.medium);
      
      // ========== 阶段 1：打开股票数据浏览器 ==========
      console.log('\n📍 阶段 1：打开股票数据浏览器');
      console.log('-'.repeat(50));
      
      console.log('\n📝 步骤 1：找到右下角搜索框...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在 Wind 金融终端界面中，找到右下角带有"代码/名称/简拼/功能"提示文字的搜索输入框，点击激活它'),
        '激活搜索框'
      );
      await sleep(CONFIG.wait.short);
      
      console.log('\n📝 步骤 2：在搜索框中输入"股票数据浏览器"...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在已经激活的搜索框中输入"股票数据浏览器"，确保输入到当前激活的输入框中'),
        '输入"股票数据浏览器"'
      );
      await sleep(CONFIG.wait.short);
      
      console.log('\n📝 步骤 3：选择股票数据浏览器...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在搜索框下方弹出的下拉列表中，点击"股票数据浏览器"选项'),
        '点击"股票数据浏览器"选项'
      );
      await sleep(CONFIG.wait.medium);
      
      // ========== 阶段 2：输入股票代码 ==========
      console.log('\n📍 阶段 2：输入股票代码');
      console.log('-'.repeat(50));
      
      console.log('\n📝 步骤 4：等待股票数据浏览器页面加载...');
      await agent.aiWaitFor('股票数据浏览器页面');
      await sleep(CONFIG.wait.medium);
      
      console.log('\n📝 步骤 5：输入股票代码...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct(`在股票数据浏览器页面中，找到右下角的代码输入框，输入"${CONFIG.wind.stockCode}"`),
        `输入股票代码"${CONFIG.wind.stockCode}"`
      );
      await sleep(CONFIG.wait.short);
      
      console.log('\n📝 步骤 6：选择股票...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct(`在输入框下方弹出的股票列表中，点击"${CONFIG.wind.stockName}"`),
        `选择"${CONFIG.wind.stockName}"`
      );
      await sleep(CONFIG.wait.medium);
      
      // ========== 阶段 3：添加指标 ==========
      console.log('\n📍 阶段 3：添加指标');
      console.log('-'.repeat(50));
      
      for (const indicator of CONFIG.wind.indicators) {
        console.log(`\n📝 步骤：添加指标"${indicator}"...`);
        
        await activateWindWindow();
        await sleep(CONFIG.wait.short);
        
        await withRetry(
          () => agent.aiAct(`在股票数据浏览器页面的左侧面板中，找到带有"按拼音查找指标"提示文字的搜索框，输入"${indicator}"`),
          `输入指标"${indicator}"`
        );
        await sleep(CONFIG.wait.short);
        
        await activateWindWindow();
        await sleep(CONFIG.wait.short);
        
        await withRetry(
          () => agent.aiAct(`在左侧面板搜索结果中，点击"${indicator}"选项`),
          `选择指标"${indicator}"`
        );
        await sleep(CONFIG.wait.short);
      }
      
      console.log('\n📝 步骤：选择分类...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在分类列表中点击"内地股票指标"'),
        '选择"内地股票指标"'
      );
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('按回车键确认选择'),
        '按回车确认'
      );
      await sleep(CONFIG.wait.medium);
      
      // ========== 阶段 4：配置指标 ==========
      console.log('\n📍 阶段 4：配置指标参数');
      console.log('-'.repeat(50));
      
      console.log('\n📝 步骤：右键添加指标...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在股票数据浏览器页面的主表格区域，右键点击刚才添加的指标行'),
        '右键点击指标'
      );
      await sleep(CONFIG.wait.short);
      
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在右键菜单中选择"添加指标"选项'),
        '点击"添加指标"'
      );
      await sleep(CONFIG.wait.short);
      
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在弹出的"添加指标"对话框中，使用默认参数，点击"确定"按钮'),
        '确认默认参数并点击确定'
      );
      await sleep(CONFIG.wait.medium);
      
      // ========== 阶段 5：提取数据 ==========
      console.log('\n📍 阶段 5：提取数据');
      console.log('-'.repeat(50));
      
      console.log('\n📝 步骤：提取数据...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在股票数据浏览器页面中，点击左上角的"提取数据"按钮'),
        '点击"提取数据"'
      );
      
      console.log('⏳ 等待数据加载...');
      await agent.aiWaitFor('数据表格中显示股票数据');
      await sleep(CONFIG.wait.long);
      
      // ========== 阶段 6：导出数据 ==========
      console.log('\n📍 阶段 6：导出数据');
      console.log('-'.repeat(50));
      
      console.log('\n📝 步骤：导出数据...');
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在股票数据浏览器页面中，点击右上角的"导出数据"按钮'),
        '点击"导出数据"'
      );
      await sleep(CONFIG.wait.short);
      
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct(`在弹出的导出对话框中，找到文件保存路径输入框，输入"${CONFIG.wind.exportPath}"`),
        `修改导出路径为"${CONFIG.wind.exportPath}"`
      );
      await sleep(CONFIG.wait.short);
      
      await activateWindWindow();
      await sleep(CONFIG.wait.short);
      
      await withRetry(
        () => agent.aiAct('在导出对话框中，点击"确定"按钮开始导出'),
        '点击"确定"开始导出'
      );
      await sleep(CONFIG.wait.long);
      
      // ========== 完成 ==========
      console.log('\n' + '='.repeat(50));
      console.log('✅ 所有步骤执行完成！');
      console.log(`📊 数据已导出到：${CONFIG.wind.exportPath}`);
      
      const reportFile = agent.reportFile;
      if (reportFile) {
        console.log(`📄 测试报告：${reportFile}`);
      }
      
      await agent.destroy();
      
      // 打印性能统计
      performanceMetrics.printSummary();
      
      console.log('\n🎉 Wind金融终端自动化测试成功完成！');
      
    } catch (error: any) {
      console.error('\n❌ 测试执行失败：');
      console.error(error.message || error);
      console.error('\n💡 故障排除建议：');
      console.error('   1. 确保 Wind金融终端已启动并可见');
      console.error('   2. 如果 Wind 以管理员运行，请以管理员身份启动终端');
      console.error('   3. 检查模型配置是否正确');
      console.error('   4. 查看报告文件获取详细信息');
      console.error('   5. 报告路径: midscene_run/report/');
      
      // 即使失败也打印性能统计
      performanceMetrics.printSummary();
      
      process.exit(1);
    }
  })(),
);
