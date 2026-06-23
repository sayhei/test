/**
 * Midscene.js 生产回放脚本
 * 
 * 使用只读缓存模式快速回放测试
 * 不调用 AI，直接使用开发阶段生成的缓存
 * 
 * 运行方式：
 *   MIDSCENE_CACHE_MODE=read-only npx tsx demo-prod.ts
 * 
 * 前提条件：
 *   必须先运行 demo-dev.ts 生成缓存
 * 
 * 性能提升：
 *   - 纯 AI 模式：10-30秒/操作
 *   - 缓存回放模式：0.1-0.5秒/操作
 */

import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import 'dotenv/config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Promise.resolve(
  (async () => {
    console.log('🚀 启动浏览器（生产模式 - 快速回放）...');
    const browser = await chromium.launch({ headless: true }); // 生产环境使用无头模式
    const page = await browser.newPage();
    
    console.log('📍 访问 eBay...');
    await page.goto('https://www.ebay.com');
    await sleep(2000);

    // 初始化 Agent（使用缓存）
    console.log('📦 使用缓存进行回放...');
    const agent = new PlaywrightAgent(page);

    // ========== 业务逻辑（使用缓存快速回放）==========
    
    // 1. 回放搜索操作（使用缓存）
    console.log('🔍 搜索耳机（从缓存读取）...');
    await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
    await agent.aiWaitFor('列表中至少出现一个耳机商品');
    
    // 2. 回放数据提取（使用缓存）
    console.log('📊 提取商品数据（从缓存读取）...');
    const items = await agent.aiQuery(
      '{ title: string, price: number }[], 列表中的耳机商品',
    );
    console.log('🎯 找到的商品:', items);
    
    // 3. 回放断言（使用缓存）
    console.log('✅ 验证页面元素（从缓存读取）...');
    await agent.aiAssert('页面左侧有一个分类筛选栏');
    
    console.log('✨ 操作完成！');

    await browser.close();
    console.log('🎉 回放成功！');
    console.log('⚡ 使用缓存的回放速度：比纯 AI 快 10-50 倍');
  })(),
);
