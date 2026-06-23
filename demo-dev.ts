/**
 * Midscene.js 开发调试脚本
 * 
 * 使用 AI + 缓存机制进行开发调试
 * 首次运行会调用 AI 生成缓存，后续运行直接从缓存读取
 * 
 * 运行方式：
 *   npx tsx demo-dev.ts
 * 
 * 缓存目录：.midscene_cache/
 * 缓存文件：自动生成，包含 AI 决策结果
 */

import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import 'dotenv/config'; // 加载 .env 环境变量

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Promise.resolve(
  (async () => {
    console.log('🚀 启动浏览器...');
    const browser = await chromium.launch({ headless: false }); // 开发时设为 true 可加速
    const page = await browser.newPage();
    
    console.log('📍 访问 eBay...');
    await page.goto('https://www.ebay.com');
    await sleep(3000); // 等待页面加载

    // 初始化 Midscene Agent（自动使用缓存）
    console.log('🤖 初始化 Midscene Agent（使用缓存）...');
    const agent = new PlaywrightAgent(page);

    // ========== 业务逻辑 ==========
    
    // 1. AI 搜索操作（会生成缓存）
    console.log('🔍 搜索耳机...');
    await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
    await agent.aiWaitFor('列表中至少出现一个耳机商品');
    
    // 2. 提取数据（会生成缓存）
    console.log('📊 提取商品数据...');
    const items = await agent.aiQuery(
      '{ title: string, price: number }[], 列表中的耳机商品',
    );
    console.log('🎯 找到的商品:', items);
    
    // 3. AI 断言（会生成缓存）
    console.log('✅ 验证页面元素...');
    await agent.aiAssert('页面左侧有一个分类筛选栏');
    
    console.log('✨ 操作完成！');

    await browser.close();
    console.log('🎉 脚本执行成功！');
    console.log('💡 提示：再次运行此脚本时，将使用缓存加速执行');
  })(),
);
