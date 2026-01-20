
import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  totalScore: number;
}

interface StrategyResult {
  name: string;
  score: number; // 加权得分
  weight: number; // 最终影响权重
}

/**
 * 🌌 Nebula Self-Correcting Engine v14.0 (Singularity)
 * 
 * 核心特性：
 * 1. 15大确定性算法矩阵：覆盖规律、统计学、几何学、计算机位运算、金融动量指标。
 * 2. 时间衰减回测 (Time-Decay Backtesting)：最近的回测结果权重更高，能更快适应变盘。
 * 3. 复杂算法引入：k-NN (模式匹配), Bitwise (位运算), Momentum (动量指标)。
 */
export class PredictionEngine {

  static ZODIACS_MAP: Record<string, number[]> = {
    '蛇': [1, 13, 25, 37, 49], '马': [12, 24, 36, 48], '羊': [11, 23, 35, 47],
    '猴': [10, 22, 34, 46], '鸡': [9, 21, 33, 45], '狗': [8, 20, 32, 44],
    '猪': [7, 19, 31, 43], '鼠': [6, 18, 30, 42], '牛': [5, 17, 29, 41],
    '虎': [4, 16, 28, 40], '兔': [3, 15, 27, 39], '龙': [2, 14, 26, 38],
  };

  static WAVES_MAP = {
    'red': [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
    'blue': [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
    'green': [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
  };

  static ELEMENTS_MAP: Record<string, number[]> = {
    '金': [1, 2, 15, 16, 23, 24, 31, 32, 45, 46],
    '木': [5, 6, 13, 14, 21, 22, 35, 36, 43, 44],
    '水': [9, 10, 17, 18, 25, 26, 33, 34, 41, 42, 49],
    '火': [3, 4, 11, 12, 19, 20, 27, 28, 47, 48],
    '土': [7, 8, 29, 30, 37, 38, 39, 40]
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WAVE: Record<number, string> = {};
  static NUM_TO_ELEMENT: Record<number, string> = {};

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => this.NUM_TO_ZODIAC[n] = z);
    }
    for (const [w, nums] of Object.entries(this.WAVES_MAP)) {
      // @ts-ignore
      nums.forEach(n => this.NUM_TO_WAVE[n] = w);
    }
    for (const [e, nums] of Object.entries(this.ELEMENTS_MAP)) {
      nums.forEach(n => this.NUM_TO_ELEMENT[n] = e);
    }
  }

  /**
   * 生成预测主入口
   */
  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    this.initializeMaps();
    
    // 数据量检查
    if (!history || history.length < 80) return this.generateFallback(history);

    // 1. 运行深度回测系统 (Backtesting Kernel)
    // ------------------------------------------------
    const backtestWindow = 30;
    const strategies = this.runBacktest(history, backtestWindow);
    
    // 获取当前表现最好的策略名称
    const bestStrategy = strategies.sort((a, b) => b.weight - a.weight)[0];
    // 归一化显示准确率 (近似值)
    const displayScore = Math.min(bestStrategy.score * 2.5, 100).toFixed(0); 
    const analysisText = `${bestStrategy.name} (加权强度: ${displayScore})`;

    // 2. 综合打分 (Composite Scoring)
    // ------------------------------------------------
    const stats = this.calculateCompositeScores(history, strategies);

    // 3. 选码逻辑
    // ------------------------------------------------
    const sortedStats = Object.values(stats).sort((a, b) => b.totalScore - a.totalScore);
    
    // 选 18 码
    const final18 = sortedStats.slice(0, 18);
    const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 选 6 肖
    const zMap: Record<string, number> = {};
    final18.forEach(s => zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore);
    const recZodiacs = Object.keys(zMap).sort((a, b) => zMap[b] - zMap[a]).slice(0, 6);

    // 选波色
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    final18.forEach(s => wMap[s.wave] = (wMap[s.wave] || 0) + s.totalScore);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 选头数
    const hMap: Record<number, number> = {};
    final18.forEach(s => {
        const h = Math.floor(s.num / 10);
        hMap[h] = (hMap[h] || 0) + 1;
    });
    const recHeads = Object.keys(hMap).sort((a, b) => hMap[parseInt(b)] - hMap[parseInt(a)]).slice(0, 3).map(String);

    // 选尾数 (使用独立的增强版尾数趋势算法)
    const tailScores = this.strategyTailTrend(history);
    const recTails = Object.keys(tailScores).map(Number).sort((a, b) => tailScores[b] - tailScores[a]).slice(0, 5).map(String);

    return {
      zodiacs: recZodiacs,
      numbers: resultNumbers,
      wave: { main: recWaves[0], defense: recWaves[1] },
      heads: recHeads,
      tails: recTails,
      strategy_analysis: analysisText
    };
  }

