import 'dotenv/config';

export interface WindConfig {
  stockCode: string;
  stockName: string;
  indicators: string[];
  exportPath: string;
  executablePath: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
}

export interface WaitConfig {
  short: number;
  medium: number;
  long: number;
  startup: number;
}

export interface PerformanceConfig {
  logEachStep: boolean;
  slowThreshold: number;
}

export interface AppConfig {
  wind: WindConfig;
  retry: RetryConfig;
  wait: WaitConfig;
  performance: PerformanceConfig;
}

export const CONFIG: AppConfig = {
  wind: {
    stockCode: '600006',
    stockName: '东风股份',
    indicators: ['市值', 'PE'],
    exportPath: 'C:\\Users\\gyy\\Desktop\\新建文件夹',
    executablePath: process.env.WIND_EXECUTABLE_PATH || '',
  },
  retry: {
    maxAttempts: 3,
    delay: 3000,
  },
  wait: {
    short: 1500,
    medium: 3000,
    long: 5000,
    startup: 15000,
  },
  performance: {
    logEachStep: true,
    slowThreshold: 10000,
  },
};