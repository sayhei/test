/**
 * 测试 Wind 终端窗口激活功能
 */

import { activateWindWindow, isWindRunning } from './src/lib/window';
import 'dotenv/config';

async function testWindowActivation() {
  console.log('🧪 测试 Wind 终端窗口激活功能');
  console.log('='.repeat(60));
  
  console.log('\n📋 检查 Wind 终端运行状态...');
  const isRunning = await isWindRunning();
  
  if (isRunning) {
    console.log('✅ Wind 终端正在运行');
  } else {
    console.log('❌ Wind 终端未运行');
    console.log('💡 请先启动 Wind 终端，然后再运行此测试');
    return;
  }
  
  console.log('\n🔄 测试窗口激活...');
  await activateWindWindow();
  
  console.log('\n✅ 测试完成！');
}

testWindowActivation().catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});