/**
 * 通过 YAML 文件运行 Wind 金融终端测试流程
 * 使用 Midscene 的 runYaml API
 */

import { agentForComputer } from '@midscene/computer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { activateWindWindow } from '../../lib/window';
import { sleep } from '../../lib/sleep';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runFromYaml() {
  console.log('🚀 通过 YAML 文件运行 Wind 金融终端测试');
  console.log('='.repeat(60));

  const yamlPath = join(__dirname, 'stock-browser.yaml');
  const yamlContent = readFileSync(yamlPath, 'utf-8');
  
  console.log(`📋 加载 YAML 文件: ${yamlPath}`);
  
  const agent = await agentForComputer();
  
  console.log('\n🔍 激活 Wind 金融终端窗口...');
  await activateWindWindow();
  await sleep(1000);

  console.log('\n▶️ 开始执行 YAML 工作流...');
  
  try {
    const result = await agent.runYaml(yamlContent);
    console.log('\n✅ YAML 工作流执行完成！');
    console.log(`📊 执行结果: ${JSON.stringify(result)}`);
  } catch (error: any) {
    console.error('\n❌ YAML 工作流执行失败:', error.message);
    process.exit(1);
  }
}

runFromYaml().catch((error) => {
  console.error('\n❌ 执行失败:', error);
  process.exit(1);
});