  /**
   * 自动回测内核 v2.0
   * 引入时间衰减：最近的验证结果权重更高
   */
  static runBacktest(history: DbRecord[], windowSize: number): StrategyResult[] {
    const strategyDefinitions = [
      // 基础规律类
      { name: '偏移轨迹 (Offset)', func: this.strategyOffset.bind(this) },
      { name: '遗漏回补 (Omission)', func: this.strategyOmission.bind(this) },
      { name: '生肖转移 (Link)', func: this.strategyZodiacLink.bind(this) },
      { name: '历史镜像 (Mirror)', func: this.strategyHistoryMirror.bind(this) },
      { name: '时空模数 (Modulo)', func: this.strategyModulo.bind(this) },
      // 数学/几何类
      { name: '黄金分割 (Golden)', func: this.strategyGoldenSection.bind(this) },
      { name: '合数走势 (DigitSum)', func: this.strategyDigitSum.bind(this) },
      // 规则映射类
      { name: '五行相生 (Element)', func: this.strategyFiveElements.bind(this) },
      { name: '三合六合 (Harmony)', func: this.strategyZodiacHarmony.bind(this) },
      // 统计学类
      { name: '马尔可夫链 (Markov)', func: this.strategyMarkovChain.bind(this) },
      { name: '泊松分布 (Poisson)', func: this.strategyPoisson.bind(this) },
      { name: '回归趋势 (Regression)', func: this.strategyRegression.bind(this) },
      // 高阶算法类 (New)
      { name: 'k-近邻 (k-NN)', func: this.strategyKNN.bind(this) },
      { name: '位运算漩涡 (Bitwise)', func: this.strategyBitwiseVortex.bind(this) },
      { name: '动量震荡 (Momentum)', func: this.strategyMomentum.bind(this) }
    ];

    const results = strategyDefinitions.map(s => ({ name: s.name, score: 0 }));

    // 回测循环
    for (let i = 0; i < windowSize; i++) {
      const targetRecord = history[i];
      const trainingData = history.slice(i + 1);
      
      if (trainingData.length < 50) break; 

      const targetNum = this.parseNumbers(targetRecord.open_code).pop();
      if (!targetNum) continue;

      // 时间衰减因子：i=0 (最新) 权重最大，i=29 (最旧) 权重最小
      // 公式：Weight = 1 + (1 - i / windowSize)
      // 例如：最新一期权重 2.0，最老一期权重 1.0
      const timeWeight = 1 + (1 - i / windowSize);

      strategyDefinitions.forEach((strat, idx) => {
        const scores = strat.func(trainingData);
        const topPicked = Object.keys(scores)
          .map(Number)
          .sort((a, b) => scores[b] - scores[a])
          .slice(0, 12); // 取前12码验证
        
        if (topPicked.includes(targetNum)) {
          results[idx].score += timeWeight; // 命中加分
        }
      });
    }

    // 计算最终权重
    return results.map(r => {
      // 归一化处理，防止权重过大
      const normalizedScore = r.score / windowSize; 
      return {
        name: r.name,
        score: normalizedScore,
        weight: 1.0 + (normalizedScore * 8.0) // 动态调整放大倍数
      };
    });
  }

