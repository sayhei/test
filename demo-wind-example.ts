/**
 * Midscene.js Wind金融终端 - 灵活使用示例
 * 
 * 这个脚本展示如何灵活使用 Midscene 进行 Wind 终端自动化
 * 
 * 功能：
 * - 启动股票数据浏览器
 * - 查询股票数据
 * - 提取并导出数据
 * 
 * 运行方式：
 *   npx tsx demo-wind-example.ts
 */

import { agentForComputer } from '@midscene/computer';
import 'dotenv/config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 测试配置
const TEST_CONFIG = {
  stockCode: '600006',
  stockName: '东风股份',
  indicators: [
    { name: '市值', category: '内地股票指标' },
    { name: 'PE', category: '内地股票指标' },
  ],
  exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',
};

// 辅助函数：智能等待元素出现
async function waitForElement(
  agent: Awaited<ReturnType<typeof agentForComputer>>,
  description: string,
  timeout: number = 10000
): Promise<void> {
  console.log(`⏳ 等待: ${description}`);
  try {
    await agent.aiWaitFor(description, { timeout });
    console.log(`✅ 检测到: ${description}`);
  } catch (error) {
    console.warn(`⚠️ 未检测到: ${description}，继续执行...`);
  }
}

// 辅助函数：执行操作并记录
async function executeStep(
  agent: Awaited<ReturnType<typeof agentForComputer>>,
  stepName: string,
  action: string
): Promise<void> {
  console.log(`📝 ${stepName}`);
  try {
    await agent.aiAct(action);
    console.log(`✅ ${stepName} - 成功`);
  } catch (error) {
    console.error(`❌ ${stepName} - 失败`);
    throw error;
  }
}

// 主测试流程
async function runWindTest() {
  console.log('🚀 Wind金融终端自动化测试');
  console.log('=' .repeat(50));
  console.log(`📊 测试配置:`);
  console.log(`   股票代码: ${TEST_CONFIG.stockCode}`);
  console.log(`   股票名称: ${TEST_CONFIG.stockName}`);
  console.log(`   指标数量: ${TEST_CONFIG.indicators.length}`);
  console.log(`   导出路径: ${TEST_CONFIG.exportPath}`);
  console.log('');

  // 初始化 Agent
  console.log('📦 初始化 Midscene Agent...');
  const agent = await agentForComputer();
  console.log('✅ Agent 初始化成功！\n');

  try {
    // 阶段 1：启动股票数据浏览器
    console.log('📍 阶段 1：启动股票数据浏览器');
    console.log('-'.repeat(50));
    
    await executeStep(
      agent,
      '搜索股票数据浏览器',
      `在左下角的输入框中输入"股票数据浏览器"`
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '打开股票数据浏览器',
      `在出现的选项列表中点击"股票数据浏览器"`
    );
    await waitForElement(agent, '股票数据浏览器界面加载完成');
    await sleep(2000);

    // 阶段 2：输入股票信息
    console.log('\n📍 阶段 2：输入股票信息');
    console.log('-'.repeat(50));
    
    await executeStep(
      agent,
      `输入股票代码 ${TEST_CONFIG.stockCode}`,
      `在页面左下角的股票代码输入框中输入"${TEST_CONFIG.stockCode}"`
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      `选择股票 ${TEST_CONFIG.stockName}`,
      `在出现的下拉选项中点击"${TEST_CONFIG.stockName}"`
    );
    await waitForElement(agent, '股票信息加载完成');
    await sleep(2000);

    // 阶段 3：添加指标
    console.log('\n📍 阶段 3：添加指标');
    console.log('-'.repeat(50));
    
    for (const indicator of TEST_CONFIG.indicators) {
      await executeStep(
        agent,
        `查找指标 ${indicator.name}`,
        `在左侧栏中间的输入框（placeholder为"按拼音查找指标"）中输入"${indicator.name}"`
      );
      await sleep(500);
      
      await executeStep(
        agent,
        `选择指标 ${indicator.name}`,
        `在出现的选项中点击"${indicator.name}"`
      );
      await sleep(500);
      
      await executeStep(
        agent,
        `选择分类 ${indicator.category}`,
        `在分类选项中点击"${indicator.category}"`
      );
      await sleep(500);
    }
    
    await executeStep(
      agent,
      '确认指标添加',
      '按回车键（Enter）确认输入'
    );
    await waitForElement(agent, '指标添加完成');
    await sleep(2000);

    // 阶段 4：配置指标
    console.log('\n📍 阶段 4：配置指标');
    console.log('-'.repeat(50));
    
    await executeStep(
      agent,
      '右键点击指标',
      '右键点击刚才添加的指标项'
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '选择添加指标',
      '在右键菜单中点击"添加指标"'
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '使用默认参数',
      '检查弹出的输入框，使用默认参数值'
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '确认添加',
      '点击"确定"按钮'
    );
    await waitForElement(agent, '指标配置完成');
    await sleep(2000);

    // 阶段 5：提取数据
    console.log('\n📍 阶段 5：提取数据');
    console.log('-'.repeat(50));
    
    await executeStep(
      agent,
      '点击提取数据',
      '点击页面左上角的"提取数据"按钮'
    );
    
    console.log('⏳ 等待数据加载...');
    await agent.aiWaitFor('数据表格中出现股票数据');
    
    // 验证数据
    console.log('📊 验证提取的数据...');
    const dataSummary = await agent.aiQuery(
      '表格中的数据行数和数据概况',
    );
    console.log(`📈 数据摘要: ${JSON.stringify(dataSummary)}`);
    await sleep(3000);

    // 阶段 6：导出数据
    console.log('\n📍 阶段 6：导出数据');
    console.log('-'.repeat(50));
    
    await executeStep(
      agent,
      '点击导出数据',
      '点击页面右上角的"导出数据"按钮'
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '设置导出路径',
      `在导出数据弹框中，将下载路径修改为"${TEST_CONFIG.exportPath}"`
    );
    await sleep(1000);
    
    await executeStep(
      agent,
      '确认导出',
      '点击"确定"按钮确认导出'
    );
    await sleep(3000);

    // 完成
    console.log('\n' + '='.repeat(50));
    console.log('✅ Wind金融终端自动化测试成功！');
    console.log(`📊 数据已导出到: ${TEST_CONFIG.exportPath}`);
    
    // 获取报告
    const reportFile = agent.reportFile;
    if (reportFile) {
      console.log(`📄 测试报告: ${reportFile}`);
    }
    
    // 生成总结
    console.log('\n📋 测试总结:');
    console.log(`   ✓ 股票查询: ${TEST_CONFIG.stockCode} (${TEST_CONFIG.stockName})`);
    console.log(`   ✓ 添加指标: ${TEST_CONFIG.indicators.map(i => i.name).join(', ')}`);
    console.log(`   ✓ 数据提取: 成功`);
    console.log(`   ✓ 数据导出: 成功`);
    
    await agent.destroy();
    
    console.log('\n🎉 测试流程完成！');
    
  } catch (error) {
    console.error('\n❌ 测试执行失败:');
    console.error(error);
    
    // 获取失败报告
    const reportFile = agent.reportFile;
    if (reportFile) {
      console.log(`\n📄 失败报告: ${reportFile}`);
    }
    
    await agent.destroy();
    process.exit(1);
  }
}

// 运行测试
runWindTest().catch(console.error);
