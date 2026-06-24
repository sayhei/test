import { agentForComputer } from '@midscene/computer';
import 'dotenv/config';
import { sleep } from '../../lib/sleep';
import { withRetry } from '../../lib/retry';
import { activateWindWindow, isWindRunning, startWind } from '../../lib/window';
import { PerformanceMetrics } from '../../lib/performance';
import { CONFIG } from '../../config';

const performanceMetrics = new PerformanceMetrics();

async function runTest() {
  console.log('🚀 Midscene Windows 桌面应用测试');
  console.log('='.repeat(50));

  console.log('\n🔧 检查 Wind 终端运行状态...');
  if (!(await isWindRunning())) {
    if (!CONFIG.wind.executablePath) {
      console.error('❌ 未配置 Wind 终端路径，请在 .env 中设置 WIND_EXECUTABLE_PATH');
      process.exit(1);
    }
    await startWind(CONFIG.wind.executablePath);
  } else {
    console.log('✅ Wind 终端已在运行');
  }

  await activateWindWindow();

  console.log('\n📦 初始化 Agent...');
  const agent = await agentForComputer();
  console.log('✅ Agent 初始化成功！');

  await activateWindWindow();
  console.log('\n📍 等待 Wind金融终端界面加载...');
  await sleep(CONFIG.wait.medium);

  // ========== 阶段 1：打开股票数据浏览器 ==========
  console.log('\n📍 阶段 1：打开股票数据浏览器');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤 1：找到右下角搜索框...');
  const step1 = performanceMetrics.startStep('激活搜索框');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端界面中，找到右下角带有"代码/名称/简拼/功能"提示文字的搜索输入框，点击激活它'),
    '激活搜索框',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step1);
  
  console.log('\n📝 步骤 2：在搜索框中输入"股票数据浏览器"...');
  const step2 = performanceMetrics.startStep('输入"股票数据浏览器"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在已经激活的搜索框中输入"股票数据浏览器"，确保输入到当前激活的输入框中'),
    '输入"股票数据浏览器"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step2);
  
  console.log('\n📝 步骤 3：选择股票数据浏览器...');
  const step3 = performanceMetrics.startStep('点击"股票数据浏览器"选项');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在搜索框下方的下拉列表中找到"股票数据浏览器"（注意：不是"板块数据浏览器"），点击它'),
    '点击"股票数据浏览器"选项',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step3);
  
  console.log('\n📝 步骤 4：验证是否正确打开股票数据浏览器...');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  try {
    await agent.aiWaitFor('股票数据浏览器页面', { timeout: 5000 });
    console.log('✅ 验证通过：正确打开了股票数据浏览器');
  } catch (error) {
    console.warn('⚠️ 可能打开了错误的页面');
    console.log('📝 尝试关闭当前页面，重新选择...');
    await activateWindWindow();
    await sleep(CONFIG.wait.short);
    
    // 按 ESC 关闭当前页面
    await agent.aiAct('按 ESC 键关闭当前页面');
    await sleep(CONFIG.wait.short);
    
    // 重新输入
    await activateWindWindow();
    await sleep(CONFIG.wait.short);
    await agent.aiAct('点击右下角的搜索框');
    await sleep(CONFIG.wait.short);
    await agent.aiAct('输入"股票数据浏览器"（完整的四个字）');
    await sleep(CONFIG.wait.short);
    await agent.aiAct('在下拉列表中点击标有"股票数据浏览器"的选项（不要点击"板块"开头的任何选项）');
    await sleep(CONFIG.wait.medium);
  }

  // ========== 阶段 2：输入股票代码 ==========
  console.log('\n📍 阶段 2：输入股票代码');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤 5：等待股票数据浏览器页面加载...');
  await agent.aiWaitFor('股票数据浏览器页面');
  await sleep(CONFIG.wait.medium);
  
  console.log('\n📝 步骤 6：输入股票代码...');
  const step4 = performanceMetrics.startStep(`输入股票代码"${CONFIG.wind.stockCode}"`);
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct(`在股票数据浏览器页面中，找到右下角的代码输入框，输入"${CONFIG.wind.stockCode}"`),
    `输入股票代码"${CONFIG.wind.stockCode}"`,
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step4);
  
  console.log('\n📝 步骤 7：选择股票...');
  const step5 = performanceMetrics.startStep(`选择"${CONFIG.wind.stockName}"`);
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct(`在输入框下方弹出的股票列表中，点击"${CONFIG.wind.stockName}"`),
    `选择"${CONFIG.wind.stockName}"`,
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step5);

  // ========== 阶段 3：添加指标 ==========
  console.log('\n📍 阶段 3：添加指标');
  console.log('-'.repeat(50));
  
  for (const indicator of CONFIG.wind.indicators) {
    console.log(`\n📝 步骤：添加指标"${indicator}"...`);
    const step = performanceMetrics.startStep(`添加指标"${indicator}"`);
    
    await activateWindWindow();
    await sleep(CONFIG.wait.short);
    
    await withRetry(
      () => agent.aiAct(`在股票数据浏览器页面的左侧面板中，找到带有"按拼音查找指标"提示文字的搜索框，输入"${indicator}"`),
      `输入指标"${indicator}"`,
      { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
    );
    await sleep(CONFIG.wait.short);
    
    await activateWindWindow();
    await sleep(CONFIG.wait.short);
    
    await withRetry(
      () => agent.aiAct(`在左侧面板搜索结果中，点击"${indicator}"选项`),
      `选择指标"${indicator}"`,
      { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
    );
    await sleep(CONFIG.wait.short);
    performanceMetrics.endStep(step);
  }
  
  console.log('\n📝 步骤：选择分类...');
  const step6 = performanceMetrics.startStep('选择"内地股票指标"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在分类列表中点击"内地股票指标"'),
    '选择"内地股票指标"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('按回车键确认选择'),
    '按回车确认',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step6);

  // ========== 阶段 4：配置指标 ==========
  console.log('\n📍 阶段 4：配置指标参数');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤：右键添加指标...');
  const step7 = performanceMetrics.startStep('右键添加指标');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在股票数据浏览器页面的主表格区域，右键点击刚才添加的指标行'),
    '右键点击指标',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在右键菜单中选择"添加指标"选项'),
    '点击"添加指标"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在弹出的"添加指标"对话框中，使用默认参数，点击"确定"按钮'),
    '确认默认参数并点击确定',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step7);

  // ========== 阶段 5：提取数据 ==========
  console.log('\n📍 阶段 5：提取数据');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤：提取数据...');
  const step8 = performanceMetrics.startStep('点击"提取数据"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在股票数据浏览器页面中，点击左上角的"提取数据"按钮'),
    '点击"提取数据"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  
  console.log('⏳ 等待数据加载...');
  await agent.aiWaitFor('数据表格中显示股票数据');
  await sleep(CONFIG.wait.long);
  performanceMetrics.endStep(step8);

  // ========== 阶段 6：导出数据 ==========
  console.log('\n📍 阶段 6：导出数据');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤：导出数据...');
  const step9 = performanceMetrics.startStep('点击"导出数据"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在股票数据浏览器页面中，点击右上角的"导出数据"按钮'),
    '点击"导出数据"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct(`在弹出的导出对话框中，找到文件保存路径输入框，输入"${CONFIG.wind.exportPath}"`),
    `修改导出路径为"${CONFIG.wind.exportPath}"`,
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在导出对话框中，点击"确定"按钮开始导出'),
    '点击"确定"开始导出',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.long);
  performanceMetrics.endStep(step9);

  // ========== 完成 ==========
  console.log('\n🎉 测试完成！');
  performanceMetrics.printSummary();
  
  console.log('\n📋 操作总结：');
  console.log(`  • 股票代码: ${CONFIG.wind.stockCode} (${CONFIG.wind.stockName})`);
  console.log(`  • 添加指标: ${CONFIG.wind.indicators.join(', ')}`);
  console.log(`  • 导出路径: ${CONFIG.wind.exportPath}`);
}

runTest().catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});