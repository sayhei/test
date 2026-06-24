import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    const { stdout } = await execAsync('ollama -v');
    return {
      name: 'Ollama',
      status: 'pass',
      message: `✓ ${stdout.trim()}`,
    };
  } catch (error) {
    return {
      name: 'Ollama',
      status: 'fail',
      message: '✗ Ollama 未安装或未配置',
      suggestion: '请安装 Ollama: https://ollama.com/',
    };
  }
}

async function checkMidsceneDependencies(): Promise<CheckResult> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {
      name: 'package.json',
      status: 'fail',
      message: '✗ package.json 不存在',
      suggestion: '请初始化项目: npm init -y',
    };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['@midscene/computer', '@midscene/web', '@playwright/test', 'playwright', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length === 0) {
    return {
      name: 'Midscene 依赖',
      status: 'pass',
      message: '✓ 所有必需依赖已安装',
    };
  } else {
    return {
      name: 'Midscene 依赖',
      status: 'fail',
      message: `✗ 缺少依赖: ${missingDeps.join(', ')}`,
      suggestion: `请安装依赖: npm install ${missingDeps.join(' ')}`,
    };
  }
}

async function checkEnvConfig(): Promise<CheckResult> {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    return {
      name: '.env 文件',
      status: 'fail',
      message: '✗ .env 文件不存在',
      suggestion: '请创建 .env 文件并配置环境变量',
    };
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = ['MIDSCENE_MODEL_BASE_URL', 'MIDSCENE_MODEL_NAME', 'MIDSCENE_MODEL_FAMILY'];
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length === 0) {
    return {
      name: '.env 配置',
      status: 'pass',
      message: '✓ 所有必需环境变量已配置',
    };
  } else {
    return {
      name: '.env 配置',
      status: 'warning',
      message: `⚠️ 缺少环境变量: ${missingVars.join(', ')}`,
      suggestion: '请在 .env 文件中添加缺失的环境变量',
    };
  }
}

async function checkWindTerminal(): Promise<CheckResult> {
  const windPaths = [
    'D:\\software\\Wind\\Wind.NET.Client\\WindNET\\bin\\windnet.exe',
    'C:\\software\\Wind\\Wind.NET.Client\\WindNET\\bin\\windnet.exe',
    'D:\\Wind\\Wind.NET.Client\\WindNET\\bin\\windnet.exe',
    'C:\\Wind\\Wind.NET.Client\\WindNET\\bin\\windnet.exe',
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Wind', 'windnet.exe'),
  ];
  
  const envPath = process.env.WIND_EXECUTABLE_PATH;
  
  if (envPath && fs.existsSync(envPath)) {
    return {
      name: 'Wind 终端路径',
      status: 'pass',
      message: `✓ 通过 .env 配置找到: ${envPath}`,
    };
  }
  
  for (const windPath of windPaths) {
    if (fs.existsSync(windPath)) {
      return {
        name: 'Wind 终端路径',
        status: 'pass',
        message: `✓ 自动检测到: ${windPath}`,
        suggestion: `建议在 .env 中添加: WIND_EXECUTABLE_PATH="${windPath}"`,
      };
    }
  }
  
  return {
    name: 'Wind 终端路径',
    status: 'warning',
    message: '⚠️ 未找到 Wind 终端安装路径',
    suggestion: '请在 .env 文件中手动配置 WIND_EXECUTABLE_PATH',
  };
}

async function checkExportPath(): Promise<CheckResult> {
  const exportPath = 'C:\\Users\\gyy\\Desktop\\新建文件夹';
  
  if (fs.existsSync(exportPath)) {
    return {
      name: '导出路径',
      status: 'pass',
      message: `✓ 导出目录存在: ${exportPath}`,
    };
  } else {
    try {
      fs.mkdirSync(exportPath, { recursive: true });
      return {
        name: '导出路径',
        status: 'pass',
        message: `✓ 已创建导出目录: ${exportPath}`,
      };
    } catch (error) {
      return {
        name: '导出路径',
        status: 'warning',
        message: `⚠️ 无法创建导出目录: ${exportPath}`,
        suggestion: '请手动创建导出目录',
      };
    }
  }
}

async function checkPlaywrightBrowsers(): Promise<CheckResult> {
  try {
    const { stdout } = await execAsync('npx playwright --version');
    return {
      name: 'Playwright',
      status: 'pass',
      message: `✓ ${stdout.trim()}`,
    };
  } catch (error) {
    return {
      name: 'Playwright',
      status: 'fail',
      message: '✗ Playwright 未安装',
      suggestion: '请安装 Playwright: npm install playwright',
    };
  }
}

async function main() {
  console.log('🔍 Midscene Wind 自动化 - 环境验证');
  console.log('='.repeat(60));
  console.log('');
  
  const checks: CheckResult[] = [
    await checkNodeVersion(),
    await checkOllama(),
    await checkMidsceneDependencies(),
    await checkPlaywrightBrowsers(),
    await checkEnvConfig(),
    await checkWindTerminal(),
    await checkExportPath(),
  ];
  
  console.log('📋 检查结果:');
  console.log('-'.repeat(60));
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const check of checks) {
    console.log('');
    
    if (check.status === 'pass') {
      passed++;
      console.log(`✅ ${check.name}`);
      console.log(`   ${check.message}`);
    } else if (check.status === 'fail') {
      failed++;
      console.log(`❌ ${check.name}`);
      console.log(`   ${check.message}`);
      if (check.suggestion) {
        console.log(`   💡 ${check.suggestion}`);
      }
    } else {
      warnings++;
      console.log(`⚠️ ${check.name}`);
      console.log(`   ${check.message}`);
      if (check.suggestion) {
        console.log(`   💡 ${check.suggestion}`);
      }
    }
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log(`📊 统计: ${passed} 通过, ${failed} 失败, ${warnings} 警告`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ 存在失败项，请修复后再运行测试！');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️ 存在警告项，建议检查并修复');
  } else {
    console.log('\n✅ 所有检查通过！可以开始运行测试');
  }
}

main().catch((error) => {
  console.error('\n❌ 验证脚本执行失败:', error);
  process.exit(1);
});