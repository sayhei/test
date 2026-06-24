interface PerformanceStep {
  name: string;
  duration: number;
  timestamp: Date;
}

interface StepHandle {
  name: string;
  startTime: number;
}

export class PerformanceMetrics {
  private steps: PerformanceStep[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  startStep(name: string): StepHandle {
    return {
      name,
      startTime: Date.now(),
    };
  }

  endStep(step: StepHandle): number {
    const duration = Date.now() - step.startTime;
    this.steps.push({
      name: step.name,
      duration,
      timestamp: new Date(),
    });
    console.log(`⏱️  ${step.name} 耗时: ${(duration / 1000).toFixed(2)}秒`);
    return duration;
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 性能统计');
    console.log('='.repeat(60));
    
    const totalDuration = Date.now() - this.startTime.getTime();
    console.log(`总耗时: ${(totalDuration / 1000).toFixed(2)}秒`);
    console.log('');
    
    console.log('各步骤耗时:');
    this.steps.forEach((step, index) => {
      const percentage = ((step.duration / totalDuration) * 100).toFixed(1);
      console.log(`  ${index + 1}. ${step.name}: ${(step.duration / 1000).toFixed(2)}秒 (${percentage}%)`);
    });
    
    console.log('');
    console.log('最慢的 5 个步骤:');
    const sortedSteps = [...this.steps].sort((a, b) => b.duration - a.duration);
    sortedSteps.slice(0, 5).forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name}: ${(step.duration / 1000).toFixed(2)}秒`);
    });
    
    console.log('');
    console.log('💡 性能优化建议:');
    
    const avgStepDuration = this.steps.reduce((sum, step) => sum + step.duration, 0) / this.steps.length;
    const slowSteps = this.steps.filter(step => step.duration > avgStepDuration * 2);
    
    if (slowSteps.length > 0) {
      console.log('  - 以下步骤耗时较长，建议优化:');
      slowSteps.forEach(step => {
        console.log(`    • ${step.name}: ${(step.duration / 1000).toFixed(2)}秒`);
      });
    }
    
    if (process.env.MIDSCENE_CACHE !== 'true') {
      console.log('  - 启用缓存可以显著提升速度 (MIDSCENE_CACHE=true)');
    }
    
    if (process.env.MIDSCENE_CACHE_MODE !== 'read-write') {
      console.log('  - 设置缓存模式为 read-write 可以复用之前的决策');
    }
    
    console.log('='.repeat(60));
  }
}