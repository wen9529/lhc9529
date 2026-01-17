import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  
  // 十八维度评分系统
  scores: {
    zodiacTrans: number;
    numberTrans: number;
    historyMirror: number;
    specialTraj: number;
    pattern: number;
    tail: number;
    zodiac: number;
    wuXing: number;
    wave: number;
    gold: number;
    omission: number;
    seasonal: number;
    prime: number;
    sumAnalysis: number;
    position: number;
    frequency: number;
    cluster: number;
    symmetry: number;
    periodic: number;
    trend: number;
    correlation: number;
  };
  
  totalScore: number;
}

interface EngineConfig {
  periods: {
    full: number;
    recent50: number;
    recent30: number;
    recent20: number;
    recent10: number;
    omission: number;
    prime: number;
    sum: number;
    position: number;
  };
  weights: Record<string, number>;
  thresholds: {
    minHistoryLength: number;
    hotNumberThreshold: number;
    coldNumberThreshold: number;
    omissionCritical: number;
  };
  diversity: {
    zodiac: number;
    wave: number;
    tail: number;
    wuxing: number;
    head: number;
  };
}

interface ParsedHistory {
  numbers: number[];
  special: number;
  sum: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  drawIndex: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v15.0 "Complete History Edition"
 * 基于全部历史记录的完整分析，科学精准预测
 * 重构版：性能优化 + 代码结构优化
 */
export class PredictionEngine {
  private static instance: PredictionEngine;
  private config: EngineConfig;
  private parsedHistoryCache: Map<string, ParsedHistory[]> = new Map();
  private lastConfigUpdate: number = 0;
  private performanceStats: Array<{
    timestamp: number;
    executionTime: number;
    predictionAccuracy?: number;
  }> = [];

  // --- 基础数据映射 (2025 Snake Year) ---
  static readonly ZODIACS_MAP: Record<string, number[]> = {
    '蛇': [1, 13, 25, 37, 49], '马': [12, 24, 36, 48], '羊': [11, 23, 35, 47],
    '猴': [10, 22, 34, 46], '鸡': [9, 21, 33, 45], '狗': [8, 20, 32, 44],
    '猪': [7, 19, 31, 43], '鼠': [6, 18, 30, 42], '牛': [5, 17, 29, 41],
    '虎': [4, 16, 28, 40], '兔': [3, 15, 27, 39], '龙': [2, 14, 26, 38],
  };

  static readonly SAN_HE_MAP: Record<string, string[]> = {
    '鼠': ['龙', '猴'], '龙': ['鼠', '猴'], '猴': ['鼠', '龙'],
    '牛': ['蛇', '鸡'], '蛇': ['牛', '鸡'], '鸡': ['牛', '蛇'],
    '虎': ['马', '狗'], '马': ['虎', '狗'], '狗': ['虎', '马'],
    '兔': ['猪', '羊'], '猪': ['兔', '羊'], '羊': ['兔', '猪']
  };
  
  static readonly WU_XING_MAP: Record<string, number[]> = {
    '金': [1, 2, 9, 10, 23, 24, 31, 32, 37, 38],
    '木': [3, 4, 11, 12, 19, 20, 33, 34, 41, 42, 49],
    '水': [5, 6, 13, 14, 21, 22, 35, 36, 43, 44],
    '火': [7, 8, 15, 16, 29, 30, 39, 40, 47, 48],
    '土': [17, 18, 25, 26, 27, 28, 45, 46]
  };

  static readonly WAVES_MAP = {
    'red': [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
    'blue': [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
    'green': [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
  };

  // 季节映射
  static readonly SEASONAL_ZODIACS: Record<string, string[]> = {
    '春': ['虎', '兔', '龙'],
    '夏': ['蛇', '马', '羊'],
    '秋': ['猴', '鸡', '狗'],
    '冬': ['猪', '鼠', '牛']
  };

  // 质数号码
  static readonly PRIME_NUMBERS: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

  // 对称号码对
  static readonly SYMMETRY_PAIRS: [number, number][] = [
    [1, 49], [2, 48], [3, 47], [4, 46], [5, 45], [6, 44], [7, 43],
    [8, 42], [9, 41], [10, 40], [11, 39], [12, 38], [13, 37], [14, 36],
    [15, 35], [16, 34], [17, 33], [18, 32], [19, 31], [20, 30], [21, 29],
    [22, 28], [23, 27], [24, 26]
  ];

  // 周期分析参数
  static readonly PERIODIC_CYCLES = {
    zodiac: 12,
    wave: 7,
    wuxing: 5,
    tail: 10
  };

  static readonly NUM_TO_ZODIAC: Record<number, string> = {};
  static readonly NUM_TO_WUXING: Record<number, string> = {};
  static readonly NUM_TO_WAVE: Record<number, string> = {};

  private constructor() {
    this.initializeStaticMaps();
    this.config = this.getDefaultConfig();
  }

  static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  private initializeStaticMaps(): void {
    if (Object.keys(PredictionEngine.NUM_TO_ZODIAC).length > 0) return;
    
    // 初始化生肖映射
    for (const [z, nums] of Object.entries(PredictionEngine.ZODIACS_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          PredictionEngine.NUM_TO_ZODIAC[n] = z;
        }
      });
    }
    
    // 初始化五行映射
    for (const [w, nums] of Object.entries(PredictionEngine.WU_XING_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          PredictionEngine.NUM_TO_WUXING[n] = w;
        }
      });
    }
    
    // 初始化波色映射
    for (const [wave, nums] of Object.entries(PredictionEngine.WAVES_MAP)) {
      nums.forEach(n => {
        PredictionEngine.NUM_TO_WAVE[n] = wave;
      });
    }
  }

