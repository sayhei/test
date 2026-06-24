import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import { splitReportFile, reportFileToMarkdown } from '@midscene/core';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { sleep } from '../../lib/sleep';

async function runTest() {
  console.log('🎬 Midscene 报告文件解析脚本');
  console.log('='.repeat(50));

  console.log('\n🎬 执行 AI 操作并生成报告...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
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
    }
  }

  console.log('🤖 初始化 Midscene Agent...');
  const agent = new PlaywrightAgent(page);

  try {
    console.log('\n🔍 搜索耳机...');
    await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
    await agent.aiWaitFor('列表中至少出现一个耳机商品');

    console.log('\n📊 提取商品数据...');
    const items = await agent.aiQuery(
      '{ title: string, price: number }[], 列表中的耳机商品',
    );
    console.log('🎯 找到的商品:', items);

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await browser.close();
  }

  console.log('\n📁 查找报告文件...');
  const reportDir = path.join(process.cwd(), 'midscene_run', 'report');
  
  try {
    const files = fs.readdirSync(reportDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    if (htmlFiles.length === 0) {
      console.log('⚠️ 未找到报告文件');
      return;
    }
    
    const latestFile = htmlFiles.sort().reverse()[0];
    const reportPath = path.join(reportDir, latestFile);
    console.log(`📄 找到报告文件: ${latestFile}`);

    console.log('\n🔧 解析报告文件...');
    const report = await splitReportFile(reportPath);
    
    console.log('\n📝 转换为 Markdown...');
    const markdown = reportFileToMarkdown(report);
    
    const outputPath = path.join(reportDir, `${latestFile}.md`);
    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ Markdown 报告已保存: ${outputPath}`);

    console.log('\n📋 报告摘要:');
    console.log('-------------------');
    const lines = markdown.split('\n').slice(0, 20);
    console.log(lines.join('\n'));
    console.log('...');

  } catch (error) {
    console.error('❌ 解析报告失败:', error);
  }
}

runTest().catch((error) => {
  console.error('\n❌ 脚本执行失败:', error);
  process.exit(1);
});