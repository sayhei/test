import { sleep } from './sleep';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 3000 } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptStart = Date.now();
    try {
      console.log(`  尝试 ${attempt}/${maxAttempts}...`);
      const result = await operation();
      const attemptDuration = Date.now() - attemptStart;
      console.log(`  ✅ ${operationName} - 成功 (本次尝试: ${(attemptDuration / 1000).toFixed(2)}秒)`);
      return result;
    } catch (error: any) {
      const attemptDuration = Date.now() - attemptStart;
      console.warn(`  ⚠️ ${operationName} - 失败 (${attempt}/${maxAttempts}) (本次尝试: ${(attemptDuration / 1000).toFixed(2)}秒)`);
      console.warn(`     错误信息: ${error.message?.slice(0, 100)}`);
      if (attempt < maxAttempts) {
        console.log(`  ⏳ 等待 ${delay}ms 后重试...`);
        await sleep(delay);
      } else {
        console.error(`  ❌ ${operationName} - 最终失败`);
        throw error;
      }
    }
  }
  
  throw new Error(`${operationName} 重试 ${maxAttempts} 次后仍失败`);
}