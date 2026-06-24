import { exec } from 'child_process';
import { promisify } from 'util';
import { sleep } from './sleep';

const execAsync = promisify(exec);

export async function activateWindWindow(): Promise<void> {
  console.log('\n🔍 正在尝试激活 Wind 终端窗口...');
  
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

$wmainProcess = Get-Process -Name "wmain" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $wmainProcess) {
  Write-Output "NoProcess"
  exit
}

Write-Output "FoundProcess:$($wmainProcess.Id)"

$targetHwnd = [IntPtr]::Zero
$targetTitle = ""
$windowCount = 0

$callback = {
  param([IntPtr]$hwnd, [IntPtr]$lParam)
  
  if (-not [Win32]::IsWindowVisible($hwnd)) {
    return $true
  }
  
  $windowPid = 0
  [Win32]::GetWindowThreadProcessId($hwnd, [ref]$windowPid) | Out-Null
  
  if ($windowPid -eq $wmainProcess.Id) {
    $sb = New-Object System.Text.StringBuilder 256
    [Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $title = $sb.ToString()
    
    if ($title -match "Wind|金融") {
      $script:targetHwnd = $hwnd
      $script:targetTitle = $title
      $script:windowCount++
      return $false
    }
  }
  
  return $true
}

$proc = [Win32+EnumWindowsProc]$callback
[Win32]::EnumWindows($proc, [IntPtr]::Zero) | Out-Null

if ($script:targetHwnd -ne [IntPtr]::Zero) {
  Write-Output "WindowCount:$($script:windowCount)"
  
  # 使用 SW_SHOWMAXIMIZED (3) 最大化窗口
  [Win32]::ShowWindow($script:targetHwnd, 3)
  Start-Sleep -Milliseconds 200
  
  # 尝试多次激活（提高成功率）
  for ($i = 1; $i -le 3; $i++) {
    [Win32]::SetForegroundWindow($script:targetHwnd)
    Start-Sleep -Milliseconds 100
  }
  
  Write-Output "Success:$($script:targetTitle)"
} else {
  Write-Output "NotFound"
}
`;
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    // 创建临时 PowerShell 脚本文件
    const tempDir = os.tmpdir();
    const tempScriptPath = path.join(tempDir, 'activate-wind.ps1');
    
    fs.writeFileSync(tempScriptPath, psScript, 'utf-8');
    
    // 执行脚本
    const { stdout, stderr } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScriptPath}"`, { timeout: 10000 });
    
    // 删除临时文件
    fs.unlinkSync(tempScriptPath);
    
    if (stderr) {
      console.warn('⚠️ PowerShell 警告:', stderr.trim());
    }
    
    const result = stdout.trim();
    console.log('📋 PowerShell 输出:', result);
    
    if (result.includes('NoProcess')) {
      console.warn('⚠️ 未找到 wmain 进程，Wind 终端可能未运行');
      console.warn('💡 请检查 Wind 终端是否已启动');
    } else if (result.includes('NotFound')) {
      console.warn('⚠️ 找到了 wmain 进程，但没有找到包含"Wind"或"金融"的窗口');
      console.warn('💡 请检查 Wind 终端窗口是否正常显示');
    } else if (result.includes('Success:')) {
      const title = result.split('Success:')[1].trim();
      console.log(`✅ 已激活 Wind 终端窗口: ${title}`);
      
      await sleep(500);
      return;
    } else if (result.includes('FoundProcess:')) {
      console.warn('⚠️ 找到了 wmain 进程，但激活失败');
    }
  } catch (error: any) {
    console.warn('⚠️ 窗口激活脚本执行失败:', error.message);
  }
  
  console.warn('💡 请手动将 Wind 终端窗口带到最前面');
  console.log('⏳ 等待 5 秒...');
  await sleep(5000);
}

export async function isWindRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('powershell -Command "(Get-Process -Name wmain -ErrorAction SilentlyContinue).Count"');
    return parseInt(stdout.trim()) > 0;
  } catch {
    return false;
  }
}

export async function startWind(executablePath: string): Promise<void> {
  console.log(`\n🚀 启动 Wind 终端: ${executablePath}`);
  const { spawn } = await import('child_process');
  spawn(executablePath, [], { detached: true, stdio: 'ignore' });
  console.log('⏳ 等待 Wind 终端启动...');
  await sleep(15000);
}