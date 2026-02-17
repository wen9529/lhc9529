import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  totalScore: number;
}

interface StrategyResult {
  name: string;
  score: number; // 归一化得分 (0-1)
  weight: number; // 最终动态权重
}

/**
 * 🌌 Omniscient Core v20.6 (Pure Math)
 * 移除了外部 AI 依赖，完全基于概率统计和混沌算法
 */
export class PredictionEngine {

  // 1=马 (Horse Year Logic for NEXT prediction)
  // 注意：此处仅用于预测引擎内部生成分析，若跨年需确保此处逻辑与当年一致
  static ZODIACS_MAP: Record<string, number[]> = {
    '马': [1, 13, 25, 37, 49], 
    '蛇': [2, 14, 26, 38], 
    '龙': [3, 15, 27, 39],
    '兔': [4, 16, 28, 40], 
    '虎': [5, 17, 29, 41], 
    '牛': [6, 18, 30, 42],
    '鼠': [7, 19, 31, 43], 
    '猪': [8, 20, 32, 44], 
    '狗': [9, 21, 33, 45],
    '鸡': [10, 22, 34, 46], 
    '猴': [11, 23, 35, 47], 
    '羊': [12, 24, 36, 48],
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

  static async generate(history: DbRecord[], type: LotteryType): Promise<PredictionData> {
    this.initializeMaps();
    
    if (!history || history.length < 50) return this.generateFallback(history);

    // 1. 确定性算法部分 - 回测与权重计算
    const strategies = this.runBacktest(history, 20);
    const bestStrategy = strategies.sort((a, b) => b.weight - a.weight)[0];
    const displayScore = (bestStrategy.score * 100).toFixed(0); 
    
    // 生成分析文案
    let analysisText = `Core: ${bestStrategy.name} (PI: ${displayScore})`;

    // 计算综合得分
    const stats = this.calculateCompositeScores(history, strategies);
    const sortedStats = Object.values(stats).sort((a, b) => b.totalScore - a.totalScore);
    
    // 提取 Top 18
    const final18 = sortedStats.slice(0, 18);
    const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 六肖 (基于得分权重)
    const zMap: Record<string, number> = {};
    final18.forEach((s, idx) => {
        const w = idx < 10 ? 2 : 1;
        zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore * w;
    });
    const recZodiacs = Object.keys(zMap).sort((a, b) => zMap[b] - zMap[a]).slice(0, 6);

    // 波色
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    final18.forEach(s => wMap[s.wave] = (wMap[s.wave] || 0) + s.totalScore);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 头数
    const hMap: Record<number, number> = {};
    final18.forEach(s => {
        const h = Math.floor(s.num / 10);
        hMap[h] = (hMap[h] || 0) + s.totalScore;
    });
    const recHeads = Object.keys(hMap).sort((a, b) => hMap[parseInt(b)] - hMap[parseInt(a)]).slice(0, 3).map(String);

    // 尾数
    const tailTrend = this.strategyTailTrend(history);
    const tMap: Record<number, number> = {};
    Object.entries(tailTrend).forEach(([t, s]) => tMap[Number(t)] = s);
    final18.forEach(s => {
        const t = s.num % 10;
        tMap[t] = (tMap[t] || 0) + s.totalScore * 5;
    });
    const recTails = Object.keys(tMap).map(Number).sort((a, b) => tMap[b] - tMap[a]).slice(0, 5).map(String);

    // 2. 智能推荐 (8码中特) - 直接使用综合算法得分最高的8个号码
    const top8Stats = sortedStats.slice(0, 8);
    const aiEightCodes = top8Stats.map(s => s.num < 10 ? `0${s.num}` : `${s.num}`).sort();
    
    analysisText += " | 综合算力生成";

    return {
      zodiacs: recZodiacs,
      numbers: resultNumbers,
      wave: { main: recWaves[0], defense: recWaves[1] },
      heads: recHeads,
      tails: recTails,
      ai_eight_codes: aiEightCodes,
      strategy_analysis: analysisText
    };
  }

  // --- Core Algorithm Functions (Keep Unchanged) ---
  
  static runBacktest(history: DbRecord[], windowSize: number): StrategyResult[] {
    const strategyDefinitions = this.getStrategies();
    const results = strategyDefinitions.map(s => ({ name: s.name, rawScore: 0, maxPotential: 0 }));

    for (let i = 0; i < windowSize; i++) {
      const targetRecord = history[i];
      const trainingData = history.slice(i + 1);
      if (trainingData.length < 50) break; 

      const targetNum = this.parseNumbers(targetRecord.open_code).pop();
      if (!targetNum) continue;

      const timeWeight = Math.pow(0.85, i);

      strategyDefinitions.forEach((strat, idx) => {
        const scores = strat.func(trainingData);
        const topPicked = Object.keys(scores)
          .map(Number)
          .sort((a, b) => scores[b] - scores[a])
          .slice(0, 8); 
        
        results[idx].maxPotential += timeWeight;

        if (topPicked.includes(targetNum)) {
          const rank = topPicked.indexOf(targetNum);
          const rankBonus = (8 - rank) / 8; 
          results[idx].rawScore += timeWeight * (0.5 + 0.5 * rankBonus);
        }
      });
    }

    return results.map(r => {
      const normalizedScore = r.maxPotential > 0 ? r.rawScore / r.maxPotential : 0;
      const dynamicWeight = 1.0 + Math.pow(normalizedScore * 4, 2); 
      return {
        name: r.name,
        score: normalizedScore,
        weight: dynamicWeight
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

    const funcMap: Record<string, Function> = {};
    this.getStrategies().forEach(s => funcMap[s.name] = s.func);

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
    
    for (let n = 1; n <= 49; n++) stats[n].totalScore += (n * 0.00001); 

    return stats;
  }

  static getStrategies() {
      // 保持原有策略列表
      return [
        { name: '偏移轨迹 (Offset)', func: this.strategyOffset.bind(this) },
        { name: '遗漏回补 (Omission)', func: this.strategyOmission.bind(this) },
        { name: '生肖转移 (Link)', func: this.strategyZodiacLink.bind(this) },
        { name: '历史镜像 (Mirror)', func: this.strategyHistoryMirror.bind(this) },
        { name: '时空模数 (Modulo)', func: this.strategyModulo.bind(this) },
        { name: '黄金分割 (Golden)', func: this.strategyGoldenSection.bind(this) },
        { name: '合数走势 (DigitSum)', func: this.strategyDigitSum.bind(this) },
        { name: '五行相生 (Element)', func: this.strategyFiveElements.bind(this) },
        { name: '三合六合 (Harmony)', func: this.strategyZodiacHarmony.bind(this) },
        { name: '马尔可夫链 (Markov)', func: this.strategyMarkovChain.bind(this) },
        { name: '泊松分布 (Poisson)', func: this.strategyPoisson.bind(this) },
        { name: '回归趋势 (Regression)', func: this.strategyRegression.bind(this) },
        { name: 'k-近邻 (k-NN)', func: this.strategyKNN.bind(this) },
        { name: '位运算漩涡 (Bitwise)', func: this.strategyBitwiseVortex.bind(this) },
        { name: '动量震荡 (Momentum)', func: this.strategyMomentum.bind(this) },
        { name: 'N-Gram (Pattern)', func: this.strategyNGram.bind(this) },
        { name: '质合平衡 (Prime)', func: this.strategyPrimeComposite.bind(this) },
        { name: '象限流动 (Quadrant)', func: this.strategyQuadrantFlow.bind(this) },
        { name: '波的干涉 (Interference)', func: this.strategyInterference.bind(this) },
        { name: '自回归 (AutoReg)', func: this.strategyAutoregression.bind(this) },
        { name: '奇异吸引子 (Attractor)', func: this.strategyStrangeAttractor.bind(this) },
        { name: '谐波共振 (Harmonic)', func: this.strategyHarmonicResonance.bind(this) },
        { name: '熵流 (Entropy)', func: this.strategyEntropyFlow.bind(this) },
        { name: '分形维数 (Fractal)', func: this.strategyFractalDimension.bind(this) },
        { name: '频谱分析 (Spectral)', func: this.strategySpectralAnalysis.bind(this) },
        { name: '引力场 (Gravity)', func: this.strategyGravityField.bind(this) },
        { name: '椭圆曲线 (ECC)', func: this.strategyEllipticCurve.bind(this) },
        { name: '卡尔曼滤波 (Kalman)', func: this.strategyKalmanFilter.bind(this) },
        { name: '矩阵行列式 (Matrix)', func: this.strategyMatrixDeterminant.bind(this) }
      ];
  }

  // Strategies Implementations (Copying strictly to ensure no logic loss)
  static strategyEllipticCurve(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const a = 2, b = 3; const p = 49; 
      const last = this.parseNumbers(history[0].open_code).pop() || 1;
      const prev = this.parseNumbers(history[1].open_code).pop() || 1;
      const calcY2 = (x: number) => (Math.pow(x, 3) + a * x + b) % p;
      const targetY2 = calcY2(last); const targetY2_prev = calcY2(prev);
      for(let x=1; x<=49; x++) {
          const y2 = calcY2(x);
          if (Math.abs(y2 - targetY2) <= 2) scores[x] = 5;
          if (Math.abs(y2 - targetY2_prev) <= 1) scores[x] = (scores[x]||0) + 3;
      }
      return scores;
  }
  static strategyKalmanFilter(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const data = [];
      for(let i=0; i<Math.min(history.length, 10); i++) data.unshift(this.parseNumbers(history[i].open_code).pop() || 25);
      let x = data[0]; let p = 10; const q = 2; const r = 5; let k = 0;       
      for(let i=1; i<data.length; i++) {
          p = p + q; k = p / (p + r); x = x + k * (data[i] - x); p = (1 - k) * p;
      }
      let pred = Math.round(x);
      while(pred > 49) pred -= 49; while(pred < 1) pred += 49;
      scores[pred] = 10;
      const err = Math.round(Math.sqrt(p));
      for(let i=1; i<=err; i++) {
         let up = pred + i; if(up>49) up-=49; let down = pred - i; if(down<1) down+=49;
         scores[up] = 5; scores[down] = 5;
      }
      return scores;
  }
  static strategyMatrixDeterminant(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      if (history.length < 9) return scores;
      const grid = [];
      for(let i=0; i<9; i++) grid.push(this.parseNumbers(history[i].open_code).pop() || 0);
      const det = grid[0]*(grid[4]*grid[8] - grid[5]*grid[7]) - grid[1]*(grid[3]*grid[8] - grid[5]*grid[6]) + grid[2]*(grid[3]*grid[7] - grid[4]*grid[6]);
      let seed = Math.abs(Math.round(det));
      const n1 = (seed % 49) || 49; scores[n1] = 8;
      const trace = grid[0] + grid[4] + grid[8]; const n2 = (trace % 49) || 49; scores[n2] = (scores[n2]||0) + 6;
      return scores;
  }
  static strategyFractalDimension(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const n = Math.min(history.length, 32); if (n < 16) return scores;
      const series = []; for(let i=0; i<n; i++) series.unshift(this.parseNumbers(history[i].open_code).pop() || 25);
      const mean = series.reduce((a,b)=>a+b, 0) / n;
      let sumDev = 0; let maxDev = -Infinity, minDev = Infinity;
      for(let x of series) { sumDev += (x - mean); maxDev = Math.max(maxDev, sumDev); minDev = Math.min(minDev, sumDev); }
      const R = maxDev - minDev; const variance = series.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / n;
      const S = Math.sqrt(variance); const rs = (S === 0) ? 0 : R/S; const H = (rs === 0) ? 0.5 : Math.log(rs) / Math.log(n);
      const freq: Record<number, number> = {}; series.forEach(x => freq[x] = (freq[x]||0)+1);
      for(let num=1; num<=49; num++) {
          const count = freq[num] || 0;
          if (H > 0.55) { if (count > 0) scores[num] = count * 3; } else if (H < 0.45) { if (count === 0) scores[num] = 5; } else { scores[num] = 1; }
      }
      return scores;
  }
  static strategySpectralAnalysis(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const N = 16; if (history.length < N) return scores;
      const series = []; for(let i=0; i<N; i++) series.unshift(this.parseNumbers(history[i].open_code).pop() || 0);
      const periods = [2, 3, 4, 6, 8]; let bestPeriod = 0; let maxPower = -1;
      for (let T of periods) {
          let re = 0, im = 0;
          for (let t=0; t<N; t++) { const theta = (2 * Math.PI * t) / T; re += series[t] * Math.cos(theta); im += series[t] * Math.sin(theta); }
          const power = re*re + im*im; if (power > maxPower) { maxPower = power; bestPeriod = T; }
      }
      if (bestPeriod > 0) {
          const last = series[N-1]; const prevCycle = series[N - 1 - bestPeriod] || series[N-2];
          const diff = last - prevCycle; let pred = last + diff;
          while (pred > 49) pred -= 49; while (pred < 1) pred += 49; scores[pred] = 10;
          const harmonic = (pred + Math.round(49/bestPeriod)) % 49 || 49; scores[harmonic] = 5;
      }
      return scores;
  }
  static strategyGravityField(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const particles: number[] = [];
      for(let i=0; i<Math.min(history.length, 10); i++) { const n = this.parseNumbers(history[i].open_code).pop(); if (n) particles.push(n); }
      const getDist = (a: number, b: number) => { const d = Math.abs(a - b); return Math.min(d, 49 - d); };
      for(let n=1; n<=49; n++) {
          let potential = 0; for(const p of particles) { let r = getDist(n, p); if (r === 0) r = 0.5; potential += 1 / r; }
          if (particles.includes(n)) scores[n] = potential * 2; else scores[n] = potential * 3; 
      }
      return scores;
  }
  static strategyStrangeAttractor(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      if (history.length < 3) return scores;
      let x = this.parseNumbers(history[0].open_code).pop() || 1;
      let y = this.parseNumbers(history[1].open_code).pop() || 1;
      let z = this.parseNumbers(history[2].open_code).pop() || 1;
      x = (x - 25) * 0.8; y = (y - 25) * 0.8; z = (z - 25) * 0.8;
      const sigma = 10, rho = 28, beta = 8/3, dt = 0.01;
      for(let i=0; i<50; i++) { const dx = sigma * (y - x); const dy = x * (rho - z) - y; const dz = x * y - beta * z; x += dx * dt; y += dy * dt; z += dz * dt; }
      const mapBack = (v: number) => { let n = Math.round((v / 0.8) + 25); n = Math.abs(n) % 49; return n === 0 ? 49 : n; };
      const predX = mapBack(x); scores[predX] = (scores[predX]||0) + 6;
      return scores;
  }
  static strategyHarmonicResonance(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const lastNum = this.parseNumbers(history[0].open_code).pop() || 25;
      for(let m=2; m<=4; m++) { const harmonic = lastNum * m; if (harmonic <= 49) scores[harmonic] = (scores[harmonic]||0) + 5; }
      if (lastNum % 2 === 0) scores[lastNum / 2] = (scores[lastNum / 2]||0) + 5;
      if (lastNum % 3 === 0) scores[lastNum / 3] = (scores[lastNum / 3]||0) + 5;
      const complement = 49 - lastNum; if (complement > 0) scores[complement] = (scores[complement]||0) + 3;
      return scores;
  }
  static strategyEntropyFlow(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const window = 10; if (history.length < window) return scores;
      const tails = []; for(let i=0; i<window; i++) tails.push((this.parseNumbers(history[i].open_code).pop() || 0) % 10);
      const calcEntropy = (arr: number[]) => {
          const freq: Record<number, number> = {}; arr.forEach(t => freq[t] = (freq[t]||0) + 1);
          let entropy = 0; Object.values(freq).forEach(count => { const p = count / arr.length; entropy -= p * Math.log2(p); });
          return entropy;
      };
      const currentEntropy = calcEntropy(tails); const targetHighEntropy = currentEntropy < 2.5;
      for(let n=1; n<=49; n++) {
          const t = n % 10; const nextTails = [t, ...tails.slice(0, window-1)]; const nextEntropy = calcEntropy(nextTails);
          if (targetHighEntropy) { if (nextEntropy > currentEntropy) scores[n] = 5; } else { if (nextEntropy <= currentEntropy) scores[n] = 5; }
      }
      return scores;
  }
  static strategyInterference(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const sources: number[] = []; for(let i=0; i<Math.min(history.length, 8); i++) { const n = this.parseNumbers(history[i].open_code).pop(); if (n) sources.push(n); }
      const getDist = (a: number, b: number) => { const d = Math.abs(a - b); return Math.min(d, 49 - d); };
      for(let n=1; n<=49; n++) { let amplitude = 0; for(const src of sources) { const d = getDist(n, src); amplitude += 1 / (d * d + 0.5); } scores[n] = amplitude * 5; }
      return scores;
  }
  static strategyAutoregression(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {};
      const trainSet = []; const window = Math.min(history.length, 30);
      for(let i=0; i<window-2; i++) { const y = this.parseNumbers(history[i].open_code).pop() || 0; const x1 = this.parseNumbers(history[i+1].open_code).pop() || 0; const x2 = this.parseNumbers(history[i+2].open_code).pop() || 0; trainSet.push({y, x1, x2}); }
      let bestW1 = 1, bestW2 = 1, bestScore = -1;
      for(let w1 = -3; w1 <= 3; w1++) { for(let w2 = -3; w2 <= 3; w2++) { if (w1===0 && w2===0) continue; let hit = 0; trainSet.forEach(item => { let pred = (w1 * item.x1 + w2 * item.x2) % 49; if (pred <= 0) pred += 49; const dist = Math.abs(pred - item.y); if (dist <= 1 || dist >= 48) hit++; }); if (hit > bestScore) { bestScore = hit; bestW1 = w1; bestW2 = w2; } } }
      const currT1 = this.parseNumbers(history[0].open_code).pop() || 0; const currT2 = this.parseNumbers(history[1].open_code).pop() || 0;
      let pred = (bestW1 * currT1 + bestW2 * currT2) % 49; if (pred <= 0) pred += 49;
      scores[pred] = 10; scores[pred-1 > 0 ? pred-1 : 49] = 5; scores[pred+1 <= 49 ? pred+1 : 1] = 5;
      return scores;
  }
  static strategyNGram(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const n = 2; if (history.length < 50) return scores;
      const v0 = this.parseNumbers(history[0].open_code).pop(); const v1 = this.parseNumbers(history[1].open_code).pop(); if (!v0 || !v1) return scores;
      for(let i = 2; i < history.length - 1; i++) { const curr = this.parseNumbers(history[i].open_code).pop(); const prev = this.parseNumbers(history[i+1].open_code).pop(); if (curr === v0 && prev === v1) { const next = this.parseNumbers(history[i-1].open_code).pop(); if (next) scores[next] = (scores[next] || 0) + 10; } }
      return scores;
  }
  static strategyPrimeComposite(history: DbRecord[]): Record<number, number> {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]; const scores: Record<number, number> = {}; let primeCount = 0; const window = 5;
      for(let i=0; i<window; i++) { const n = this.parseNumbers(history[i].open_code).pop() || 0; if (primes.includes(n)) primeCount++; }
      const ratio = primeCount / window; const expectPrime = ratio < 0.2; const expectComposite = ratio > 0.6;
      for(let i=1; i<=49; i++) { const isPrime = primes.includes(i); if (expectPrime && isPrime) scores[i] = 6; else if (expectComposite && !isPrime) scores[i] = 4; }
      return scores;
  }
  static strategyQuadrantFlow(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const getQuad = (n: number) => { if (n <= 12) return 1; if (n <= 24) return 2; if (n <= 36) return 3; return 4; };
      const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const lastQuad = getQuad(lastNum); const transFreq: Record<number, number> = {1:0, 2:0, 3:0, 4:0};
      for(let i=1; i<Math.min(history.length, 50); i++) { const prev = this.parseNumbers(history[i].open_code).pop() || 1; if (getQuad(prev) === lastQuad) { const curr = this.parseNumbers(history[i-1].open_code).pop() || 1; transFreq[getQuad(curr)]++; } }
      const bestQuadStr = Object.keys(transFreq).sort((a,b)=>transFreq[Number(b)]-transFreq[Number(a)])[0]; const bestQuad = Number(bestQuadStr);
      for(let i=1; i<=49; i++) { if (getQuad(i) === bestQuad) scores[i] = 4; }
      return scores;
  }
  static strategyKNN(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const k = 5; const vectorSize = 5; if (history.length < vectorSize * 2) return scores;
      const currentVector = []; for(let i=0; i<vectorSize; i++) currentVector.push(this.parseNumbers(history[i].open_code).pop() || 0);
      const distances: { dist: number, nextNum: number }[] = [];
      for(let i = vectorSize; i < Math.min(history.length - vectorSize - 1, 200); i++) { let dist = 0; let valid = true; for(let j=0; j<vectorSize; j++) { const histNum = this.parseNumbers(history[i+j].open_code).pop() || 0; if (histNum === 0) valid = false; dist += Math.pow(currentVector[j] - histNum, 2); } if (valid) { const nextNum = this.parseNumbers(history[i-1].open_code).pop() || 0; distances.push({ dist: Math.sqrt(dist), nextNum }); } }
      distances.sort((a,b) => a.dist - b.dist); const topK = distances.slice(0, k); topK.forEach(item => { if(item.nextNum > 0 && item.nextNum <= 49) scores[item.nextNum] = (scores[item.nextNum] || 0) + (100 / (item.dist + 1)); });
      return scores;
  }
  static strategyBitwiseVortex(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const n1 = this.parseNumbers(history[0].open_code).pop() || 0; const n2 = this.parseNumbers(history[1].open_code).pop() || 0; const n3 = this.parseNumbers(history[2].open_code).pop() || 0;
      const xorDiff = n1 ^ n2; let nextXor = (n1 ^ xorDiff) % 49 || 49; scores[nextXor] = 5;
      let chaos = (n1 & n2) | (n2 & n3); chaos = chaos % 49 || 49; scores[chaos] = (scores[chaos] || 0) + 5;
      const countBits = (n: number) => n.toString(2).split('1').length - 1; const bits = countBits(n1); for(let i=1; i<=49; i++) { if (countBits(i) === bits) scores[i] = (scores[i] || 0) + 2; }
      return scores;
  }
  static strategyMomentum(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const shortTerm = 10; const longTerm = 50;
      const getFreq = (period: number) => { const f: Record<number, number> = {}; for(let i=0; i<Math.min(history.length, period); i++) { const nums = this.parseNumbers(history[i].open_code); nums.forEach(n => f[n] = (f[n]||0)+1); } return f; };
      const shortFreq = getFreq(shortTerm); const longFreq = getFreq(longTerm);
      for(let n=1; n<=49; n++) { const sf = (shortFreq[n] || 0) / shortTerm; const lf = (longFreq[n] || 0) / longTerm; const momentum = sf - lf; if (momentum > 0.05) scores[n] = momentum * 100; if ((shortFreq[n] || 0) >= 3) scores[n] = 0; }
      return scores;
  }
  static strategyOffset(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const offsetCounts: Record<number, number> = {};
    for (let i = 0; i < Math.min(history.length - 1, 50); i++) { const curr = this.parseNumbers(history[i].open_code).pop(); const prev = this.parseNumbers(history[i + 1].open_code).pop(); if (curr && prev) { const diff = (curr - prev + 49) % 49; offsetCounts[diff] = (offsetCounts[diff] || 0) + 1; } }
    Object.entries(offsetCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([diffStr, count]) => { const nextNum = (lastNum + parseInt(diffStr) - 1) % 49 + 1; scores[nextNum] = count * 3; });
    return scores;
  }
  static strategyOmission(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const omission: Record<number, number> = {}; for (let i = 1; i <= 49; i++) omission[i] = 0;
    for (let n = 1; n <= 49; n++) { for (const rec of history) { const nums = this.parseNumbers(rec.open_code); if (nums.includes(n)) break; omission[n]++; } }
    for (let n = 1; n <= 49; n++) { const om = omission[n]; if (om > 35) scores[n] = 10; else if (om <= 3) scores[n] = 8; else if (Math.abs(om - 9) <= 1) scores[n] = 6; else if (Math.abs(om - 19) <= 1) scores[n] = 6; }
    return scores;
  }
  static strategyZodiacLink(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const lastZodiac = this.NUM_TO_ZODIAC[lastNum]; const nextZodiacFreq: Record<string, number> = {};
    for (let i = 1; i < Math.min(history.length, 80); i++) { const prevNum = this.parseNumbers(history[i].open_code).pop() || 1; const prevZodiac = this.NUM_TO_ZODIAC[prevNum]; if (prevZodiac === lastZodiac) { const targetNum = this.parseNumbers(history[i - 1].open_code).pop() || 1; const targetZodiac = this.NUM_TO_ZODIAC[targetNum]; nextZodiacFreq[targetZodiac] = (nextZodiacFreq[targetZodiac] || 0) + 1; } }
    for (let n = 1; n <= 49; n++) { const z = this.NUM_TO_ZODIAC[n]; if (nextZodiacFreq[z]) scores[n] = nextZodiacFreq[z] * 2; }
    return scores;
  }
  static strategyHistoryMirror(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const lastWave = this.NUM_TO_WAVE[lastNum]; const nextNumCounts: Record<number, number> = {};
    for (let i = 1; i < Math.min(history.length, 60); i++) { const prevNum = this.parseNumbers(history[i].open_code).pop() || 1; const prevWave = this.NUM_TO_WAVE[prevNum]; if (prevWave === lastWave) { const nextNum = this.parseNumbers(history[i - 1].open_code).pop(); if (nextNum) nextNumCounts[nextNum] = (nextNumCounts[nextNum] || 0) + 1; } }
    for (let n = 1; n <= 49; n++) { if (nextNumCounts[n]) scores[n] = nextNumCounts[n] * 4; }
    return scores;
  }
  static strategyModulo(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const mod3 = lastNum % 3; const mod3NextFreq: Record<number, number> = { 0:0, 1:0, 2:0 };
    for (let i = 0; i < Math.min(history.length, 50); i++) { const curr = this.parseNumbers(history[i].open_code).pop(); const prev = this.parseNumbers(history[i+1].open_code).pop(); if (curr && prev && prev % 3 === mod3) { mod3NextFreq[curr % 3]++; } }
    const bestMod = Object.keys(mod3NextFreq).sort((a,b) => mod3NextFreq[Number(b)] - mod3NextFreq[Number(a)])[0]; for (let n = 1; n <= 49; n++) { if (n % 3 === Number(bestMod)) scores[n] = 5; }
    return scores;
  }
  static strategyGoldenSection(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; const lastNums = this.parseNumbers(history[0].open_code); const lastSpecial = lastNums[lastNums.length-1] || 25; const lastSum = lastNums.reduce((a,b)=>a+b, 0);
    const gold1 = Math.round(lastSum * 0.618) % 49 || 49; scores[gold1] = (scores[gold1] || 0) + 8; const gold2 = Math.round(lastSpecial * 1.618) % 49 || 49; scores[gold2] = (scores[gold2] || 0) + 8; const gold3 = Math.round(lastSpecial * 0.618) || 1; scores[gold3] = (scores[gold3] || 0) + 8;
    return scores;
  }
  static strategyFiveElements(history: DbRecord[]): Record<number, number> {
    const generationMap: Record<string, string> = {'木':'火', '火':'土', '土':'金', '金':'水', '水':'木'}; const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const lastElement = this.NUM_TO_ELEMENT[lastNum];
    if (lastElement && generationMap[lastElement]) { const targetElement = generationMap[lastElement]; const targetNums = this.ELEMENTS_MAP[targetElement]; targetNums.forEach(n => scores[n] = 8); }
    return scores;
  }
  static strategyZodiacHarmony(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const lastZodiac = this.NUM_TO_ZODIAC[lastNum];
      const triads: Record<string, string[]> = { '鼠':['龙','猴'], '龙':['鼠','猴'], '猴':['鼠','龙'], '牛':['蛇','鸡'], '蛇':['牛','鸡'], '鸡':['牛','蛇'], '虎':['马','狗'], '马':['虎','狗'], '狗':['虎','马'], '兔':['羊','猪'], '羊':['兔','猪'], '猪':['兔','羊'] };
      const six: Record<string, string> = { '鼠':'牛', '牛':'鼠', '虎':'猪', '猪':'虎', '兔':'狗', '狗':'兔', '龙':'鸡', '鸡':'龙', '蛇':'猴', '猴':'蛇', '马':'羊', '羊':'马' };
      const targets = new Set<string>(); if(triads[lastZodiac]) triads[lastZodiac].forEach(z => targets.add(z)); if(six[lastZodiac]) targets.add(six[lastZodiac]); targets.forEach(z => { this.ZODIACS_MAP[z].forEach(n => scores[n] = 6); });
      return scores;
  }
  static strategyDigitSum(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const getDigitSum = (n: number) => Math.floor(n/10) + n%10; const lastSum = getDigitSum(lastNum); const nextSumFreq: Record<number, number> = {};
      for(let i=1; i<Math.min(history.length, 60); i++) { const prev = this.parseNumbers(history[i].open_code).pop() || 1; const prevSum = getDigitSum(prev); if (prevSum === lastSum) { const curr = this.parseNumbers(history[i-1].open_code).pop() || 1; const currSum = getDigitSum(curr); nextSumFreq[currSum] = (nextSumFreq[currSum] || 0) + 1; } }
      const topSums = Object.entries(nextSumFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(x=>parseInt(x[0])); for(let n=1; n<=49; n++) { if (topSums.includes(getDigitSum(n))) scores[n] = 5; }
      return scores;
  }
  static strategyMarkovChain(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const lastNum = this.parseNumbers(history[0].open_code).pop() || 1; const transitionCounts: Record<number, number> = {};
      for (let i = 1; i < history.length; i++) { const prevNum = this.parseNumbers(history[i].open_code).pop(); if (prevNum === lastNum) { const nextNum = this.parseNumbers(history[i - 1].open_code).pop(); if (nextNum) { transitionCounts[nextNum] = (transitionCounts[nextNum] || 0) + 1; } } }
      Object.entries(transitionCounts).forEach(([num, count]) => { scores[parseInt(num)] = count * 5; });
      return scores;
  }
  static strategyPoisson(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; const freq: Record<number, number> = {}; const n = Math.min(history.length, 50); for(let i=0; i<n; i++) { const num = this.parseNumbers(history[i].open_code).pop(); if(num) freq[num] = (freq[num] || 0) + 1; } for(let num=1; num<=49; num++) { const k = (freq[num] || 0); const lambda = k / n * 7; const prob = lambda * Math.exp(-lambda); scores[num] = prob * 100; }
      return scores;
  }
  static strategyRegression(history: DbRecord[]): Record<number, number> {
      const scores: Record<number, number> = {}; for(let num=1; num<=49; num++) { const gaps: number[] = []; let lastIndex = -1; for(let i=0; i<Math.min(history.length, 100); i++) { const nums = this.parseNumbers(history[i].open_code); if (nums.includes(num)) { if (lastIndex !== -1) gaps.push(i - lastIndex); lastIndex = i; if (gaps.length >= 3) break; } } if (gaps.length >= 2) { if (gaps[0] < gaps[1]) { scores[num] = 5; if (gaps.length >=3 && gaps[1] < gaps[2]) scores[num] += 3; } } }
      return scores;
  }
  static strategyTailTrend(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {}; for (let i = 0; i < Math.min(history.length, 15); i++) { const nums = this.parseNumbers(history[i].open_code); const weight = 15 - i; nums.forEach(n => { const t = n % 10; scores[t] = (scores[t] || 0) + weight; }); }
    return scores;
  }

  private static generateFallback(history: DbRecord[]): PredictionData {
    const freq: Record<number, number> = {};
    history.forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => freq[n] = (freq[n]||0)+1);
    });
    const hotNums = Object.keys(freq).map(Number).sort((a,b)=>freq[b]-freq[a]).slice(0, 18);
    const resultNums = hotNums.sort((a,b)=>a-b).map(n => n < 10 ? `0${n}` : `${n}`);
    
    // 兜底六肖
    const zMap: Record<string, number> = {};
    hotNums.slice(0, 10).forEach(n => {
        const z = this.NUM_TO_ZODIAC[n]; 
        if(z) zMap[z] = (zMap[z]||0) + 1;
    });
    const recZodiacs = Object.keys(zMap).sort((a,b)=>zMap[b]-zMap[a]).slice(0, 6);
    if(recZodiacs.length < 6) recZodiacs.push(...['鼠','牛','虎','兔','龙','蛇'].filter(z=>!recZodiacs.includes(z)));

    return {
        zodiacs: recZodiacs.slice(0, 6),
        numbers: resultNums,
        wave: {main:'red', defense:'blue'},
        heads: ['0','1','2'],
        tails: ['1','2','3','4','5'],
        ai_eight_codes: resultNums.slice(0, 8),
        strategy_analysis: "基础热度兜底 (数据不足)"
    };
  }

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    return code.split(',').map(n => parseInt(n)).filter(n => !isNaN(n));
  }
}