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
  
  console.log('\n📝 步骤 1：点击右下角搜索框...');
  const step1 = performanceMetrics.startStep('点击搜索框');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内，找到右下角区域带有"代码/名称/简拼/功能"提示文字的搜索输入框，点击它激活输入'),
    '点击搜索框',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step1);
  
  console.log('\n📝 步骤 2：在搜索框中输入"股票数据浏览器"...');
  const step2 = performanceMetrics.startStep('输入"股票数据浏览器"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内已激活的搜索框中输入"股票数据浏览器"四个字，确保输入到 Wind 终端的输入框中，不要输入到系统其他位置'),
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
    () => agent.aiAct('在 Wind 金融终端窗口内，搜索框下方弹出的下拉列表中找到"股票数据浏览器"选项（注意：不是"板块数据浏览器"），点击它'),
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
    await agent.aiAct('在 Wind 金融终端窗口内按 ESC 键关闭当前页面');
    await sleep(CONFIG.wait.short);
    
    // 重新输入
    await activateWindWindow();
    await sleep(CONFIG.wait.short);
    await agent.aiAct('在 Wind 金融终端窗口内，点击右下角的搜索框');
    await sleep(CONFIG.wait.short);
    await agent.aiAct('在 Wind 金融终端窗口内的搜索框中输入"股票数据浏览器"（完整的四个字）');
    await sleep(CONFIG.wait.short);
    await agent.aiAct('在 Wind 金融终端窗口内的下拉列表中点击标有"股票数据浏览器"的选项（不要点击"板块"开头的任何选项）');
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
    () => agent.aiAct(`在 Wind 金融终端窗口内的股票数据浏览器页面中，找到右下角区域的代码输入框（带有"代码"提示），输入"${CONFIG.wind.stockCode}"，确保输入到 Wind 终端内的输入框，不要输入到系统 dock 栏或其他位置`),
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
    () => agent.aiAct(`在 Wind 金融终端窗口内，输入框下方弹出的股票列表中，点击"${CONFIG.wind.stockName}"`),
    `选择"${CONFIG.wind.stockName}"`,
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step5);

  // ========== 阶段 3：添加指标 ==========
  console.log('\n📍 阶段 3：添加指标');
  console.log('-'.repeat(50));
  
  // 步骤 1：输入"市值"
  console.log('\n📝 步骤 1：在左侧面板输入"市值"...');
  const step3_1 = performanceMetrics.startStep('输入"市值"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内的股票数据浏览器页面左侧面板，找到"按拼音查找指标"输入框，输入"市值"'),
    '输入"市值"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step3_1);
  
  // 步骤 2：选择"区间日均总市值"
  console.log('\n📝 步骤 2：选择"区间日均总市值"选项...');
  const step3_2 = performanceMetrics.startStep('选择"区间日均总市值"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内，左侧面板弹出的选项列表中，找到包含"区间日均总市值"和"内地股票指标"和"行情指标"和"区间"的选项，点击选中它'),
    '选择"区间日均总市值"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step3_2);
  
  // 步骤 3：右击"区间日均总市值"并添加指标
  console.log('\n📝 步骤 3：右击"区间日均总市值"添加指标...');
  const step3_3 = performanceMetrics.startStep('右击添加市值指标');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内，左侧面板上方的待选指标列表中，找到"区间日均总市值"指标，右击它'),
    '右击"区间日均总市值"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内弹出的右键菜单中，点击"添加指标"选项'),
    '点击"添加指标"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step3_3);
  
  // 步骤 4：输入"pe"
  console.log('\n📝 步骤 4：在左侧面板输入"pe"...');
  const step3_4 = performanceMetrics.startStep('输入"pe"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内的股票数据浏览器页面左侧面板，找到"按拼音查找指标"输入框，输入"pe"'),
    '输入"pe"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step3_4);
  
  // 步骤 5：选择"市盈率(TTM)"
  console.log('\n📝 步骤 5：选择"市盈率(TTM)"选项...');
  const step3_5 = performanceMetrics.startStep('选择"市盈率(TTM)"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内，左侧面板弹出的选项列表中，找到包含"市盈率"和"TTM"和"内地股票指标"和"估值指标"的选项，点击选中它'),
    '选择"市盈率(TTM)"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  performanceMetrics.endStep(step3_5);
  
  // 步骤 6：右击"市盈率(TTM)"并添加指标
  console.log('\n📝 步骤 6：右击"市盈率(TTM)"添加指标...');
  const step3_6 = performanceMetrics.startStep('右击添加PE指标');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内，左侧面板上方的待选指标列表中，找到"市盈率(TTM)"或"市盈率（TTM）"指标，右击它'),
    '右击"市盈率(TTM)"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内弹出的右键菜单中，点击"添加指标"选项'),
    '点击"添加指标"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.medium);
  performanceMetrics.endStep(step3_6);

  // ========== 阶段 4：提取数据 ==========
  console.log('\n📍 阶段 4：提取数据');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤：点击"提取数据"...');
  const step_extract = performanceMetrics.startStep('点击"提取数据"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内的股票数据浏览器页面左上角区域，点击"提取数据"按钮'),
    '点击"提取数据"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  
  console.log('⏳ 等待数据加载...');
  await agent.aiWaitFor('数据表格中显示股票数据');
  await sleep(CONFIG.wait.long);
  performanceMetrics.endStep(step_extract);

  // ========== 阶段 5：导出数据 ==========
  console.log('\n📍 阶段 5：导出数据');
  console.log('-'.repeat(50));
  
  console.log('\n📝 步骤：导出数据...');
  const step_export = performanceMetrics.startStep('点击"导出数据"');
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内的股票数据浏览器页面右上角区域，点击"导出数据"按钮'),
    '点击"导出数据"',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct(`在 Wind 金融终端窗口内弹出的导出对话框中，找到文件保存路径输入框，输入"${CONFIG.wind.exportPath}"`),
    `修改导出路径为"${CONFIG.wind.exportPath}"`,
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.short);
  
  await activateWindWindow();
  await sleep(CONFIG.wait.short);
  
  await withRetry(
    () => agent.aiAct('在 Wind 金融终端窗口内的导出对话框中，点击"确定"按钮开始导出'),
    '点击"确定"开始导出',
    { maxAttempts: CONFIG.retry.maxAttempts, delay: CONFIG.retry.delay }
  );
  await sleep(CONFIG.wait.long);
  performanceMetrics.endStep(step_export);

  // ========== 完成 ==========
  console.log('\n🎉 测试完成！');
  performanceMetrics.printSummary();
  
  console.log('\n📋 操作总结：');
  console.log(`  • 股票代码: ${CONFIG.wind.stockCode} (${CONFIG.wind.stockName})`);
  console.log(`  • 添加指标: 区间日均总市值、市盈率(TTM)`);
  console.log(`  • 导出路径: ${CONFIG.wind.exportPath}`);
}

runTest().catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});