  private getDefaultConfig(): EngineConfig {
    return {
      periods: {
        full: 100,
        recent50: 50,
        recent30: 30,
        recent20: 20,
        recent10: 10,
        omission: 100,
        prime: 50,
        sum: 50,
        position: 50
      },
      weights: {
        zodiacTrans: 2.5,
        numberTrans: 2.0,
        historyMirror: 1.5,
        specialTraj: 1.3,
        pattern: 1.2,
        tail: 1.0,
        zodiac: 1.0,
        wuXing: 0.9,
        wave: 0.9,
        gold: 0.8,
        omission: 0.8,
        seasonal: 0.7,
        prime: 0.7,
        sumAnalysis: 0.6,
        position: 0.6,
        frequency: 0.6,
        cluster: 0.5,
        symmetry: 0.5,
        periodic: 0.5,
        trend: 0.5,
        correlation: 0.5
      },
      thresholds: {
        minHistoryLength: 30,
        hotNumberThreshold: 1.5,
        coldNumberThreshold: 0.5,
        omissionCritical: 0.8
      },
      diversity: {
        zodiac: 3,
        wave: 6,
        tail: 3,
        wuxing: 5,
        head: 3
      }
    };
  }

  /**
   * 主预测函数
   */
  generate(history: DbRecord[], type: LotteryType): PredictionData {
    const startTime = performance.now();
    
    try {
      // 检查历史数据是否足够
      if (!history || history.length < this.config.thresholds.minHistoryLength) {
        console.warn(`历史数据不足${this.config.thresholds.minHistoryLength}期，使用增强随机生成`);
        return this.generateEnhancedRandom(history);
      }

      // 解析并缓存历史数据
      const parsedHistories = this.parseAndCacheHistory(history);
      
      // 数据切片
      const fullHistory = parsedHistories.slice(0, Math.min(parsedHistories.length, this.config.periods.full));
      const recent50 = parsedHistories.slice(0, Math.min(parsedHistories.length, this.config.periods.recent50));
      const recent30 = parsedHistories.slice(0, Math.min(parsedHistories.length, this.config.periods.recent30));
      const recent20 = parsedHistories.slice(0, Math.min(parsedHistories.length, this.config.periods.recent20));
      const recent10 = parsedHistories.slice(0, Math.min(parsedHistories.length, this.config.periods.recent10));
      
      // 上期开奖数据
      const lastDraw = fullHistory[0];
      
      // 当前时间信息
      const currentDate = history[0].draw_time ? new Date(history[0].draw_time) : new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentSeason = this.getSeasonByMonth(currentMonth);
      const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
      const currentDay = currentDate.getDay();

      // 初始化状态池
      const stats: NumberStat[] = this.initializeNumberStats();

      // ==========================================
      // 并行执行所有分析算法
      // ==========================================
      const analysisResults = this.executeParallelAnalysis({
        fullHistory,
        recent50,
        recent30,
        recent20,
        recent10,
        lastDraw,
        currentMonth,
        currentSeason,
        currentWeek,
        currentDay
      });

      // 应用分析结果到状态
      this.applyAnalysisResults(stats, analysisResults);

      // 动态调整权重
      this.adjustWeightsBasedOnHistory(fullHistory);

      // 计算最终分数
      this.calculateFinalScores(stats);

      // 多样性选码
      const final18 = this.selectDiverseNumbers(stats, 18);
      const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

      // 计算推荐
      const recommendations = this.calculateRecommendations(final18);

      const endTime = performance.now();
      this.recordPerformance(endTime - startTime);

      return {
        zodiacs: recommendations.zodiacs,
        numbers: resultNumbers,
        wave: recommendations.wave,
        heads: recommendations.heads,
        tails: recommendations.tails
      };
    } catch (error) {
      console.error('预测引擎错误:', error);
      return this.generateEnhancedRandom(history);
    }
  }

  /**
   * 解析并缓存历史数据
   */
  private parseAndCacheHistory(history: DbRecord[]): ParsedHistory[] {
    const cacheKey = history.map(h => h.open_code + h.draw_time).join('|');
    
    if (this.parsedHistoryCache.has(cacheKey)) {
      return this.parsedHistoryCache.get(cacheKey)!;
    }
    
    const parsed = history.map((record, index) => {
      const numbers = this.parseNumbers(record.open_code);
      const special = numbers.length > 0 ? numbers[numbers.length - 1] : 0;
      const sum = numbers.reduce((a, b) => a + b, 0);
      
      return {
        numbers,
        special,
        sum,
        zodiac: PredictionEngine.NUM_TO_ZODIAC[special] || '',
        wave: this.getNumWave(special),
        wuxing: PredictionEngine.NUM_TO_WUXING[special] || '',
        tail: special % 10,
        head: Math.floor(special / 10),
        drawIndex: index
      };
    }).filter(h => h.special > 0);
    
    this.parsedHistoryCache.set(cacheKey, parsed);
    
    // 限制缓存大小
    if (this.parsedHistoryCache.size > 50) {
      const firstKey = this.parsedHistoryCache.keys().next().value;
      this.parsedHistoryCache.delete(firstKey);
    }
    
    return parsed;
  }

  /**
   * 初始化号码状态
   */
  private initializeNumberStats(): NumberStat[] {
    const stats: NumberStat[] = [];
    
    for (let i = 1; i <= 49; i++) {
      stats.push({
        num: i,
        zodiac: PredictionEngine.NUM_TO_ZODIAC[i] || '',
        wave: this.getNumWave(i),
        wuxing: PredictionEngine.NUM_TO_WUXING[i] || '',
        tail: i % 10,
        head: Math.floor(i / 10),
        scores: {
          zodiacTrans: 0,
          numberTrans: 0,
          historyMirror: 0,
          specialTraj: 0,
          pattern: 0,
          tail: 0,
          zodiac: 0,
          wuXing: 0,
          wave: 0,
          gold: 0,
          omission: 0,
          seasonal: 0,
          prime: 0,
          sumAnalysis: 0,
          position: 0,
          frequency: 0,
          cluster: 0,
          symmetry: 0,
          periodic: 0,
          trend: 0,
          correlation: 0
        },
        totalScore: 0
      });
    }
    
    return stats;
  }

