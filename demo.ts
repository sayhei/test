import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import 'dotenv/config'; // 如存在 .env 文件，则从中加载环境变量

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

Promise.resolve(
  (async () => {
    const browser = await chromium.launch({ headless: false }); // 👀 实时观察运行过程
    const page = await browser.newPage();
    await page.goto('https://www.ebay.com');
    await sleep(3000);

    // 👀 初始化 Midscene agent
    const agent = new PlaywrightAgent(page);

    // 👀 用自然语言执行操作
    await agent.aiAct('在搜索框输入 "Headphones"，然后回车');
    await agent.aiWaitFor('列表中至少出现一个耳机商品');

    // 👀 提取结构化数据
    const items = await agent.aiQuery(
      '{ title: string, price: number }[], 列表中的耳机商品',
    );
    console.log('headphones in stock:', items);

    // 👀 用自然语言做断言
    await agent.aiAssert('页面左侧有一个分类筛选栏');

    await browser.close();
  })(),
);