  static calculateCompositeScores(history: DbRecord[], strategies: StrategyResult[]): Record<number, NumberStat> {
    const stats: Record<number, NumberStat> = {};
    for (let i = 1; i <= 49; i++) {
      stats[i] = {
        num: i,
        zodiac: this.NUM_TO_ZODIAC[i],
        wave: this.NUM_TO_WAVE[i],
        totalScore: 0
      };
    }

    const funcMap: Record<string, Function> = {
      '偏移轨迹 (Offset)': this.strategyOffset.bind(this),
      '遗漏回补 (Omission)': this.strategyOmission.bind(this),
      '生肖转移 (Link)': this.strategyZodiacLink.bind(this),
      '历史镜像 (Mirror)': this.strategyHistoryMirror.bind(this),
      '时空模数 (Modulo)': this.strategyModulo.bind(this),
      '黄金分割 (Golden)': this.strategyGoldenSection.bind(this),
      '五行相生 (Element)': this.strategyFiveElements.bind(this),
      '三合六合 (Harmony)': this.strategyZodiacHarmony.bind(this),
      '合数走势 (DigitSum)': this.strategyDigitSum.bind(this),
      '马尔可夫链 (Markov)': this.strategyMarkovChain.bind(this),
      '泊松分布 (Poisson)': this.strategyPoisson.bind(this),
      '回归趋势 (Regression)': this.strategyRegression.bind(this),
      'k-近邻 (k-NN)': this.strategyKNN.bind(this),
      '位运算漩涡 (Bitwise)': this.strategyBitwiseVortex.bind(this),
      '动量震荡 (Momentum)': this.strategyMomentum.bind(this)
    };

    strategies.forEach(strat => {
      const logicFunc = funcMap[strat.name];
      if (logicFunc) {
        const scores = logicFunc(history);
        for (let n = 1; n <= 49; n++) {
          if (scores[n]) {
            stats[n].totalScore += scores[n] * strat.weight;
          }
        }
      }
    });
    
    // 确定性微扰动
    for (let n = 1; n <= 49; n++) stats[n].totalScore += (n * 0.0001); 

    return stats;
  }

  // ==========================================
  // 高阶确定性算法库 (Advanced Deterministic)
  // ==========================================

  // 13. k-近邻算法 (k-Nearest Neighbors) [New]
  // 将最近 5 期的特码视为一个向量，在历史数据中寻找欧几里得距离最近的 K 个向量
  static strategyKNN(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const k = 5; // 寻找前5个相似历史
      const vectorSize = 5; // 向量维度：最近5期

      if (history.length < vectorSize * 2) return scores;

      const currentVector = [];
      for(let i=0; i<vectorSize; i++) {
         currentVector.push(this.parseNumbers(history[i].open_code).pop() || 0);
      }

      const distances: { dist: number, nextNum: number }[] = [];

      // 遍历历史 (跳过最近 vectorSize 期)
      for(let i = vectorSize; i < Math.min(history.length - vectorSize - 1, 200); i++) {
          let dist = 0;
          let valid = true;
          for(let j=0; j<vectorSize; j++) {
             const histNum = this.parseNumbers(history[i+j].open_code).pop() || 0;
             if (histNum === 0) valid = false;
             dist += Math.pow(currentVector[j] - histNum, 2);
          }
          if (valid) {
             const nextNum = this.parseNumbers(history[i-1].open_code).pop() || 0; // 向量结束后的下一期
             distances.push({ dist: Math.sqrt(dist), nextNum });
          }
      }

      // 排序取前 k 个相似
      distances.sort((a,b) => a.dist - b.dist);
      const topK = distances.slice(0, k);

      topK.forEach(item => {
          if(item.nextNum > 0 && item.nextNum <= 49) {
              // 距离越小，相似度越高，得分越高
              scores[item.nextNum] = (scores[item.nextNum] || 0) + (100 / (item.dist + 1));
          }
      });

      return scores;
  }

