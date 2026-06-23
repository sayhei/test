/**
 * Midscene.js 报告文件解析脚本
 * 
 * Midscene 没有提供 SDK 级别的录制回放 API。
 * 录制功能是通过 Chrome 扩展实现的。
 * 
 * 这个脚本演示如何使用报告文件来分析和重放操作。
 * 
 * 运行方式：
 *   npx tsx demo-recorder.ts
 * 
 * 功能：
 *   1. 执行 AI 操作并生成报告文件
 *   2. 解析报告文件提取操作步骤
 *   3. 将报告转换为 Markdown 格式
 * 
 * 报告文件位置：midscene_run/report/
 */

import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import { splitReportFile, reportFileToMarkdown } from '@midscene/core';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Promise.resolve(
  (async () => {
    console.log('🎬 执行 AI 操作并生成报告...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // 添加错误处理和重试
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        await page.goto('https://www.ebay.com', { timeout: 30000 });
        await sleep(3000);
        break;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ 网络连接失败，重试 ${retryCount}/${maxRetries}...`);
        if (retryCount >= maxRetries) {
          throw error;
        }
        await sleep(2000);
      }
    }

    // 创建 Agent（会自动生成报告）
    const agent = new PlaywrightAgent(page);

    // 执行操作
    console.log('🔍 搜索耳机...');
    await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
    await agent.aiWaitFor('列表中至少出现一个耳机商品');
    
    console.log('📊 提取数据...');
    const items = await agent.aiQuery(
      '{ title: string, price: number }[], 列表中的耳机商品',
    );
    console.log('🎯 找到:', items);
    
    console.log('✅ 断言验证...');
    await agent.aiAssert('页面左侧有一个分类筛选栏');

    // 获取报告文件路径
    const reportPath = agent.reportFile;
    console.log(`📄 报告已生成: ${reportPath}`);

    await browser.close();
    
    // 解析报告文件
    if (reportPath && fs.existsSync(reportPath)) {
      console.log('\n📂 解析报告文件...');
      
      // 创建输出目录
      const outputDir = path.join(__dirname, 'report-output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 方法1：将报告转换为 Markdown
      console.log('📝 转换为 Markdown...');
      const markdownResult = await reportFileToMarkdown({
        htmlPath: reportPath,
        outputDir: outputDir,
      });
      
      console.log(`✅ Markdown 文件已生成: ${markdownResult.markdownFiles.join(', ')}`);

      // 方法2：分割报告文件（提取 JSON 和截图）
      console.log('📦 提取 JSON 数据和截图...');
      const splitResult = splitReportFile({
        htmlPath: reportPath,
        outputDir: outputDir,
      });
      
      console.log(`✅ JSON 文件: ${splitResult.executionJsonFiles.join(', ')}`);
      console.log(`✅ 截图文件: ${splitResult.screenshotFiles.length} 个`);
      
      console.log(`\n💡 提示：查看 ${outputDir} 目录获取详细报告数据`);
      console.log('💡 提示：这些数据可用于自定义回放逻辑或生成测试报告');
    } else {
      console.warn('⚠️ 报告文件未找到，请检查配置');
    }

    console.log('\n🎉 脚本执行完成！');
  })(),
);
