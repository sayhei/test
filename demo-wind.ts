/**
 * Midscene.js Windows 桌面应用测试脚本
 * 
 * 测试目标：Wind金融终端 - 股票数据浏览器
 * 
 * 功能流程：
 * 1. 在左下角输入框输入"股票数据浏览器"
 * 2. 点击对应选项，打开股票数据浏览器页面
 * 3. 在左下角输入代码输入框中输入"600006"
 * 4. 选择"东风股份"
 * 5. 在左侧栏的中间输入框（placeholder为"按拼音查找指标"）中输入"市值"
 * 6. 选择"PE"
 * 7. 选择"内地股票指标"
 * 8. 回车确认
 * 9. 指标展开后，右键点击对应指标
 * 10. 点击"添加指标"
 * 11. 在输入框中输入值（使用默认值）
 * 12. 点击"确定"
 * 13. 点击"提取数据"按钮
 * 14. 表格获取数据后，点击"导出数据"按钮
 * 15. 修改下载路径为 "C:\Users\gyy\Desktop\新建文件夹"
 * 16. 点击确定
 * 
 * 运行方式：
 *   npx tsx demo-wind.ts
 * 
 * 前提条件：
 *   1. 安装 @midscene/computer：npm install @midscene/computer
 *   2. 确保 Wind金融终端已安装并可启动
 *   3. 配置模型环境变量（.env 文件）
 * 
 * 注意事项：
 *   - Windows 桌面应用测试不需要浏览器
 *   - 可以使用缓存机制加速后续运行
 *   - 支持缓存配置：MIDSCENE_CACHE=true
 */

import { agentForComputer } from '@midscene/computer';
import 'dotenv/config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Promise.resolve(
  (async () => {
    console.log('🚀 初始化 Midscene Windows 桌面应用 Agent...');
    
    // 创建 Windows 桌面应用 Agent
    const agent = await agentForComputer();
    
    console.log('✅ Agent 初始化成功！');
    console.log('📍 等待 Wind金融终端启动...\n');
    
    // ========== 步骤 1：在左下角输入框输入"股票数据浏览器" ==========
    console.log('📝 步骤 1/16：在左下角输入框输入"股票数据浏览器"...');
    await agent.aiAct('在左下角的输入框中输入"股票数据浏览器"');
    await sleep(1000);
    
    // ========== 步骤 2：点击对应选项 ==========
    console.log('🖱️ 步骤 2/16：点击"股票数据浏览器"选项...');
    await agent.aiAct('在出现的选项列表中点击"股票数据浏览器"');
    await sleep(2000);
    
    // ========== 步骤 3：输入股票代码 600006 ==========
    console.log('📝 步骤 3/16：在股票代码输入框中输入"600006"...');
    await agent.aiAct('在页面左下角的股票代码输入框中输入"600006"');
    await sleep(1000);
    
    // ========== 步骤 4：选择东风股份 ==========
    console.log('🖱️ 步骤 4/16：选择"东风股份"...');
    await agent.aiAct('在出现的下拉选项中点击"东风股份"');
    await sleep(1000);
    
    // ========== 步骤 5：在指标查找框中输入"市值" ==========
    console.log('📝 步骤 5/16：在指标查找框中输入"市值"...');
    await agent.aiAct('在左侧栏中间的输入框（placeholder为"按拼音查找指标"）中输入"市值"');
    await sleep(1000);
    
    // ========== 步骤 6：选择 PE ==========
    console.log('🖱️ 步骤 6/16：选择"PE"选项...');
    await agent.aiAct('在出现的选项中点击"PE"（市盈率）');
    await sleep(1000);
    
    // ========== 步骤 7：选择内地股票指标 ==========
    console.log('🖱️ 步骤 7/16：选择"内地股票指标"...');
    await agent.aiAct('在分类选项中点击"内地股票指标"');
    await sleep(1000);
    
    // ========== 步骤 8：回车确认 ==========
    console.log('⌨️ 步骤 8/16：按回车键确认...');
    await agent.aiAct('按回车键（Enter）确认输入');
    await sleep(2000);
    
    // ========== 步骤 9：右键点击指标 ==========
    console.log('🖱️ 步骤 9/16：右键点击已展开的指标...');
    await agent.aiAct('右键点击刚才添加的指标项');
    await sleep(1000);
    
    // ========== 步骤 10：点击"添加指标" ==========
    console.log('🖱️ 步骤 10/16：点击"添加指标"选项...');
    await agent.aiAct('在右键菜单中点击"添加指标"');
    await sleep(1000);
    
    // ========== 步骤 11：确认输入框值（使用默认值）==========
    console.log('📝 步骤 11/16：确认输入框使用默认值...');
    await agent.aiAct('检查弹出的输入框，使用默认参数值');
    await sleep(1000);
    
    // ========== 步骤 12：点击确定 ==========
    console.log('🖱️ 步骤 12/16：点击"确定"按钮...');
    await agent.aiAct('点击"确定"按钮');
    await sleep(2000);
    
    // ========== 步骤 13：点击"提取数据"按钮 ==========
    console.log('🖱️ 步骤 13/16：点击"提取数据"按钮...');
    await agent.aiAct('点击页面左上角的"提取数据"按钮');
    
    // 等待数据加载
    console.log('⏳ 等待数据提取完成...');
    await agent.aiWaitFor('数据表格中出现股票数据');
    await sleep(2000);
    
    // ========== 步骤 14：点击"导出数据"按钮 ==========
    console.log('🖱️ 步骤 14/16：点击"导出数据"按钮...');
    await agent.aiAct('点击页面右上角的"导出数据"按钮');
    await sleep(1000);
    
    // ========== 步骤 15：修改下载路径 ==========
    console.log('📝 步骤 15/16：修改下载路径为桌面新建文件夹...');
    await agent.aiAct('在导出数据弹框中，将下载路径修改为"C:\\Users\\gyy\\Desktop\\新建文件夹"');
    await sleep(1000);
    
    // ========== 步骤 16：点击确定 ==========
    console.log('🖱️ 步骤 16/16：点击"确定"按钮开始导出...');
    await agent.aiAct('点击"确定"按钮确认导出');
    await sleep(3000);
    
    console.log('\n✅ 所有步骤执行完成！');
    console.log('📊 数据已导出到：C:\\Users\\gyy\\Desktop\\新建文件夹');
    
    // 获取报告文件路径
    const reportFile = agent.reportFile;
    if (reportFile) {
      console.log(`📄 测试报告已生成: ${reportFile}`);
    }
    
    // 销毁 Agent
    await agent.destroy();
    
    console.log('\n🎉 Wind金融终端测试完成！');
  })(),
);
