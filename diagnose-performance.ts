/**
 * Midscene 性能诊断脚本
 * 
 * 测试各个阶段的耗时：
 * 1. 截图速度
 * 2. 模型推理速度
 * 3. 实际操作速度
 */

import { agentForComputer } from '@midscene/computer';
import 'dotenv/config';
import { sleep } from './src/lib/sleep';

async function testPerformance() {
  console.log('🚀 Midscene 性能诊断');
  console.log('='.repeat(60));
  
  // 读取环境变量
  console.log('\n📋 当前配置:');
  console.log(`  模型: ${process.env.MIDSCENE_MODEL_NAME}`);
  console.log(`  模型地址: ${process.env.MIDSCENE_MODEL_BASE_URL}`);
  console.log(`  缓存: ${process.env.MIDSCENE_CACHE}`);
  console.log(`  缓存模式: ${process.env.MIDSCENE_CACHE_MODE}`);
  
  console.log('\n⏱️ 阶段 1：初始化 Agent');
  const initStart = Date.now();
  const agent = await agentForComputer();
  const initTime = Date.now() - initStart;
  console.log(`  ✅ Agent 初始化耗时: ${(initTime / 1000).toFixed(2)}秒`);
  
  console.log('\n⏱️ 阶段 2：截图速度测试');
  const screenshotStart = Date.now();
  await agent.aiQuery('桌面上有几个图标？');
  const screenshotTime = Date.now() - screenshotStart;
  console.log(`  ✅ 单次查询耗时: ${(screenshotTime / 1000).toFixed(2)}秒`);
  
  console.log('\n⏱️ 阶段 3：操作速度测试（无缓存）');
  console.log('  （这是第一次运行，会生成缓存）');
  
  const actionStart = Date.now();
  await agent.aiAct('将鼠标移到屏幕右下角，保持 1 秒');
  const actionTime = Date.now() - actionStart;
  console.log(`  ✅ 首次操作耗时: ${(actionTime / 1000).toFixed(2)}秒`);
  
  console.log('\n⏱️ 阶段 4：操作速度测试（使用缓存）');
  console.log('  （这是第二次运行，应该使用缓存）');
  
  const cacheStart = Date.now();
  await agent.aiAct('将鼠标移到屏幕右下角，保持 1 秒');
  const cacheTime = Date.now() - cacheStart;
  console.log(`  ✅ 缓存操作耗时: ${(cacheTime / 1000).toFixed(2)}秒`);
  
  // 分析结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 性能分析结果');
  console.log('='.repeat(60));
  
  const speedup = actionTime / cacheTime;
  console.log(`\n缓存加速比: ${speedup.toFixed(2)}x`);
  
  if (actionTime > 30000) {
    console.log('\n⚠️ 警告：操作耗时过长 (>30秒)');
    console.log('可能原因：');
    console.log('  1. 模型推理速度慢');
    console.log('  2. 截图过大导致传输慢');
    console.log('  3. 网络延迟（如果是远程模型）');
  }
  
  if (cacheTime > 5000) {
    console.log('\n⚠️ 警告：缓存操作仍然慢 (>5秒)');
    console.log('可能原因：');
    console.log('  1. Midscene 内部仍有开销');
    console.log('  2. 截图仍然每次都发送');
  }
  
  console.log('\n💡 优化建议:');
  
  if (actionTime > 15000) {
    console.log('  1. 考虑使用更小的模型（如 qwen2-vl:2b）');
    console.log('  2. 或者使用量化模型减少计算量');
  }
  
  if (speedup < 2) {
    console.log('  3. 缓存效果不明显，检查 MIDSCENE_CACHE 配置');
  }
  
  console.log('\n✅ 诊断完成！');
}

testPerformance().catch((error) => {
  console.error('\n❌ 诊断失败:', error);
  process.exit(1);
});