  // 14. 位运算漩涡 (Bitwise Vortex) [New]
  // 利用二进制位运算寻找数字间的逻辑关系 (XOR)
  static strategyBitwiseVortex(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const n1 = this.parseNumbers(history[0].open_code).pop() || 0;
      const n2 = this.parseNumbers(history[1].open_code).pop() || 0;
      const n3 = this.parseNumbers(history[2].open_code).pop() || 0;

      // 逻辑1: 异或趋势 (XOR Trend)
      // 如果 n1 ^ n2 = x, 那么下期可能是 n1 ^ x
      const xorDiff = n1 ^ n2;
      let nextXor = (n1 ^ xorDiff) % 49 || 49;
      scores[nextXor] = 5;

      // 逻辑2: 循环位移模拟 (Circular Shift Simulation)
      // 简单的位操作模拟混沌
      let chaos = (n1 & n2) | (n2 & n3); 
      chaos = chaos % 49 || 49;
      scores[chaos] = (scores[chaos] || 0) + 5;

      // 逻辑3: 高位与低位平衡
      // 检查 n1 二进制中 1 的个数
      const countBits = (n: number) => n.toString(2).split('1').length - 1;
      const bits = countBits(n1);
      // 推荐同样 bits 数量的号码
      for(let i=1; i<=49; i++) {
          if (countBits(i) === bits) {
              scores[i] = (scores[i] || 0) + 2;
          }
      }
      return scores;
  }

  // 15. 动量震荡指标 (Momentum Oscillator) [New]
  // 类似于 RSI，计算号码近期是“超买”还是“超卖”
  // 如果一个号码最近出现频率远高于平均值，可能会冷却 (Mean Reversion)
  // 如果一个号码长期未出但近期开始活跃，可能会爆发 (Momentum)
  static strategyMomentum(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const shortTerm = 10;
      const longTerm = 50;

      const getFreq = (period: number) => {
          const f: Record<number, number> = {};
          for(let i=0; i<Math.min(history.length, period); i++) {
              const nums = this.parseNumbers(history[i].open_code);
              nums.forEach(n => f[n] = (f[n]||0)+1);
          }
          return f;
      };

      const shortFreq = getFreq(shortTerm);
      const longFreq = getFreq(longTerm);

      for(let n=1; n<=49; n++) {
          const sf = (shortFreq[n] || 0) / shortTerm;
          const lf = (longFreq[n] || 0) / longTerm;
          
          // 动量公式: 短期频率 - 长期频率
          // 正值表示正在变热 (追热)
          const momentum = sf - lf;
          
          if (momentum > 0.05) { // 显著变热
              scores[n] = momentum * 100;
          }
          
          // 如果短期极热 (例如出现3次以上)，可能是强弩之末，稍微减分 (通过不加分实现)
          if ((shortFreq[n] || 0) >= 3) {
              scores[n] = 0; 
          }
      }
      return scores;
  }

  // --- 原有算法保留 (1-12) ---

  static strategyOffset(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
    const offsetCounts: Record<number, number> = {};
    for (let i = 0; i < Math.min(history.length - 1, 50); i++) {
      const curr = this.parseNumbers(history[i].open_code).pop();
      const prev = this.parseNumbers(history[i + 1].open_code).pop();
      if (curr && prev) {
        const diff = (curr - prev + 49) % 49;
        offsetCounts[diff] = (offsetCounts[diff] || 0) + 1;
      }
    }
    Object.entries(offsetCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([diffStr, count]) => {
        const nextNum = (lastNum + parseInt(diffStr) - 1) % 49 + 1;
        scores[nextNum] = count * 3;
    });
    return scores;
  }