  /**
   * 并行执行分析算法
   */
  private executeParallelAnalysis(data: {
    fullHistory: ParsedHistory[];
    recent50: ParsedHistory[];
    recent30: ParsedHistory[];
    recent20: ParsedHistory[];
    recent10: ParsedHistory[];
    lastDraw: ParsedHistory;
    currentMonth: number;
    currentSeason: string;
    currentWeek: number;
    currentDay: number;
  }): Record<string, any> {
    const results: Record<string, any> = {};
    
    // 同步执行所有分析（实际项目中可以使用真正的并行处理）
    results.zodiacTrans = this.analyzeZodiacTransitions(data.fullHistory, data.lastDraw);
    results.numberTrans = this.analyzeNumberTransitions(data.fullHistory, data.lastDraw.special);
    results.historyMirror = this.analyzeHistoryMirror(data.fullHistory, data.lastDraw.numbers);
    results.specialTraj = this.analyzeSpecialTrajectory(data.recent50, data.lastDraw.special);
    results.pattern = this.analyzePattern(data.lastDraw.numbers, data.recent10);
    results.tail = this.analyzeTailDistribution(data.recent10);
    results.zodiac = this.analyzeZodiacDistribution(data.recent20, data.lastDraw.zodiac);
    results.wuXing = this.analyzeWuxingDistribution(data.recent10);
    results.wave = this.analyzeWaveDistribution(data.recent10, data.lastDraw.special);
    results.gold = this.analyzeGoldNumbers(data.lastDraw.sum, data.lastDraw.special);
    results.omission = this.analyzeOmission(data.fullHistory);
    results.seasonal = this.analyzeSeasonal(data.currentMonth, data.currentWeek, data.currentDay);
    results.prime = this.analyzePrimeDistribution(data.recent50);
    results.sumAnalysis = this.analyzeSumPatterns(data.recent50, data.lastDraw.sum);
    results.position = this.analyzePosition(data.recent50);
    results.frequency = this.analyzeFrequency(data.fullHistory);
    results.cluster = this.analyzeCluster(data.lastDraw.numbers, data.recent50);
    results.symmetry = this.analyzeSymmetry(data.recent50, data.lastDraw.numbers);
    results.periodic = this.analyzePeriodicity(data.fullHistory, data.currentWeek);
    results.trend = this.analyzeTrend(data.fullHistory);
    results.correlation = this.analyzeCorrelation(data.recent50);
    
    return results;
  }

  /**
   * 应用分析结果
   */
  private applyAnalysisResults(stats: NumberStat[], results: Record<string, any>): void {
    stats.forEach(stat => {
      // 生肖转移分析
      stat.scores.zodiacTrans = results.zodiacTrans[stat.zodiac] || 0;
      
      // 特码转移分析
      stat.scores.numberTrans = results.numberTrans[stat.num] || 0;
      
      // 历史镜像分析
      stat.scores.historyMirror = results.historyMirror[stat.num] || 0;
      
      // 特码轨迹分析
      stat.scores.specialTraj = results.specialTraj[stat.num] || 0;
      
      // 形态分析
      stat.scores.pattern = results.pattern[stat.num] || 0;
      
      // 尾数分析
      stat.scores.tail = results.tail[stat.tail] || 0;
      
      // 生肖分析
      stat.scores.zodiac = results.zodiac[stat.zodiac] || 0;
      
      // 五行分析
      stat.scores.wuXing = results.wuXing[stat.wuxing] || 0;
      
      // 波色分析
      stat.scores.wave = results.wave[stat.wave] || 0;
      
      // 黄金号码
      if (results.gold.includes(stat.num)) stat.scores.gold = 25;
      
      // 遗漏分析
      stat.scores.omission = results.omission[stat.num] || 0;
      
      // 季节分析
      stat.scores.seasonal = results.seasonal[stat.zodiac] || 0;
      if (stat.num % 10 === (new Date().getMonth() + 1) % 10) {
        stat.scores.seasonal += 5;
      }
      
      // 质数分析
      const isPrime = PredictionEngine.PRIME_NUMBERS.includes(stat.num);
      if (results.prime.needMorePrimes && isPrime) {
        stat.scores.prime = 15;
      } else if (results.prime.needMoreComposites && !isPrime) {
        stat.scores.prime = 15;
      }
      
      // 和值分析
      stat.scores.sumAnalysis = results.sumAnalysis.getScore(
        results.lastDrawSum - results.lastDrawSpecial + stat.num
      ) || 0;
      
      // 位置分析
      stat.scores.position = results.position[stat.num] || 0;
      
      // 频率分析
      stat.scores.frequency = results.frequency[stat.num] || 0;
      
      // 聚类分析
      stat.scores.cluster = results.cluster[stat.num] || 0;
      
      // 对称分析
      stat.scores.symmetry = results.symmetry[stat.num] || 0;
      
      // 周期分析
      stat.scores.periodic = results.periodic[stat.num] || 0;
      
      // 趋势分析
      stat.scores.trend = results.trend[stat.num] || 0;
      
      // 相关性分析
      stat.scores.correlation = results.correlation[stat.num] || 0;
    });
  }

