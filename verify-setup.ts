/**
 * Midscene Wind 自动化 - 环境验证脚本
 * 
 * 快速检查所有依赖和配置是否正确
 * 
 * 运行方式：
 *   npx tsx verify-setup.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

async function checkNodeVersion(): Promise<CheckResult> {
  try {
    const { stdout } = await execAsync('node -v');
    const version = stdout.trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 18) {
      return {
        name: 'Node.js 版本',
        status: 'pass',
        message: `✓ Node.js ${version} (满足要求 ≥ 18.19.0)`,
      };
    } else {
      return {
        name: 'Node.js 版本',
        status: 'fail',
        message: `✗ Node.js ${version} (需要 ≥ 18.19.0)`,
        suggestion: '请升级 Node.js: https://nodejs.org/',
      };
    }
  } catch (error) {
    return {
      name: 'Node.js',
      status: 'fail',
      message: '✗ Node.js 未安装',
      suggestion: '请安装 Node.js: https://nodejs.org/',
    };
  }
}

async function checkOllama(): Promise<CheckResult> {
  try {
    const { stdout } = await execAsync('curl -s http://localhost:14471/api/tags');
    const data = JSON.parse(stdout);
    
    if (data.models && data.models.length > 0) {
      const modelNames = data.models.map((m: any) => m.name).join(', ');
      return {
        name: 'Ollama 服务',
        status: 'pass',
        message: `✓ Ollama 运行中，找到 ${data.models.length} 个模型`,
        suggestion: `可用模型: ${modelNames}`,
      };
    } else {
      return {
        name: 'Ollama 服务',
        status: 'warning',
        message: '⚠ Ollama 运行中，但未找到模型',
        suggestion: '请运行: ollama pull huihui_ai/qwen3-vl-abliterated:4b-instruct',
      };
    }
  } catch (error) {
    return {
      name: 'Ollama 服务',
      status: 'fail',
      message: '✗ Ollama 未运行或无法连接',
      suggestion: '请运行: ollama serve',
    };
  }
}

async function checkMidscene(): Promise<CheckResult> {
  try {
    // 检查 node_modules
    const midscenePath = path.join(__dirname, 'node_modules', '@midscene', 'computer');
    
    if (fs.existsSync(midscenePath)) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(midscenePath, 'package.json'), 'utf-8')
      );
      return {
        name: '@midscene/computer',
        status: 'pass',
        message: `✓ @midscene/computer ${packageJson.version} 已安装`,
      };
    } else {
      return {
        name: '@midscene/computer',
        status: 'fail',
        message: '✗ @midscene/computer 未安装',
        suggestion: '请运行: npm install @midscene/computer',
      };
    }
  } catch (error) {
    return {
      name: '@midscene/computer',
      status: 'fail',
      message: '✗ 检查 @midscene/computer 时出错',
      suggestion: '请运行: npm install @midscene/computer',
    };
  }
}

async function checkEnvFile(): Promise<CheckResult> {
  try {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      return {
        name: '.env 配置文件',
        status: 'fail',
        message: '✗ .env 文件不存在',
        suggestion: '请创建 .env 文件并配置模型参数',
      };
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
      'MIDSCENE_MODEL_BASE_URL',
      'MIDSCENE_MODEL_API_KEY',
      'MIDSCENE_MODEL_NAME',
      'MIDSCENE_MODEL_FAMILY',
    ];
    
    const missing = requiredVars.filter(
      (v) => !envContent.includes(v)
    );
    
    if (missing.length === 0) {
      return {
        name: '.env 配置文件',
        status: 'pass',
        message: '✓ .env 文件配置完整',
      };
    } else {
      return {
        name: '.env 配置文件',
        status: 'fail',
        message: `✗ .env 文件缺少配置: ${missing.join(', ')}`,
        suggestion: '请在 .env 文件中添加缺失的配置项',
      };
    }
  } catch (error) {
    return {
      name: '.env 配置文件',
      status: 'fail',
      message: '✗ 读取 .env 文件时出错',
      suggestion: '请检查 .env 文件格式',
    };
  }
}

async function findWindTerminal(): Promise<string | null> {
  // 常见 Wind 终端可执行文件名
  const exeNames = [
    'Wind.exe',
    'WindTerminal.exe',
    'Wind Terminal.exe',
    'Wind金融终端.exe',
    'wft.exe',
    'WFT.exe',
    'WindStart.exe',
    'WindLauncher.exe',
  ];
  
  // 常见安装目录
  const searchPaths = [
    'C:\\Program Files\\Wind',
    'C:\\Program Files (x86)\\Wind',
    'C:\\Wind',
    'D:\\Program Files\\Wind',
    'D:\\Program Files (x86)\\Wind',
    'D:\\Wind',
    path.join(process.env.LOCALAPPDATA || '', 'Wind'),
    path.join(process.env.APPDATA || '', 'Wind'),
    path.join(process.env.PROGRAMFILES || '', 'Wind'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Wind'),
  ];
  
  // 在常见目录中搜索
  for (const basePath of searchPaths) {
    if (fs.existsSync(basePath)) {
      for (const exeName of exeNames) {
        const fullPath = path.join(basePath, exeName);
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
        // 搜索子目录
        const subDirs = fs.readdirSync(basePath, { withFileTypes: true })
          .filter(dir => dir.isDirectory())
          .map(dir => dir.name);
        
        for (const subDir of subDirs) {
          const subPath = path.join(basePath, subDir, exeName);
          if (fs.existsSync(subPath)) {
            return subPath;
          }
        }
      }
    }
  }
  
  return null;
}

async function checkWindTerminal(): Promise<CheckResult> {
  try {
    // 方法0: 检查 .env 中配置的路径
    const envPath = process.env.WIND_EXECUTABLE_PATH;
    if (envPath && fs.existsSync(envPath)) {
      return {
        name: 'Wind 终端',
        status: 'pass',
        message: `✓ Wind 终端路径已配置: ${envPath}`,
      };
    }
    
    // 方法1: 在常见路径中搜索
    const foundPath = await findWindTerminal();
    
    if (foundPath) {
      return {
        name: 'Wind 终端',
        status: 'pass',
        message: `✓ Wind 终端已安装: ${foundPath}`,
      };
    }
    
    // 方法2: 检查任务管理器是否有 Wind 进程运行
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq Wind*.exe" /FO CSV');
      if (stdout.includes('.exe')) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          if (line.includes('Wind') && line.includes('.exe')) {
            const parts = line.split(',');
            const exeName = parts[0]?.replace(/"/g, '');
            if (exeName) {
              return {
                name: 'Wind 终端',
                status: 'pass',
                message: `✓ Wind 终端正在运行: ${exeName}`,
                suggestion: '请确保 Wind 终端窗口可见',
              };
            }
          }
        }
      }
    } catch (err) {
      // 任务管理器查询失败，忽略
    }
    
    // 方法3: 检查开始菜单快捷方式
    const startMenuPaths = [
      path.join(process.env.PROGRAMDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
      path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    ];
    
    for (const smPath of startMenuPaths) {
      if (fs.existsSync(smPath)) {
        try {
          const files = fs.readdirSync(smPath, { recursive: true });
          const windShortcut = files.find(f => {
            const lowerF = f.toLowerCase();
            return (lowerF.includes('wind') && !lowerF.includes('windows')) && 
                   (f.endsWith('.lnk') || lowerF.includes('金融') || lowerF.includes('终端'));
          });
          
          if (windShortcut) {
            return {
              name: 'Wind 终端',
              status: 'pass',
              message: `✓ 找到 Wind 终端快捷方式: ${windShortcut}`,
              suggestion: '请确认 Wind 终端已启动',
            };
          }
        } catch (err) {
          // 忽略权限错误
        }
      }
    }
    
    // 未找到，但不阻止测试运行
    return {
      name: 'Wind 终端',
      status: 'warning',
      message: '⚠ 自动检测未找到 Wind 终端路径',
      suggestion: 'Wind 终端仍可正常测试，请确保已启动并可见。如果需要自动启动，请在 .env 中配置 WIND_EXECUTABLE_PATH',
    };
    
  } catch (error) {
    return {
      name: 'Wind 终端',
      status: 'warning',
      message: '⚠ 检查 Wind 终端时出错',
      suggestion: '请手动确认 Wind 终端已安装并启动',
    };
  }
}

async function checkExportPath(): Promise<CheckResult> {
  try {
    const exportPath = 'C:\\Users\\gyy\\Desktop\\新建文件夹';
    
    if (fs.existsSync(path.dirname(exportPath))) {
      return {
        name: '导出路径',
        status: 'pass',
        message: `✓ 桌面路径存在: ${path.dirname(exportPath)}`,
      };
    } else {
      return {
        name: '导出路径',
        status: 'warning',
        message: `⚠ 桌面路径可能不存在: ${path.dirname(exportPath)}`,
        suggestion: '请确认桌面路径存在，或修改脚本中的导出路径',
      };
    }
  } catch (error) {
    return {
      name: '导出路径',
      status: 'warning',
      message: '⚠ 检查导出路径时出错',
      suggestion: '请手动确认桌面路径存在',
    };
  }
}

async function runAllChecks(): Promise<void> {
  console.log('🔍 Midscene Wind 自动化 - 环境验证');
  console.log('=' .repeat(50));
  console.log('');

  const checks = [
    checkNodeVersion,
    checkOllama,
    checkMidscene,
    checkEnvFile,
    checkWindTerminal,
    checkExportPath,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    process.stdout.write(`检查 ${(await check()).name}... `);
    const result = await check();
    console.log(result.message.split(' ')[0] === '✓' || result.message.split(' ')[0] === '⚠' 
      ? result.message 
      : result.message);
    results.push(result);
    
    if (result.status !== 'pass') {
      if (result.suggestion) {
        console.log(`   💡 建议: ${result.suggestion}`);
      }
    }
    console.log('');
    
    await sleep(500);
  }

  // 总结
  console.log('=' .repeat(50));
  console.log('📊 检查总结');
  console.log('-'.repeat(50));
  
  const passCount = results.filter((r) => r.status === 'pass').length;
  const warningCount = results.filter((r) => r.status === 'warning').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  
  console.log(`✓ 通过: ${passCount}`);
  console.log(`⚠ 警告: ${warningCount}`);
  console.log(`✗ 失败: ${failCount}`);
  console.log('');

  if (failCount > 0) {
    console.log('❌ 环境验证失败，请修复上述问题后重试');
    console.log('');
    console.log('💡 快速修复命令:');
    console.log('   1. npm install @midscene/computer');
    console.log('   2. ollama serve');
    console.log('   3. 创建 .env 文件');
    console.log('');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠ 环境验证完成，但存在警告');
    console.log('💡 建议修复警告项以获得最佳体验');
    console.log('');
  } else {
    console.log('✅ 环境验证通过！可以运行测试脚本');
    console.log('');
    console.log('🚀 下一步:');
    console.log('   npx tsx demo-wind-robust.ts');
    console.log('');
  }
}

runAllChecks().catch(console.error);