  static strategyOmission(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const omission: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) omission[i] = 0;
    for (let n = 1; n <= 49; n++) {
      for (const rec of history) {
        const nums = this.parseNumbers(rec.open_code);
        if (nums.includes(n)) break; 
        omission[n]++;
      }
    }
    for (let n = 1; n <= 49; n++) {
      const om = omission[n];
      if (om > 35) scores[n] = 10;
      else if (om <= 3) scores[n] = 8;
      else if (Math.abs(om - 9) <= 1) scores[n] = 6;
      else if (Math.abs(om - 19) <= 1) scores[n] = 6;
    }
    return scores;
  }

  static strategyZodiacLink(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
    const lastZodiac = this.NUM_TO_ZODIAC[lastNum];
    const nextZodiacFreq: Record<string, number> = {};
    for (let i = 1; i < Math.min(history.length, 80); i++) {
      const prevNum = this.parseNumbers(history[i].open_code).pop() || 1;
      const prevZodiac = this.NUM_TO_ZODIAC[prevNum];
      if (prevZodiac === lastZodiac) {
        const targetNum = this.parseNumbers(history[i - 1].open_code).pop() || 1;
        const targetZodiac = this.NUM_TO_ZODIAC[targetNum];
        nextZodiacFreq[targetZodiac] = (nextZodiacFreq[targetZodiac] || 0) + 1;
      }
    }
    for (let n = 1; n <= 49; n++) {
      const z = this.NUM_TO_ZODIAC[n];
      if (nextZodiacFreq[z]) scores[n] = nextZodiacFreq[z] * 2;
    }
    return scores;
  }

  static strategyHistoryMirror(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
    const lastWave = this.NUM_TO_WAVE[lastNum];
    const nextNumCounts: Record<number, number> = {};
    for (let i = 1; i < Math.min(history.length, 60); i++) {
      const prevNum = this.parseNumbers(history[i].open_code).pop() || 1;
      const prevWave = this.NUM_TO_WAVE[prevNum];
      if (prevWave === lastWave) {
        const nextNum = this.parseNumbers(history[i - 1].open_code).pop();
        if (nextNum) nextNumCounts[nextNum] = (nextNumCounts[nextNum] || 0) + 1;
      }
    }
    for (let n = 1; n <= 49; n++) {
      if (nextNumCounts[n]) scores[n] = nextNumCounts[n] * 4;
    }
    return scores;
  }

  static strategyModulo(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
    const mod3 = lastNum % 3;
    const mod3NextFreq: Record<number, number> = { 0:0, 1:0, 2:0 };
    for (let i = 0; i < Math.min(history.length, 50); i++) {
      const curr = this.parseNumbers(history[i].open_code).pop();
      const prev = this.parseNumbers(history[i+1].open_code).pop();
      if (curr && prev && prev % 3 === mod3) {
        mod3NextFreq[curr % 3]++;
      }
    }
    const bestMod = Object.keys(mod3NextFreq).sort((a,b) => mod3NextFreq[Number(b)] - mod3NextFreq[Number(a)])[0];
    for (let n = 1; n <= 49; n++) {
      if (n % 3 === Number(bestMod)) scores[n] = 5;
    }
    return scores;
  }

  static strategyGoldenSection(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastNums[lastNums.length-1] || 25;
    const lastSum = lastNums.reduce((a,b)=>a+b, 0);
    const gold1 = Math.round(lastSum * 0.618) % 49 || 49;
    scores[gold1] = (scores[gold1] || 0) + 8;
    const gold2 = Math.round(lastSpecial * 1.618) % 49 || 49;
    scores[gold2] = (scores[gold2] || 0) + 8;
    const gold3 = Math.round(lastSpecial * 0.618) || 1;
    scores[gold3] = (scores[gold3] || 0) + 8;
    return scores;
  }

  static strategyFiveElements(history: DbRecord[]): Record<number, number> {
    const generationMap: Record<string, string> = {'木':'火', '火':'土', '土':'金', '金':'水', '水':'木'};
    const scores: Record<number, number> = {};
    const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
    const lastElement = this.NUM_TO_ELEMENT[lastNum];
    if (lastElement && generationMap[lastElement]) {
        const targetElement = generationMap[lastElement];
        const targetNums = this.ELEMENTS_MAP[targetElement];
        targetNums.forEach(n => scores[n] = 8);
    }
    return scores;
  }

  static strategyZodiacHarmony(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
      const lastZodiac = this.NUM_TO_ZODIAC[lastNum];
      const triads: Record<string, string[]> = {
          '鼠':['龙','猴'], '龙':['鼠','猴'], '猴':['鼠','龙'],
          '牛':['蛇','鸡'], '蛇':['牛','鸡'], '鸡':['牛','蛇'],
          '虎':['马','狗'], '马':['虎','狗'], '狗':['虎','马'],
          '兔':['羊','猪'], '羊':['兔','猪'], '猪':['兔','羊']
      };
      const six: Record<string, string> = {
          '鼠':'牛', '牛':'鼠', '虎':'猪', '猪':'虎',
          '兔':'狗', '狗':'兔', '龙':'鸡', '鸡':'龙',
          '蛇':'猴', '猴':'蛇', '马':'羊', '羊':'马'
      };
      const targets = new Set<string>();
      if(triads[lastZodiac]) triads[lastZodiac].forEach(z => targets.add(z));
      if(six[lastZodiac]) targets.add(six[lastZodiac]);
      targets.forEach(z => {
          this.ZODIACS_MAP[z].forEach(n => scores[n] = 6);
      });
      return scores;
  }

  static strategyDigitSum(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
      const getDigitSum = (n: number) => Math.floor(n/10) + n%10;
      const lastSum = getDigitSum(lastNum);
      const nextSumFreq: Record<number, number> = {};
      for(let i=1; i<Math.min(history.length, 60); i++) {
          const prev = this.parseNumbers(history[i].open_code).pop() || 1;
          const prevSum = getDigitSum(prev);
          if (prevSum === lastSum) {
              const curr = this.parseNumbers(history[i-1].open_code).pop() || 1;
              const currSum = getDigitSum(curr);
              nextSumFreq[currSum] = (nextSumFreq[currSum] || 0) + 1;
          }
      }
      const topSums = Object.entries(nextSumFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(x=>parseInt(x[0]));
      for(let n=1; n<=49; n++) {
          if (topSums.includes(getDigitSum(n))) scores[n] = 5;
      }
      return scores;
  }

  static strategyMarkovChain(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const lastNum = this.parseNumbers(history[0].open_code).pop() || 1;
      const transitionCounts: Record<number, number> = {};
      for (let i = 1; i < history.length; i++) {
          const prevNum = this.parseNumbers(history[i].open_code).pop();
          if (prevNum === lastNum) {
              const nextNum = this.parseNumbers(history[i - 1].open_code).pop();
              if (nextNum) {
                  transitionCounts[nextNum] = (transitionCounts[nextNum] || 0) + 1;
              }
          }
      }
      Object.entries(transitionCounts).forEach(([num, count]) => {
          scores[parseInt(num)] = count * 5; 
      });
      return scores;
  }

  static strategyPoisson(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const freq: Record<number, number> = {};
      const n = Math.min(history.length, 50);
      
      for(let i=0; i<n; i++) {
          const num = this.parseNumbers(history[i].open_code).pop();
          if(num) freq[num] = (freq[num] || 0) + 1;
      }
      for(let num=1; num<=49; num++) {
          const k = (freq[num] || 0);
          const lambda = k / n * 7; 
          const prob = lambda * Math.exp(-lambda);
          scores[num] = prob * 100;
      }
      return scores;
  }

  static strategyRegression(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      for(let num=1; num<=49; num++) {
          const gaps: number[] = [];
          let lastIndex = -1;
          for(let i=0; i<Math.min(history.length, 100); i++) {
              const nums = this.parseNumbers(history[i].open_code);
              if (nums.includes(num)) {
                  if (lastIndex !== -1) gaps.push(i - lastIndex);
                  lastIndex = i;
                  if (gaps.length >= 3) break;
              }
          }
          if (gaps.length >= 2) {
              if (gaps[0] < gaps[1]) {
                  scores[num] = 5;
                  if (gaps.length >=3 && gaps[1] < gaps[2]) scores[num] += 3;
              }
          }
      }
      return scores;
  }

  static strategyTailTrend(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 0; i < Math.min(history.length, 15); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      const weight = 15 - i; 
      nums.forEach(n => {
        const t = n % 10;
        scores[t] = (scores[t] || 0) + weight;
      });
    }
    return scores;
  }

  private static generateFallback(history: DbRecord[]): PredictionData {
    const freq: Record<number, number> = {};
    history.forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => freq[n] = (freq[n]||0)+1);
    });
    const hotNums = Object.keys(freq).map(Number).sort((a,b)=>freq[b]-freq[a]).slice(0, 18);
    const resultNums = hotNums.sort((a,b)=>a-b).map(n => n < 10 ? `0${n}` : `${n}`);
    return {
        zodiacs: ['鼠','牛','虎','兔','龙','蛇'],
        numbers: resultNums,
        wave: {main:'red', defense:'blue'},
        heads: ['0','1','2'],
        tails: ['1','2','3','4','5'],
        strategy_analysis: "基础热度兜底 (数据不足，无随机)"
    };
  }

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    return code.split(',').map(n => parseInt(n)).filter(n => !isNaN(n));
  }
}