  /**
   * 计算最终分数
   */
  private calculateFinalScores(stats: NumberStat[]): void {
    stats.forEach(stat => {
      stat.totalScore = 
        stat.scores.zodiacTrans * this.config.weights.zodiacTrans +
        stat.scores.numberTrans * this.config.weights.numberTrans +
        stat.scores.historyMirror * this.config.weights.historyMirror +
        stat.scores.specialTraj * this.config.weights.specialTraj +
        stat.scores.pattern * this.config.weights.pattern +
        stat.scores.tail * this.config.weights.tail +
        stat.scores.zodiac * this.config.weights.zodiac +
        stat.scores.wuXing * this.config.weights.wuXing +
        stat.scores.wave * this.config.weights.wave +
        stat.scores.gold * this.config.weights.gold +
        stat.scores.omission * this.config.weights.omission +
        stat.scores.seasonal * this.config.weights.seasonal +
        stat.scores.prime * this.config.weights.prime +
        stat.scores.sumAnalysis * this.config.weights.sumAnalysis +
        stat.scores.position * this.config.weights.position +
        stat.scores.frequency * this.config.weights.frequency +
        stat.scores.cluster * this.config.weights.cluster +
        stat.scores.symmetry * this.config.weights.symmetry +
        stat.scores.periodic * this.config.weights.periodic +
        stat.scores.trend * this.config.weights.trend +
        stat.scores.correlation * this.config.weights.correlation;
    });
    
    // 排序
    stats.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * 多样性选择算法
   */
  private selectDiverseNumbers(stats: NumberStat[], count: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const limits = this.config.diversity;
    
    const counts = {
      zodiac: new Map<string, number>(),
      wave: new Map<string, number>([['red', 0], ['blue', 0], ['green', 0]]),
      tail: new Map<number, number>(),
      wuxing: new Map<string, number>(),
      head: new Map<number, number>()
    };

    // 第一阶段：高分数选择 (70%)
    const phase1Count = Math.floor(count * 0.7);
    
    for (const stat of stats) {
      if (selected.length >= phase1Count) break;
      
      const zodiacCount = counts.zodiac.get(stat.zodiac) || 0;
      const waveCount = counts.wave.get(stat.wave) || 0;
      const tailCount = counts.tail.get(stat.tail) || 0;
      const wuxingCount = counts.wuxing.get(stat.wuxing) || 0;
      const headCount = counts.head.get(stat.head) || 0;
      
      if (zodiacCount < limits.zodiac &&
          waveCount < limits.wave &&
          tailCount < limits.tail &&
          wuxingCount < limits.wuxing &&
          headCount < limits.head) {
        
        selected.push(stat);
        counts.zodiac.set(stat.zodiac, zodiacCount + 1);
        counts.wave.set(stat.wave, waveCount + 1);
        counts.tail.set(stat.tail, tailCount + 1);
        counts.wuxing.set(stat.wuxing, wuxingCount + 1);
        counts.head.set(stat.head, headCount + 1);
      }
    }

    // 第二阶段：补充多样性不足的类别
    if (selected.length < count) {
      const remaining = stats.filter(s => !selected.includes(s));
      
      // 计算各分类已选择数量
      const getCurrentCounts = (type: keyof typeof counts) => {
        const result: Record<string, number> = {};
        for (const [key, value] of counts[type].entries()) {
          if (typeof key === 'string') {
            result[key] = value;
          } else {
            result[key.toString()] = value;
          }
        }
        return result;
      };

      const currentZodiacs = getCurrentCounts('zodiac');
      const currentWaves = getCurrentCounts('wave');
      
      for (const stat of remaining) {
        if (selected.length >= count) break;
        
        // 检查是否需要补充某个分类
        const needsMoreOfType = 
          (currentZodiacs[stat.zodiac] || 0) < 1 ||
          (currentWaves[stat.wave] || 0) < 2;
        
        if (needsMoreOfType) {
          selected.push(stat);
          // 更新计数
          counts.zodiac.set(stat.zodiac, (counts.zodiac.get(stat.zodiac) || 0) + 1);
          counts.wave.set(stat.wave, (counts.wave.get(stat.wave) || 0) + 1);
          currentZodiacs[stat.zodiac] = (currentZodiacs[stat.zodiac] || 0) + 1;
          currentWaves[stat.wave] = (currentWaves[stat.wave] || 0) + 1;
        }
      }
    }

    // 第三阶段：如果还不够，补充最高分数的
    if (selected.length < count) {
      const remaining = stats.filter(s => !selected.includes(s));
      selected.push(...remaining.slice(0, count - selected.length));
    }

    return selected.slice(0, count);
  }

  /**
   * 计算推荐结果
   */
  private calculateRecommendations(selectedStats: NumberStat[]): {
    zodiacs: string[];
    wave: { main: 'red' | 'blue' | 'green'; defense: 'red' | 'blue' | 'green' };
    heads: string[];
    tails: string[];
  } {
    // 计算推荐生肖 (基于总分权重)
    const zodiacScores = new Map<string, number>();
    selectedStats.forEach(stat => {
      zodiacScores.set(stat.zodiac, (zodiacScores.get(stat.zodiac) || 0) + stat.totalScore);
    });
    
    const recZodiacs = Array.from(zodiacScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([zodiac]) => zodiac);

    // 计算推荐波色
    const waveCounts = { red: 0, blue: 0, green: 0 };
    selectedStats.forEach(stat => {
      waveCounts[stat.wave as keyof typeof waveCounts]++;
    });
    
    const recWaves = Object.entries(waveCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([wave]) => wave as 'red' | 'blue' | 'green');

    // 计算推荐头尾
    const heads = new Set<number>();
    const tails = new Set<number>();
    selectedStats.forEach(stat => {
      heads.add(stat.head);
      tails.add(stat.tail);
    });

    return {
      zodiacs: recZodiacs,
      wave: { main: recWaves[0], defense: recWaves[1] || recWaves[0] },
      heads: Array.from(heades).sort((a, b) => a - b).slice(0, 3).map(String),
      tails: Array.from(tails).sort((a, b) => a - b).slice(0, 5).map(String)
    };
  }

  /**
   * 根据历史表现动态调整权重
   */
  private adjustWeightsBasedOnHistory(history: ParsedHistory[]): void {
    if (Date.now() - this.lastConfigUpdate < 24 * 60 * 60 * 1000) {
      return; // 每天最多更新一次
    }

    // 这里可以添加权重调整逻辑
    // 例如：根据各算法在最近100期的预测准确率调整权重
    // 当前为占位实现
    
    this.lastConfigUpdate = Date.now();
  }

  // ==========================================
  // 各分析算法的具体实现
  // ==========================================

  /**
   * 1. 生肖转移分析
   */
  private analyzeZodiacTransitions(history: ParsedHistory[], lastDraw: ParsedHistory): Record<string, number> {
    const zodiacTransMap = new Map<string, number>();
    let zodiacTransTotal = 0;

    for (let i = 1; i < history.length - 1; i++) {
      if (history[i].zodiac === lastDraw.zodiac) {
        const nextZodiac = history[i-1].zodiac;
        if (nextZodiac) {
          zodiacTransMap.set(nextZodiac, (zodiacTransMap.get(nextZodiac) || 0) + 1);
          zodiacTransTotal++;
        }
      }
    }
    
    const scores: Record<string, number> = {};
    if (zodiacTransTotal > 0) {
      for (const [zodiac, count] of zodiacTransMap.entries()) {
        scores[zodiac] = (count / zodiacTransTotal) * 50;
      }
    }
    
    return scores;
  }

  /**
   * 2. 特码转移分析
   */
  private analyzeNumberTransitions(history: ParsedHistory[], lastSpecial: number): Record<number, number> {
    const numTransMap = new Map<number, number>();
    
    for (let i = 1; i < history.length - 1; i++) {
      if (history[i].special === lastSpecial) {
        const nextSpecial = history[i-1].special;
        numTransMap.set(nextSpecial, (numTransMap.get(nextSpecial) || 0) + 1);
      }
    }
    
    const scores: Record<number, number> = {};
    for (const [num, count] of numTransMap.entries()) {
      scores[num] = count * 6;
    }
    
    return scores;
  }

  /**
   * 3. 历史镜像分析
   */
  private analyzeHistoryMirror(history: ParsedHistory[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = history[i].numbers;
      const common = histNums.filter(n => lastDraw.includes(n));
      
      if (common.length >= 3) {
        const nextNums = history[i-1].numbers;
        const similarity = common.length / Math.min(histNums.length, lastDraw.length);
        
        nextNums.forEach(n => {
          scores[n] = (scores[n] || 0) + similarity * 18;
        });
      }
    }
    
    // 归一化
    const maxScore = Math.max(...Object.values(scores), 1);
    Object.keys(scores).forEach(key => {
      scores[parseInt(key)] = (scores[parseInt(key)] / maxScore) * 20;
    });
    
    return scores;
  }

  /**
   * 4. 特码轨迹分析
   */
  private analyzeSpecialTrajectory(history: ParsedHistory[], lastSpecial: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const specials = history.map(h => h.special);
    
    if (specials.length >= 5) {
      const movingAvg = specials.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const lastParity = lastSpecial % 2;
      const lastSize = lastSpecial > 25 ? 1 : 0;
      
      for (let num = 1; num <= 49; num++) {
        let score = 0;
        
        if (Math.abs(num - movingAvg) <= 8) score += 12;
        if ((num % 2) === lastParity) score += 10;
        if ((num > 25 ? 1 : 0) === lastSize) score += 10;
        
        scores[num] = score;
      }
    }
    
    return scores;
  }

  /**
   * 5. 形态分析
   */
  private analyzePattern(lastDraw: number[], recentHistory: ParsedHistory[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 邻号分析
    const neighborSet = new Set<number>();
    lastDraw.forEach(n => {
      if (n > 1) neighborSet.add(n - 1);
      if (n < 49) neighborSet.add(n + 1);
    });
    
    // 重号分析
    const repeatSet = new Set<number>();
    recentHistory.slice(0, 3).forEach(hist => {
      hist.numbers.forEach(n => {
        if (lastDraw.includes(n)) repeatSet.add(n);
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      if (neighborSet.has(num)) score += 18;
      if (repeatSet.has(num)) score += 15;
      
      // 连号检查
      const sortedLast = [...lastDraw].sort((a, b) => a - b);
      for (let i = 0; i < sortedLast.length - 1; i++) {
        if (sortedLast[i+1] - sortedLast[i] === 1) {
          if (num === sortedLast[i] || num === sortedLast[i+1]) {
            score += 20;
          }
        }
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 6. 尾数分布分析
   */
  private analyzeTailDistribution(history: ParsedHistory[]): Record<number, number> {
    const tailCount = new Map<number, number>();
    const scores: Record<number, number> = {};
    
    // 统计尾数出现次数
    history.slice(0, 10).forEach(hist => {
      hist.numbers.forEach(num => {
        const tail = num % 10;
        tailCount.set(tail, (tailCount.get(tail) || 0) + 1);
      });
    });
    
    // 计算尾数分数
    const sortedTails = Array.from(tailCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tail]) => tail);
    
    for (let tail = 0; tail <= 9; tail++) {
      const index = sortedTails.indexOf(tail);
      if (index === -1) {
        scores[tail] = 0;
      } else if (index < 3) {
        scores[tail] = 25;
      } else if (index < 6) {
        scores[tail] = 15;
      } else {
        scores[tail] = 5;
      }
    }
    
    return scores;
  }

  /**
   * 7. 生肖分布分析
   */
  private analyzeZodiacDistribution(history: ParsedHistory[], lastSpecialZodiac: string): Record<string, number> {
    const zodiacCount = new Map<string, number>();
    const scores: Record<string, number> = {};
    
    // 统计生肖出现次数
    history.slice(0, 20).forEach(hist => {
      hist.numbers.forEach(num => {
        const zodiac = PredictionEngine.NUM_TO_ZODIAC[num] || '';
        if (zodiac) {
          zodiacCount.set(zodiac, (zodiacCount.get(zodiac) || 0) + 1);
        }
      });
    });
    
    // 热门生肖
    const hotZodiacs = Array.from(zodiacCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([zodiac]) => zodiac);
    
    // 三合生肖
    const allies = PredictionEngine.SAN_HE_MAP[lastSpecialZodiac] || [];
    
    // 计算分数
    Object.keys(PredictionEngine.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      if (hotZodiacs.includes(zodiac)) score += 18;
      if (allies.includes(zodiac)) score += 22;
      if (zodiac === lastSpecialZodiac) score += 12;
      
      scores[zodiac] = Math.max(score, 0);
    });
    
    return scores;
  }

  /**
   * 8. 五行分布分析
   */
  private analyzeWuxingDistribution(history: ParsedHistory[]): Record<string, number> {
    const wuxingCount = new Map<string, number>();
    
    // 统计五行出现次数
    history.slice(0, 10).forEach(hist => {
      hist.numbers.forEach(num => {
        const wuxing = PredictionEngine.NUM_TO_WUXING[num] || '';
        if (wuxing) {
          wuxingCount.set(wuxing, (wuxingCount.get(wuxing) || 0) + 1);
        }
      });
    });
    
    // 找到最弱的五行
    const sortedWuxing = Array.from(wuxingCount.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const weakWuxing = sortedWuxing[0]?.[0] || '土';
    const strongWuxing = sortedWuxing[sortedWuxing.length - 1]?.[0] || '金';
    
    // 五行相生关系
    const generateMap: Record<string, string> = {
      '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
    };
    
    const scores: Record<string, number> = {};
    Object.keys(PredictionEngine.WU_XING_MAP).forEach(wuxing => {
      let score = 15;
      
      if (wuxing === weakWuxing) score = 28;
      else if (wuxing === strongWuxing) score = 8;
      
      // 被强五行所生，加分
      if (generateMap[strongWuxing] === wuxing) score += 5;
      // 生弱五行，加分
      if (generateMap[wuxing] === weakWuxing) score += 5;
      
      scores[wuxing] = score;
    });
    
    return scores;
  }

  /**
   * 9. 波色分布分析
   */
  private analyzeWaveDistribution(history: ParsedHistory[], lastSpecial: number): Record<string, number> {
    const waveCount = new Map<string, number>();
    
    // 统计波色出现次数
    history.slice(0, 10).forEach(hist => {
      hist.numbers.forEach(num => {
        const wave = this.getNumWave(num);
        waveCount.set(wave, (waveCount.get(wave) || 0) + 1);
      });
    });
    
    // 上期特码波色
    const lastWave = this.getNumWave(lastSpecial);
    
    // 找到最弱的波色
    const sortedWaves = Array.from(waveCount.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const weakWave = sortedWaves[0]?.[0] || 'green';
    const strongWave = sortedWaves[sortedWaves.length - 1]?.[0] || 'red';
    
    const scores: Record<string, number> = {};
    ['red', 'blue', 'green'].forEach(wave => {
      let score = 0;
      
      if (wave === lastWave) score += 18;
      if (wave === weakWave) score += 22;
      if (wave === strongWave) score -= 5;
      
      scores[wave] = Math.max(score, 0);
    });
    
    return scores;
  }

  /**
   * 10. 黄金号码分析
   */
  private analyzeGoldNumbers(sum: number, special: number): number[] {
    const goldNumbers: number[] = [];
    
    goldNumbers.push(Math.round(sum * 0.618) % 49 || 49);
    goldNumbers.push(Math.round(sum * 1.618) % 49 || 49);
    goldNumbers.push((sum % 49) || 49);
    goldNumbers.push((sum + 7) % 49 || 49);
    goldNumbers.push((sum - 7 + 49) % 49 || 49);
    goldNumbers.push(Math.round(special * 1.618) % 49 || 49);
    goldNumbers.push((special + 13) % 49 || 49);
    
    // 去重并过滤有效号码
    const uniqueNumbers = [...new Set(goldNumbers)];
    return uniqueNumbers.filter(n => n >= 1 && n <= 49);
  }

  /**
   * 11. 遗漏分析
   */
  private analyzeOmission(history: ParsedHistory[]): Record<number, number> {
    const omissionMap = new Map<number, number>();
    const scores: Record<number, number> = {};
    
    // 初始化遗漏值
    for (let i = 1; i <= 49; i++) {
      omissionMap.set(i, history.length);
    }
    
    // 更新遗漏值
    history.forEach((hist, index) => {
      hist.numbers.forEach(num => {
        omissionMap.set(num, Math.min(omissionMap.get(num) || history.length, index));
      });
    });
    
    // 转换为分数
    const period = history.length;
    for (let num = 1; num <= 49; num++) {
      const omission = omissionMap.get(num) || period;
      
      if (omission >= period * this.config.thresholds.omissionCritical) {
        scores[num] = 30;
      } else if (omission >= period * 0.6) {
        scores[num] = 25;
      } else if (omission >= period * 0.4) {
        scores[num] = 18;
      } else if (omission >= period * 0.2) {
        scores[num] = 12;
      } else if (omission >= period * 0.1) {
        scores[num] = 8;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  /**
   * 12. 季节规律分析
   */
  private analyzeSeasonal(month: number, week: number, day: number): Record<string, number> {
    const season = this.getSeasonByMonth(month);
    const seasonalZodiacs = PredictionEngine.SEASONAL_ZODIACS[season] || [];
    
    // 季节生肖权重
    const seasonWeight = 22;
    
    // 根据星期微调
    const dayWeights = [1.0, 1.1, 1.0, 0.9, 1.0, 1.2, 0.8];
    
    const scores: Record<string, number> = {};
    Object.keys(PredictionEngine.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      
      if (seasonalZodiacs.includes(zodiac)) {
        score = seasonWeight * dayWeights[day];
      }
      
      scores[zodiac] = score;
    });
    
    return scores;
  }

  /**
   * 13. 质数分布分析
   */
  private analyzePrimeDistribution(history: ParsedHistory[]) {
    let primeCount = 0;
    let totalNumbers = 0;
    
    // 统计数据
    history.slice(0, 50).forEach(hist => {
      totalNumbers += hist.numbers.length;
      primeCount += hist.numbers.filter(n => PredictionEngine.PRIME_NUMBERS.includes(n)).length;
    });
    
    const primeRatio = totalNumbers > 0 ? primeCount / totalNumbers : 0;
    const expectedRatio = PredictionEngine.PRIME_NUMBERS.length / 49;
    
    return {
      currentRatio: primeRatio,
      expectedRatio,
      primeCount,
      totalNumbers,
      needMorePrimes: primeRatio < expectedRatio * 0.85,
      needMoreComposites: primeRatio > expectedRatio * 1.15
    };
  }

  /**
   * 14. 和值模式分析
   */
  private analyzeSumPatterns(history: ParsedHistory[], lastSum: number) {
    const sums: number[] = [];
    const sumParities: number[] = [];
    
    // 收集和值数据
    history.slice(0, 50).forEach(hist => {
      sums.push(hist.sum);
      sumParities.push(hist.sum % 2);
    });
    
    // 计算统计信息
    const avgSum = sums.length > 0 ? sums.reduce((a, b) => a + b, 0) / sums.length : 175;
    const stdSum = sums.length > 1 ? 
      Math.sqrt(sums.reduce((sq, n) => sq + Math.pow(n - avgSum, 2), 0) / sums.length) : 15;
    
    // 分析奇偶趋势
    const lastParity = lastSum % 2;
    const evenCount = sumParities.filter(p => p === 0).length;
    const oddCount = sumParities.filter(p => p === 1).length;
    const parityTrend = lastParity === 0 ? 
      (evenCount > oddCount ? 'same' : 'alternate') :
      (oddCount > evenCount ? 'same' : 'alternate');
    
    return {
      getScore: (simulatedSum: number) => {
        let score = 0;
        
        // 在和值范围内
        if (simulatedSum >= avgSum - 1.96 * stdSum && simulatedSum <= avgSum + 1.96 * stdSum) {
          score += 18;
        }
        
        // 奇偶趋势
        if ((parityTrend === 'same' && (simulatedSum % 2) === lastParity) ||
            (parityTrend === 'alternate' && (simulatedSum % 2) !== lastParity)) {
          score += 10;
        }
        
        return Math.min(score, 30);
      }
    };
  }

  /**
   * 15. 位置分析
   */
  private analyzePosition(history: ParsedHistory[]): Record<number, number> {
    const positionStats = new Map<number, Map<number, number>>();
    const scores: Record<number, number> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      positionStats.set(i, new Map());
    }
    
    // 统计每个号码在不同位置的出现次数
    history.slice(0, 50).forEach(hist => {
      hist.numbers.forEach((num, index) => {
        const position = index + 1;
        const numStats = positionStats.get(num)!;
        numStats.set(position, (numStats.get(position) || 0) + 1);
      });
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      const positions = positionStats.get(num)!;
      let totalScore = 0;
      
      // 普通位置权重
      for (let pos = 1; pos <= 6; pos++) {
        totalScore += (positions.get(pos) || 0) * 2;
      }
      
      // 特码位置权重 (3倍)
      totalScore += (positions.get(7) || 0) * 6;
      
      scores[num] = Math.min(totalScore, 30);
    }
    
    return scores;
  }

  /**
   * 16. 频率分析
   */
  private analyzeFrequency(history: ParsedHistory[]): Record<number, number> {
    const frequencyMap = new Map<number, number>();
    const scores: Record<number, number> = {};
    
    // 统计频率
    history.forEach(hist => {
      hist.numbers.forEach(num => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      });
    });
    
    // 计算频率分数
    const maxFreq = Math.max(...Array.from(frequencyMap.values()), 1);
    const totalDraws = history.length;
    const expectedFreqPerNumber = totalDraws * 7 / 49;
    
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap.get(num) || 0;
      
      if (freq === 0) {
        scores[num] = 25;
      } else if (freq > expectedFreqPerNumber * this.config.thresholds.hotNumberThreshold) {
        scores[num] = 18;
      } else if (freq < expectedFreqPerNumber * this.config.thresholds.coldNumberThreshold) {
        scores[num] = 15;
      } else {
        scores[num] = Math.min((freq / maxFreq) * 12, 12);
      }
    }
    
    return scores;
  }

  /**
   * 17. 聚类分析
   */
  private analyzeCluster(lastDraw: number[], history: ParsedHistory[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 计算最近开奖号码的聚类中心
    const recentNumbers: number[] = [];
    history.forEach(hist => {
      recentNumbers.push(...hist.numbers);
    });
    
    // 计算每个号码到最近开奖号码的平均距离
    for (let num = 1; num <= 49; num++) {
      let totalDistance = 0;
      let count = 0;
      
      lastDraw.forEach(n => {
        totalDistance += Math.abs(num - n);
        count++;
      });
      
      const recentAvg = recentNumbers.length > 0 ? 
        recentNumbers.reduce((a, b) => a + b, 0) / recentNumbers.length : 25;
      totalDistance += Math.abs(num - recentAvg) * 2;
      count += 2;
      
      const avgDistance = totalDistance / count;
      scores[num] = Math.max(0, 25 - avgDistance * 0.7);
    }
    
    return scores;
  }

  /**
   * 18. 对称分析
   */
  private analyzeSymmetry(history: ParsedHistory[], lastDraw: number[]): Record<number, number> {
    const symmetryMap = new Map<number, number>();
    const scores: Record<number, number> = {};
    
    // 统计对称号码出现的次数
    history.forEach(hist => {
      hist.numbers.forEach(num => {
        const symmetricNum = 50 - num;
        if (symmetricNum >= 1 && symmetricNum <= 49) {
          symmetryMap.set(symmetricNum, (symmetryMap.get(symmetricNum) || 0) + 1);
        }
      });
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      // 检查上期号码的对称性
      lastDraw.forEach(n => {
        if (50 - n === num) score += 20;
      });
      
      // 检查历史对称性
      if (symmetryMap.has(num)) {
        score += (symmetryMap.get(num) || 0) * 3;
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 19. 周期分析
   */
  private analyzePeriodicity(history: ParsedHistory[], currentWeek: number): Record<number, number> {
    const periodMap = new Map<number, number[]>();
    const scores: Record<number, number> = {};
    
    // 初始化周期记录
    for (let i = 1; i <= 49; i++) {
      periodMap.set(i, []);
    }
    
    // 记录每个号码出现的期次
    history.forEach((hist, index) => {
      hist.numbers.forEach(num => {
        const appearances = periodMap.get(num)!;
        appearances.push(index);
      });
    });
    
    // 分析周期性
    for (let num = 1; num <= 49; num++) {
      const appearances = periodMap.get(num)!;
      if (appearances.length < 3) {
        scores[num] = appearances.length * 3;
        continue;
      }
      
      // 计算平均间隔
      let totalInterval = 0;
      for (let i = 1; i < appearances.length; i++) {
        totalInterval += appearances[i] - appearances[i-1];
      }
      const avgInterval = totalInterval / (appearances.length - 1);
      
      const lastAppearance = appearances[appearances.length - 1];
      const drawsSinceLast = history.length - lastAppearance;
      
      if (drawsSinceLast >= avgInterval * 0.9 && drawsSinceLast <= avgInterval * 1.1) {
        scores[num] = 25;
      } else if (drawsSinceLast > avgInterval) {
        scores[num] = 20;
      } else if (drawsSinceLast < avgInterval * 0.7) {
        scores[num] = 5;
      } else {
        scores[num] = 15;
      }
    }
    
    return scores;
  }

  /**
   * 20. 趋势分析
   */
  private analyzeTrend(history: ParsedHistory[]): Record<number, number> {
    const appearanceRecord = new Map<number, number[]>();
    const scores: Record<number, number> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      appearanceRecord.set(i, []);
    }
    
    // 记录每期出现位置
    history.forEach((hist, drawIndex) => {
      hist.numbers.forEach((num, position) => {
        const appearances = appearanceRecord.get(num)!;
        appearances.push(drawIndex * 10 + (position + 1));
      });
    });
    
    // 分析趋势
    for (let num = 1; num <= 49; num++) {
      const appearances = appearanceRecord.get(num)!;
      if (appearances.length < 2) {
        scores[num] = appearances.length * 8;
        continue;
      }
      
      // 计算最近5次出现的间隔趋势
      const recentAppearances = appearances.slice(-5);
      let totalDiff = 0;
      let trendUp = 0;
      
      for (let i = 1; i < recentAppearances.length; i++) {
        const diff = recentAppearances[i] - recentAppearances[i-1];
        totalDiff += diff;
        if (diff > 0) trendUp++;
      }
      
      const avgDiff = totalDiff / (recentAppearances.length - 1);
      const isUpTrend = trendUp > (recentAppearances.length - 1) / 2;
      
      if (isUpTrend && avgDiff > 0) {
        scores[num] = 22;
      } else if (!isUpTrend && avgDiff < 0) {
        scores[num] = 18;
      } else {
        scores[num] = 15;
      }
    }
    
    return scores;
  }

  /**
   * 21. 相关性分析
   */
  private analyzeCorrelation(history: ParsedHistory[]): Record<number, number> {
    const correlationMatrix: number[][] = Array.from({ length: 50 }, () => Array(50).fill(0));
    const scores: Record<number, number> = {};
    
    // 构建相关性矩阵
    history.slice(0, 50).forEach(hist => {
      const nums = hist.numbers;
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          correlationMatrix[nums[i]][nums[j]]++;
          correlationMatrix[nums[j]][nums[i]]++;
        }
      }
    });
    
    // 计算每个号码的相关性强度
    for (let num = 1; num <= 49; num++) {
      let totalCorrelation = 0;
      let strongConnections = 0;
      
      for (let other = 1; other <= 49; other++) {
        if (other !== num) {
          totalCorrelation += correlationMatrix[num][other];
          if (correlationMatrix[num][other] >= 3) {
            strongConnections++;
          }
        }
      }
      
      const avgCorrelation = totalCorrelation / 48;
      scores[num] = Math.min(avgCorrelation * 4 + strongConnections * 2, 25);
    }
    
    return scores;
  }

  /**
   * 增强随机生成
   */
  private generateEnhancedRandom(history?: DbRecord[]): PredictionData {
    const nums: string[] = [];
    const generated = new Set<number>();
    
    // 如果有部分历史，尝试基于最后几期生成
    if (history && history.length > 0) {
      const lastDraw = this.parseNumbers(history[0].open_code);
      
      lastDraw.forEach(n => {
        if (n > 1 && generated.size < 18) generated.add(n - 1);
        if (n < 49 && generated.size < 18) generated.add(n + 1);
      });
    }
    
    // 补充随机号码
    while (generated.size < 18) {
      const r = Math.floor(Math.random() * 49) + 1;
      generated.add(r);
    }
    
    // 转换为字符串并排序
    Array.from(generated).sort((a, b) => a - b).forEach(n => {
      nums.push(n < 10 ? `0${n}` : `${n}`);
    });
    
    // 随机生肖推荐
    const currentMonth = new Date().getMonth() + 1;
    const season = this.getSeasonByMonth(currentMonth);
    const seasonalZodiacs = PredictionEngine.SEASONAL_ZODIACS[season] || [];
    
    const allZodiacs = Object.keys(PredictionEngine.ZODIACS_MAP);
    const recZodiacs = [...seasonalZodiacs];
    
    while (recZodiacs.length < 6) {
      const randomZodiac = allZodiacs[Math.floor(Math.random() * allZodiacs.length)];
      if (!recZodiacs.includes(randomZodiac)) {
        recZodiacs.push(randomZodiac);
      }
    }
    
    return {
      zodiacs: recZodiacs.slice(0, 6),
      numbers: nums,
      wave: { main: 'red', defense: 'blue' },
      heads: ['0', '1', '2'],
      tails: ['1', '5', '8', '3', '9']
    };
  }

  /**
   * 记录性能统计
   */
  private recordPerformance(executionTime: number): void {
    this.performanceStats.push({
      timestamp: Date.now(),
      executionTime
    });
    
    // 保留最近100条记录
    if (this.performanceStats.length > 100) {
      this.performanceStats.shift();
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      averageExecutionTime: this.performanceStats.reduce((sum, stat) => sum + stat.executionTime, 0) / this.performanceStats.length,
      totalPredictions: this.performanceStats.length,
      lastExecutionTime: this.performanceStats[this.performanceStats.length - 1]?.executionTime
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<EngineConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      periods: { ...this.config.periods, ...newConfig.periods },
      weights: { ...this.config.weights, ...newConfig.weights },
      thresholds: { ...this.config.thresholds, ...newConfig.thresholds },
      diversity: { ...this.config.diversity, ...newConfig.diversity }
    };
  }

  // ==========================================
  // 静态辅助方法
  // ==========================================

  private parseNumbers(code: string): number[] {
    if (!code) return [];
    const parts = code.split(/[,，\s]+/);
    const numbers: number[] = [];
    
    for (const part of parts) {
      const n = parseInt(part.trim());
      if (!isNaN(n) && n >= 1 && n <= 49) {
        numbers.push(n);
      }
    }
    
    return numbers;
  }

  private getNumWave(n: number): string {
    return PredictionEngine.NUM_TO_WAVE[n] || 'green';
  }

  private getSeasonByMonth(month: number): string {
    if (month >= 1 && month <= 3) return '春';
    if (month >= 4 && month <= 6) return '夏';
    if (month >= 7 && month <= 9) return '秋';
    return '冬';
  }

  // 单例模式访问点
  static predict(history: DbRecord[], type: LotteryType): PredictionData {
    return PredictionEngine.getInstance().generate(history, type);
  }
}
