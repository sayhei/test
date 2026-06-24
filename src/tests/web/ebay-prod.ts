import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import 'dotenv/config';
import { sleep } from '../../lib/sleep';

async function runTest() {
  console.log('🚀 Midscene Web 测试 - eBay（生产模式，只读缓存）');
  console.log('='.repeat(50));

  console.log('\n🚀 启动浏览器（无头模式）...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📍 访问 eBay...');
  await page.goto('https://www.ebay.com');
  await sleep(2000);

  console.log('📦 使用缓存进行回放...');
  const agent = new PlaywrightAgent(page);

  console.log('\n🔍 搜索耳机（从缓存读取）...');
  await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
  await agent.aiWaitFor('列表中至少出现一个耳机商品');
  
  console.log('\n📊 提取商品数据（从缓存读取）...');
  const items = await agent.aiQuery(
    '{ title: string, price: number }[], 列表中的耳机商品',
  );
  console.log('🎯 找到的商品:', items);

  console.log('\n🎉 测试完成！');
  await browser.close();
}

runTest().catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});