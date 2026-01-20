import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  parity: string;
  size: string;
  prime: boolean;
  cluster: number;
  
  scoreHistoryMirror: number;
  scoreZodiacTrans: number;
  scoreNumberTrans: number;
  scoreSpecialTraj: number;
  scorePattern: number;
  scoreTail: number;
  scoreZodiac: number;
  scoreWuXing: number;
  scoreWave: number;
  scoreGold: number;
  scoreOmission: number;
  scoreSeasonal: number;
  scorePrime: number;
  scoreSumAnalysis: number;
  scorePosition: number;
  scoreFrequency: number;
  scoreCluster: number;
  scoreSymmetry: number;
  scorePeriodic: number;
  scoreTrend: number;
  scoreHeadAnalysis: number;
  scoreTailPattern: number;
  scoreCorrelation: number;
  scoreProperty: number;
  scoreTimePattern: number;
  scoreSeriesPattern: number;
  scoreSumZone: number;
  scoreElementRelation: number;
  scoreMatrixCoordinate: number;
  scoreLatticeDistribution: number;
  scoreChaosPattern: number;
  scoreFractalDimension: number;
  scoreEntropyAnalysis: number;
  scoreDeterministicCore: number;
  
  totalScore: number;
}

interface BacktestResult {
  accuracy: number;
  details: {
    totalPredictions: number;
    totalHits: number;
    zodiacAccuracy: number;
    waveAccuracy: number;
    headAccuracy: number;
    tailAccuracy: number;
    top5Accuracy: number;
    top10Accuracy: number;
    algorithmPerformance: Record<string, { hits: number, uses: number }>;
  };
}

interface PerformanceReport {
  timestamp: string;
  period: string;
  hitRates: {
    special: number;
    zodiac: number;
    wave: number;
    head: number;
    tail: number;
    top5: number;
    top10: number;
  };
  algorithmRanking: Array<{
    name: string;
    efficiency: number;
    uses: number;
    adaptiveFactor: number;
  }>;
  weightDistribution: Array<{
    algorithm: string;
    weight: number;
  }>;
  recommendations: string[];
}

interface WeightChromosome {
  weights: Record<string, number>;
  fitness?: number;
}

interface AlgorithmPerformance {
  totalUses: number;
  totalHits: number;
  recentHits: number[];
  lastUpdate: number;
  efficiency: number;
  weight: number;
  adaptiveFactor: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v15.0
 * 新增：自动回测系统 + 自适应权重优化
 * 新增：算法有效性评估 + 动态权重调整
 */
export class PredictionEngine {
  // ==========================================
  // 权重配置系统 - 可动态调整
  // ==========================================
  static WEIGHT_CONFIG = {
    scoreZodiacTrans: 2.5,
    scoreNumberTrans: 2.0,
    scoreHistoryMirror: 1.5,
    scoreSpecialTraj: 1.3,
    scorePattern: 1.2,
    scoreTail: 1.0,
    scoreZodiac: 1.0,
    scoreWuXing: 0.9,
    scoreWave: 0.9,
    scoreGold: 0.8,
    scoreOmission: 0.8,
    scoreSeasonal: 0.7,
    scorePrime: 0.7,
    scoreSumAnalysis: 0.6,
    scorePosition: 0.6,
    scoreFrequency: 0.6,
    scoreCluster: 0.5,
    scoreSymmetry: 0.5,
    scorePeriodic: 0.5,
    scoreTrend: 0.5,
    scoreHeadAnalysis: 0.8,
    scoreTailPattern: 0.8,
    scoreCorrelation: 0.7,
    scoreProperty: 0.7,
    scoreTimePattern: 0.6,
    scoreSeriesPattern: 0.6,
    scoreSumZone: 0.5,
    scoreElementRelation: 0.5,
    scoreMatrixCoordinate: 0.4,
    scoreLatticeDistribution: 0.4,
    scoreChaosPattern: 0.4,
    scoreFractalDimension: 0.4,
    scoreEntropyAnalysis: 0.4,
    scoreDeterministicCore: 0.6,
    
    punishmentLastSpecial: 0.3,
    punishmentSameZodiac: 0.85,
    punishmentRecentNumbers: 0.9,
    punishmentHotZodiac: 0.8,
    
    maxZodiacPerGroup: 2,
    maxWavePerGroup: 7,
    
    targetNumbersCount: 18,
    targetZodiacsCount: 6,
    targetTailsCount: 4,
    targetHeadsCount: 3,
  };

  // ==========================================
  // 算法有效性追踪器
  // ==========================================
  static ALGORITHM_PERFORMANCE: Record<string, AlgorithmPerformance> = {};

  // ==========================================
  // 历史准确率记录
  // ==========================================
  static PERFORMANCE_HISTORY: {
    date: string;
    specialHit: boolean;
    zodiacHit: boolean;
    waveHit: boolean;
    headHit: boolean;
    tailHit: boolean;
    top5Hit: boolean;
    top10Hit: boolean;
    algorithmContributions: Record<string, number>;
  }[] = [];

  // ==========================================
  // 基础数据映射
  // ==========================================
  static ZODIACS_MAP: Record<string, number[]> = {
    '蛇': [1, 13, 25, 37, 49], '马': [12, 24, 36, 48], '羊': [11, 23, 35, 47],
    '猴': [10, 22, 34, 46], '鸡': [9, 21, 33, 45], '狗': [8, 20, 32, 44],
    '猪': [7, 19, 31, 43], '鼠': [6, 18, 30, 42], '牛': [5, 17, 29, 41],
    '虎': [4, 16, 28, 40], '兔': [3, 15, 27, 39], '龙': [2, 14, 26, 38],
  };

  static SAN_HE_MAP: Record<string, string[]> = {
    '鼠': ['龙', '猴'], '龙': ['鼠', '猴'], '猴': ['鼠', '龙'],
    '牛': ['蛇', '鸡'], '蛇': ['牛', '鸡'], '鸡': ['牛', '蛇'],
    '虎': ['马', '狗'], '马': ['虎', '狗'], '狗': ['虎', '马'],
    '兔': ['猪', '羊'], '猪': ['兔', '羊'], '羊': ['兔', '猪']
  };
  
  static WU_XING_CYCLE: Record<string, {sheng: string, ke: string, sheng_by: string, ke_by: string}> = {
    '金': {sheng: '水', ke: '木', sheng_by: '土', ke_by: '火'},
    '木': {sheng: '火', ke: '土', sheng_by: '水', ke_by: '金'},
    '水': {sheng: '木', ke: '火', sheng_by: '金', ke_by: '土'},
    '火': {sheng: '土', ke: '金', sheng_by: '木', ke_by: '水'},
    '土': {sheng: '金', ke: '水', sheng_by: '火', ke_by: '木'}
  };

  static WU_XING_MAP: Record<string, number[]> = {
    '金': [1, 2, 9, 10, 23, 24, 31, 32, 37, 38],
    '木': [3, 4, 11, 12, 19, 20, 33, 34, 41, 42, 49],
    '水': [5, 6, 13, 14, 21, 22, 35, 36, 43, 44],
    '火': [7, 8, 15, 16, 29, 30, 39, 40, 47, 48],
    '土': [17, 18, 25, 26, 27, 28, 45, 46]
  };

  static WAVES_MAP = {
    'red': [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
    'blue': [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
    'green': [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
  };

  static SEASONAL_ZODIACS: Record<string, string[]> = {
    '春': ['虎', '兔', '龙'],
    '夏': ['蛇', '马', '羊'],
    '秋': ['猴', '鸡', '狗'],
    '冬': ['猪', '鼠', '牛']
  };

  static PRIME_NUMBERS: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  
  static SYMMETRY_PAIRS: [number, number][] = [
    [1, 49], [2, 48], [3, 47], [4, 46], [5, 45], [6, 44], [7, 43],
    [8, 42], [9, 41], [10, 40], [11, 39], [12, 38], [13, 37], [14, 36],
    [15, 35], [16, 34], [17, 33], [18, 32], [19, 31], [20, 30], [21, 29],
    [22, 28], [23, 27], [24, 26]
  ];

  static MATRIX_COORDINATES: Record<number, {row: number, col: number}> = {};
  
  static CLUSTER_GROUPS: Record<number, number[]> = {
    1: [1, 2, 3, 4, 5, 6, 7],
    2: [8, 9, 10, 11, 12, 13, 14],
    3: [15, 16, 17, 18, 19, 20, 21],
    4: [22, 23, 24, 25, 26, 27, 28],
    5: [29, 30, 31, 32, 33, 34, 35],
    6: [36, 37, 38, 39, 40, 41, 42],
    7: [43, 44, 45, 46, 47, 48, 49]
  };

  static LATTICE_PATTERNS = {
    fibonacci: [1, 2, 3, 5, 8, 13, 21, 34],
    goldenRatio: [8, 13, 21, 34],
    arithmetic: [5, 10, 15, 20, 25, 30, 35, 40, 45],
    geometric: [2, 4, 8, 16, 32]
  };

  static FRACTAL_PATTERNS = {
    mandelbrot: [3, 7, 11, 19, 23, 31, 39, 43],
    julia: [2, 5, 10, 17, 26, 37],
    sierpinski: [1, 3, 9, 27]
  };

  static DETERMINISTIC_PATTERNS = {
    primeSpiral: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
    ulamSpiral: [1, 7, 19, 37, 13, 31, 49, 21, 43],
    magicSquare: [15, 25, 35, 45, 5, 10, 20, 30, 40]
  };

  static HEAD_MAP: Record<number, number[]> = {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    2: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    3: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    4: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
  };

  static TAIL_GROUPS: Record<string, number[]> = {
    '小': [0, 1, 2, 3, 4],
    '大': [5, 6, 7, 8, 9],
    '质': [2, 3, 5, 7],
    '合': [0, 1, 4, 6, 8, 9]
  };

  static SUM_ZONES = {
    small: { min: 120, max: 175 },
    medium: { min: 176, max: 210 },
    large: { min: 211, max: 285 }
  };

  static PERIODIC_CYCLES = {
    zodiac: 12,
    wave: 7,
    wuxing: 5,
    tail: 10,
    head: 8,
    cluster: 7,
    matrix: 49
  };

  static TIME_PATTERNS = {
    weekday: {
      0: { zodiacs: ['兔', '鸡', '马'], tails: [3, 6, 9], clusters: [1, 4, 7] },
      1: { zodiacs: ['龙', '狗', '牛'], tails: [1, 4, 7], clusters: [2, 5] },
      2: { zodiacs: ['蛇', '猪', '虎'], tails: [2, 5, 8], clusters: [3, 6] },
      3: { zodiacs: ['马', '鼠', '兔'], tails: [0, 3, 6], clusters: [1, 4] },
      4: { zodiacs: ['羊', '牛', '龙'], tails: [1, 4, 7], clusters: [2, 5] },
      5: { zodiacs: ['猴', '虎', '蛇'], tails: [2, 5, 8], clusters: [3, 6] },
      6: { zodiacs: ['鸡', '兔', '马'], tails: [0, 3, 9], clusters: [1, 7] }
    },
    monthPeriod: {
      early: { heads: [0, 1], waves: ['red', 'blue'], clusters: [1, 2, 3] },
      middle: { heads: [2, 3], waves: ['blue', 'green'], clusters: [4, 5, 6] },
      late: { heads: [3, 4], waves: ['green', 'red'], clusters: [5, 6, 7] }
    }
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};
  static NUM_TO_HEAD: Record<number, number> = {};
  static NUM_TO_SIZE: Record<number, string> = {};
  static NUM_TO_PARITY: Record<number, string> = {};
  static NUM_TO_PRIME: Record<number, boolean> = {};
  static NUM_TO_CLUSTER: Record<number, number> = {};
  static NUM_TO_MATRIX: Record<number, {row: number, col: number}> = {};

  // ==========================================
  // 核心预测方法
  // ==========================================
  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    this.initializeMaps();
    this.initializeAlgorithmPerformance();
    
    if (!history || history.length < 50) return this.generateDeterministic();

    // 运行自动回测和权重优化
    if (this.PERFORMANCE_HISTORY.length < 100) {
      this.runAutoBacktest(history.slice(0, Math.min(200, history.length)));
    }

    // 应用优化后的权重
    this.applyOptimizedWeights();

    // 数据预处理
    const fullHistory = history;
    const recent50 = history.slice(0, 50);
    const recent30 = history.slice(0, 30);
    const recent20 = history.slice(0, 20);
    const recent10 = history.slice(0, 10);
    
    const lastDrawNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial];
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    const lastDrawTail = lastSpecial % 10;
    const lastDrawHead = Math.floor(lastSpecial / 10);
    const lastSpecialSize = this.NUM_TO_SIZE[lastSpecial];
    const lastSpecialParity = this.NUM_TO_PARITY[lastSpecial];
    const lastSpecialPrime = this.NUM_TO_PRIME[lastSpecial];
    const lastSpecialCluster = this.NUM_TO_CLUSTER[lastSpecial];
    const lastMatrix = this.NUM_TO_MATRIX[lastSpecial];
    
    const currentDate = history[0].draw_time ? new Date(history[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    const currentDay = currentDate.getDate();
    const currentWeekday = currentDate.getDay();
    
    let currentMonthPeriod: 'early' | 'middle' | 'late' = 'early';
    if (currentDay <= 10) currentMonthPeriod = 'early';
    else if (currentDay <= 20) currentMonthPeriod = 'middle';
    else currentMonthPeriod = 'late';

    // 初始化状态池
    const stats: NumberStat[] = Array.from({ length: 49 }, (_, i) => {
      const num = i + 1;
      const isPrime = this.NUM_TO_PRIME[num];
      const cluster = this.NUM_TO_CLUSTER[num];
      
      return {
        num,
        zodiac: this.NUM_TO_ZODIAC[num],
        wave: this.getNumWave(num),
        wuxing: this.NUM_TO_WUXING[num],
        tail: num % 10,
        head: Math.floor(num / 10),
        parity: this.NUM_TO_PARITY[num],
        size: this.NUM_TO_SIZE[num],
        prime: isPrime,
        cluster,
        
        scoreHistoryMirror: 0,
        scoreZodiacTrans: 0,
        scoreNumberTrans: 0,
        scoreSpecialTraj: 0,
        scorePattern: 0,
        scoreTail: 0,
        scoreZodiac: 0,
        scoreWuXing: 0,
        scoreWave: 0,
        scoreGold: 0,
        scoreOmission: 0,
        scoreSeasonal: 0,
        scorePrime: 0,
        scoreSumAnalysis: 0,
        scorePosition: 0,
        scoreFrequency: 0,
        scoreCluster: 0,
        scoreSymmetry: 0,
        scorePeriodic: 0,
        scoreTrend: 0,
        scoreHeadAnalysis: 0,
        scoreTailPattern: 0,
        scoreCorrelation: 0,
        scoreProperty: 0,
        scoreTimePattern: 0,
        scoreSeriesPattern: 0,
        scoreSumZone: 0,
        scoreElementRelation: 0,
        scoreMatrixCoordinate: 0,
        scoreLatticeDistribution: 0,
        scoreChaosPattern: 0,
        scoreFractalDimension: 0,
        scoreEntropyAnalysis: 0,
        scoreDeterministicCore: 0,
        
        totalScore: 0
      };
    });

    // 记录算法贡献度
    const algorithmContributions: Record<string, number> = {};

    // ==========================================
    // 执行所有算法分析
    // ==========================================
    
    // 1. 生肖转移概率
    const zodiacTransScores = this.calculateZodiacTransScores(fullHistory, lastSpecialZodiac);
    stats.forEach(s => {
      s.scoreZodiacTrans = zodiacTransScores[s.zodiac] || 0;
    });
    algorithmContributions.zodiacTrans = this.calculateAlgorithmEffectiveness(zodiacTransScores, lastSpecial);

    // 2. 特码转移概率
    const numTransScores = this.calculateNumberTransScores(fullHistory, lastSpecial);
    stats.forEach(s => {
      s.scoreNumberTrans = numTransScores[s.num] || 0;
    });
    algorithmContributions.numberTrans = this.calculateAlgorithmEffectiveness(numTransScores, lastSpecial);

    // 3. 历史镜像分析
    const mirrorScores = this.calculateHistoryMirror(fullHistory, lastDrawNums);
    stats.forEach(s => s.scoreHistoryMirror = mirrorScores[s.num] || 0);
    algorithmContributions.historyMirror = this.calculateAlgorithmEffectiveness(mirrorScores, lastSpecial);

    // 4. 特码轨迹分析
    const trajectoryScores = this.analyzeTrajectory(fullHistory, lastSpecial);
    stats.forEach(s => s.scoreSpecialTraj = trajectoryScores[s.num] || 0);
    algorithmContributions.specialTraj = this.calculateAlgorithmEffectiveness(trajectoryScores, lastSpecial);

    // 5. 形态几何分析
    const patternScores = this.calculatePatternScores(lastDrawNums, recent10);
    stats.forEach(s => s.scorePattern = patternScores[s.num] || 0);
    algorithmContributions.pattern = this.calculateAlgorithmEffectiveness(patternScores, lastSpecial);

    // 6. 尾数力场分析
    const tailScores = this.calculateTailScores(recent10);
    stats.forEach(s => s.scoreTail = tailScores[s.tail] || 0);
    algorithmContributions.tail = this.calculateTailEffectiveness(tailScores, lastDrawTail);

    // 7. 三合局势分析
    const zodiacScores = this.calculateZodiacScores(recent20, lastSpecialZodiac);
    stats.forEach(s => s.scoreZodiac = zodiacScores[s.zodiac] || 0);
    algorithmContributions.zodiac = this.calculateZodiacEffectiveness(zodiacScores, lastSpecialZodiac);

    // 8. 五行平衡分析
    const wuxingScores = this.calculateWuxingScores(recent10);
    stats.forEach(s => s.scoreWuXing = wuxingScores[s.wuxing] || 0);
    algorithmContributions.wuxing = this.calculateWuxingEffectiveness(wuxingScores, this.NUM_TO_WUXING[lastSpecial]);

    // 9. 波色惯性分析
    const waveScores = this.calculateWaveScores(recent10, lastSpecial);
    stats.forEach(s => s.scoreWave = waveScores[s.wave] || 0);
    algorithmContributions.wave = this.calculateWaveEffectiveness(waveScores, this.getNumWave(lastSpecial));

    // 10. 黄金密钥分析
    const goldNumbers = this.calculateGoldNumbers(lastDrawSum, lastSpecial);
    stats.forEach(s => {
      if (goldNumbers.includes(s.num)) s.scoreGold = 25;
    });
    algorithmContributions.gold = goldNumbers.includes(lastSpecial) ? 1 : 0;

    // 11. 遗漏回补分析
    const omissionScores = this.calculateOmissionScores(fullHistory, 40);
    stats.forEach(s => s.scoreOmission = omissionScores[s.num] || 0);
    algorithmContributions.omission = this.calculateAlgorithmEffectiveness(omissionScores, lastSpecial);

    // 12. 季节规律分析
    const seasonalScores = this.calculateSeasonalScores(currentMonth, currentWeek);
    stats.forEach(s => {
      s.scoreSeasonal = seasonalScores[s.zodiac] || 0;
      if (s.num % 10 === currentMonth % 10) s.scoreSeasonal += 5;
    });
    algorithmContributions.seasonal = seasonalScores[lastSpecialZodiac] > 0 ? 1 : 0;

    // 13. 质数分布分析
    const primeAnalysis = this.analyzePrimeDistribution(recent20);
    stats.forEach(s => {
      if (primeAnalysis.needMorePrimes && s.prime) {
        s.scorePrime = 15;
      } else if (primeAnalysis.needMoreComposites && !s.prime) {
        s.scorePrime = 15;
      }
      if (lastSpecialPrime && s.prime) {
        s.scorePrime += 10;
      }
    });
    algorithmContributions.prime = primeAnalysis.currentRatio > primeAnalysis.expectedRatio ? 1 : 0;

    // 14. 和值分析
    const sumAnalysis = this.analyzeSumPatterns(recent20, lastDrawSum);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumAnalysis = sumAnalysis.getScore(simulatedSum);
    });
    algorithmContributions.sumAnalysis = 0.5;

    // 15. 位置分析
    const positionScores = this.calculatePositionScores(recent20);
    stats.forEach(s => s.scorePosition = positionScores[s.num] || 0);
    algorithmContributions.position = this.calculateAlgorithmEffectiveness(positionScores, lastSpecial);

    // 16. 频率分析
    const frequencyScores = this.calculateFrequencyScores(recent30);
    stats.forEach(s => s.scoreFrequency = frequencyScores[s.num] || 0);
    algorithmContributions.frequency = this.calculateAlgorithmEffectiveness(frequencyScores, lastSpecial);

    // 17. 聚类分析
    const clusterScores = this.calculateClusterScores(lastDrawNums, recent20);
    stats.forEach(s => s.scoreCluster = clusterScores[s.num] || 0);
    algorithmContributions.cluster = this.calculateAlgorithmEffectiveness(clusterScores, lastSpecial);

    // 18. 对称分析
    const symmetryScores = this.calculateSymmetryScores(recent20, lastDrawNums);
    stats.forEach(s => s.scoreSymmetry = symmetryScores[s.num] || 0);
    algorithmContributions.symmetry = this.calculateAlgorithmEffectiveness(symmetryScores, lastSpecial);

    // 19. 周期分析
    const periodicScores = this.calculatePeriodicScores(fullHistory, currentWeek);
    stats.forEach(s => s.scorePeriodic = periodicScores[s.num] || 0);
    algorithmContributions.periodic = this.calculateAlgorithmEffectiveness(periodicScores, lastSpecial);

    // 20. 趋势分析
    const trendScores = this.calculateTrendScores(fullHistory);
    stats.forEach(s => s.scoreTrend = trendScores[s.num] || 0);
    algorithmContributions.trend = this.calculateAlgorithmEffectiveness(trendScores, lastSpecial);

    // 21. 头数分析
    const headAnalysis = this.analyzeHeadPatterns(recent30, lastDrawHead, currentWeekday);
    stats.forEach(s => {
      s.scoreHeadAnalysis = headAnalysis.getScore(s.head, s.num);
    });
    algorithmContributions.headAnalysis = headAnalysis.getScore(lastDrawHead, lastSpecial) > 0 ? 1 : 0;

    // 22. 尾数模式分析
    const tailPatternAnalysis = this.analyzeTailPatterns(recent20, lastDrawTail, currentDay);
    stats.forEach(s => {
      s.scoreTailPattern = tailPatternAnalysis.getScore(s.tail, s.num);
    });
    algorithmContributions.tailPattern = tailPatternAnalysis.getScore(lastDrawTail, lastSpecial) > 0 ? 1 : 0;

    // 23. 关联性分析
    const correlationScores = this.calculateCorrelationScores(recent30, lastDrawNums);
    stats.forEach(s => s.scoreCorrelation = correlationScores[s.num] || 0);
    algorithmContributions.correlation = this.calculateAlgorithmEffectiveness(correlationScores, lastSpecial);

    // 24. 属性分析
    const propertyAnalysis = this.analyzePropertyPatterns(recent20, lastSpecial);
    stats.forEach(s => {
      s.scoreProperty = propertyAnalysis.getScore(s);
    });
    algorithmContributions.property = propertyAnalysis.getScore(stats.find(s => s.num === lastSpecial)!) > 0 ? 1 : 0;

    // 25. 时间模式分析
    const timePatternScores = this.calculateTimePatternScores(currentWeekday, currentMonthPeriod, currentDay);
    stats.forEach(s => s.scoreTimePattern = timePatternScores[s.num] || 0);
    algorithmContributions.timePattern = this.calculateAlgorithmEffectiveness(timePatternScores, lastSpecial);

    // 26. 连号模式分析
    const seriesPatternScores = this.analyzeSeriesPatterns(recent20, lastDrawNums);
    stats.forEach(s => s.scoreSeriesPattern = seriesPatternScores[s.num] || 0);
    algorithmContributions.seriesPattern = this.calculateAlgorithmEffectiveness(seriesPatternScores, lastSpecial);

    // 27. 和值分区分析
    const sumZoneAnalysis = this.analyzeSumZonePatterns(recent20, lastDrawSum);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumZone = sumZoneAnalysis.getScore(simulatedSum);
    });
    algorithmContributions.sumZone = 0.5;

    // 28. 五行相生相克分析
    const elementRelationScores = this.calculateElementRelationScores(recent10, lastSpecial);
    stats.forEach(s => s.scoreElementRelation = elementRelationScores[s.num] || 0);
    algorithmContributions.elementRelation = this.calculateAlgorithmEffectiveness(elementRelationScores, lastSpecial);

    // 29. 矩阵坐标分析
    const matrixCoordinateScores = this.calculateMatrixCoordinateScores(recent20, lastMatrix, currentWeekday);
    stats.forEach(s => s.scoreMatrixCoordinate = matrixCoordinateScores[s.num] || 0);
    algorithmContributions.matrixCoordinate = this.calculateAlgorithmEffectiveness(matrixCoordinateScores, lastSpecial);

    // 30. 晶格分布分析
    const latticeDistributionScores = this.calculateLatticeDistributionScores(recent30, lastSpecial);
    stats.forEach(s => s.scoreLatticeDistribution = latticeDistributionScores[s.num] || 0);
    algorithmContributions.latticeDistribution = this.calculateAlgorithmEffectiveness(latticeDistributionScores, lastSpecial);

    // 31. 混沌模式分析
    const chaosPatternScores = this.analyzeChaosPatterns(recent50, lastSpecial);
    stats.forEach(s => s.scoreChaosPattern = chaosPatternScores[s.num] || 0);
    algorithmContributions.chaosPattern = this.calculateAlgorithmEffectiveness(chaosPatternScores, lastSpecial);

    // 32. 分形维度分析
    const fractalDimensionScores = this.calculateFractalDimensionScores(recent30);
    stats.forEach(s => s.scoreFractalDimension = fractalDimensionScores[s.num] || 0);
    algorithmContributions.fractalDimension = this.calculateAlgorithmEffectiveness(fractalDimensionScores, lastSpecial);

    // 33. 信息熵分析
    const entropyAnalysisScores = this.analyzeEntropyPatterns(recent20, lastSpecial);
    stats.forEach(s => s.scoreEntropyAnalysis = entropyAnalysisScores[s.num] || 0);
    algorithmContributions.entropyAnalysis = this.calculateAlgorithmEffectiveness(entropyAnalysisScores, lastSpecial);

    // 34. 确定性核心分析
    const deterministicCoreScores = this.calculateDeterministicCoreScores(fullHistory, lastSpecial, currentWeek);
    stats.forEach(s => s.scoreDeterministicCore = deterministicCoreScores[s.num] || 0);
    algorithmContributions.deterministicCore = this.calculateAlgorithmEffectiveness(deterministicCoreScores, lastSpecial);

    // 更新算法性能记录
    this.updateAlgorithmPerformance(algorithmContributions, lastSpecial);

    // ==========================================
    // 应用自适应权重计算总分
    // ==========================================
    stats.forEach(s => {
      s.totalScore = 
        s.scoreZodiacTrans * this.WEIGHT_CONFIG.scoreZodiacTrans * this.getAlgorithmWeight('zodiacTrans') +
        s.scoreNumberTrans * this.WEIGHT_CONFIG.scoreNumberTrans * this.getAlgorithmWeight('numberTrans') +
        s.scoreHistoryMirror * this.WEIGHT_CONFIG.scoreHistoryMirror * this.getAlgorithmWeight('historyMirror') +
        s.scoreSpecialTraj * this.WEIGHT_CONFIG.scoreSpecialTraj * this.getAlgorithmWeight('specialTraj') +
        s.scorePattern * this.WEIGHT_CONFIG.scorePattern * this.getAlgorithmWeight('pattern') +
        s.scoreTail * this.WEIGHT_CONFIG.scoreTail * this.getAlgorithmWeight('tail') +
        s.scoreZodiac * this.WEIGHT_CONFIG.scoreZodiac * this.getAlgorithmWeight('zodiac') +
        s.scoreWuXing * this.WEIGHT_CONFIG.scoreWuXing * this.getAlgorithmWeight('wuxing') +
        s.scoreWave * this.WEIGHT_CONFIG.scoreWave * this.getAlgorithmWeight('wave') +
        s.scoreGold * this.WEIGHT_CONFIG.scoreGold * this.getAlgorithmWeight('gold') +
        s.scoreOmission * this.WEIGHT_CONFIG.scoreOmission * this.getAlgorithmWeight('omission') +
        s.scoreSeasonal * this.WEIGHT_CONFIG.scoreSeasonal * this.getAlgorithmWeight('seasonal') +
        s.scorePrime * this.WEIGHT_CONFIG.scorePrime * this.getAlgorithmWeight('prime') +
        s.scoreSumAnalysis * this.WEIGHT_CONFIG.scoreSumAnalysis * this.getAlgorithmWeight('sumAnalysis') +
        s.scorePosition * this.WEIGHT_CONFIG.scorePosition * this.getAlgorithmWeight('position') +
        s.scoreFrequency * this.WEIGHT_CONFIG.scoreFrequency * this.getAlgorithmWeight('frequency') +
        s.scoreCluster * this.WEIGHT_CONFIG.scoreCluster * this.getAlgorithmWeight('cluster') +
        s.scoreSymmetry * this.WEIGHT_CONFIG.scoreSymmetry * this.getAlgorithmWeight('symmetry') +
        s.scorePeriodic * this.WEIGHT_CONFIG.scorePeriodic * this.getAlgorithmWeight('periodic') +
        s.scoreTrend * this.WEIGHT_CONFIG.scoreTrend * this.getAlgorithmWeight('trend') +
        s.scoreHeadAnalysis * this.WEIGHT_CONFIG.scoreHeadAnalysis * this.getAlgorithmWeight('headAnalysis') +
        s.scoreTailPattern * this.WEIGHT_CONFIG.scoreTailPattern * this.getAlgorithmWeight('tailPattern') +
        s.scoreCorrelation * this.WEIGHT_CONFIG.scoreCorrelation * this.getAlgorithmWeight('correlation') +
        s.scoreProperty * this.WEIGHT_CONFIG.scoreProperty * this.getAlgorithmWeight('property') +
        s.scoreTimePattern * this.WEIGHT_CONFIG.scoreTimePattern * this.getAlgorithmWeight('timePattern') +
        s.scoreSeriesPattern * this.WEIGHT_CONFIG.scoreSeriesPattern * this.getAlgorithmWeight('seriesPattern') +
        s.scoreSumZone * this.WEIGHT_CONFIG.scoreSumZone * this.getAlgorithmWeight('sumZone') +
        s.scoreElementRelation * this.WEIGHT_CONFIG.scoreElementRelation * this.getAlgorithmWeight('elementRelation') +
        s.scoreMatrixCoordinate * this.WEIGHT_CONFIG.scoreMatrixCoordinate * this.getAlgorithmWeight('matrixCoordinate') +
        s.scoreLatticeDistribution * this.WEIGHT_CONFIG.scoreLatticeDistribution * this.getAlgorithmWeight('latticeDistribution') +
        s.scoreChaosPattern * this.WEIGHT_CONFIG.scoreChaosPattern * this.getAlgorithmWeight('chaosPattern') +
        s.scoreFractalDimension * this.WEIGHT_CONFIG.scoreFractalDimension * this.getAlgorithmWeight('fractalDimension') +
        s.scoreEntropyAnalysis * this.WEIGHT_CONFIG.scoreEntropyAnalysis * this.getAlgorithmWeight('entropyAnalysis') +
        s.scoreDeterministicCore * this.WEIGHT_CONFIG.scoreDeterministicCore * this.getAlgorithmWeight('deterministicCore');
        
      // 确定性微调
      const deterministicAdjustment = this.getDeterministicAdjustment(
        s.num, lastSpecial, currentDay, currentWeekday
      );
      s.totalScore += deterministicAdjustment;
      
      // 附加分
      if (s.tail % 2 === lastDrawTail % 2) {
        s.totalScore += 2;
      }
      
      if (s.head === (lastDrawHead + 1) % 5) {
        s.totalScore += 3;
      }
    });

    // ==========================================
    // 惩罚机制
    // ==========================================
    stats.forEach(s => {
      if (s.num === lastSpecial) {
        s.totalScore *= this.WEIGHT_CONFIG.punishmentLastSpecial;
      }
      
      if (s.zodiac === lastSpecialZodiac && s.num !== lastSpecial) {
        s.totalScore *= this.WEIGHT_CONFIG.punishmentSameZodiac;
      }
      
      if (lastDrawNums.includes(s.num) && s.num !== lastSpecial) {
        s.totalScore *= this.WEIGHT_CONFIG.punishmentRecentNumbers;
      }
      
      const recentZodiacCount = this.getRecentZodiacCount(recent20, s.zodiac);
      if (recentZodiacCount > 8) {
        s.totalScore *= this.WEIGHT_CONFIG.punishmentHotZodiac;
      }
    });

    // 排序
    stats.sort((a, b) => b.totalScore - a.totalScore);

    // 多样性选码
    const finalNumbers = this.selectDiverseNumbers(stats, this.WEIGHT_CONFIG.targetNumbersCount);
    const resultNumbers = finalNumbers.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 计算推荐肖
    const zMap: Record<string, number> = {};
    finalNumbers.forEach(s => zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore);
    
    const allZodiacs = Object.keys(this.ZODIACS_MAP);
    const zodiacScoresList = allZodiacs.map(z => ({
      zodiac: z,
      score: zMap[z] || 0
    })).sort((a, b) => b.score - a.score);
    
    const recZodiacs = zodiacScoresList
      .filter(z => z.zodiac !== lastSpecialZodiac)
      .slice(0, this.WEIGHT_CONFIG.targetZodiacsCount)
      .map(z => z.zodiac);

    if (recZodiacs.length < this.WEIGHT_CONFIG.targetZodiacsCount) {
      const remainingZodiacs = zodiacScoresList
        .filter(z => !recZodiacs.includes(z.zodiac))
        .slice(0, this.WEIGHT_CONFIG.targetZodiacsCount - recZodiacs.length)
        .map(z => z.zodiac);
      recZodiacs.push(...remainingZodiacs);
    }

    // 计算推荐波
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    finalNumbers.forEach(s => wMap[s.wave]++);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 头数和尾数推荐
    const headRecommendations = this.calculateHeadRecommendations(
      recent30, 
      finalNumbers, 
      lastDrawHead, 
      currentWeekday
    );
    
    const tailRecommendations = this.calculateTailRecommendations(
      recent20, 
      finalNumbers, 
      lastDrawTail, 
      currentDay
    );

    return {
        zodiacs: recZodiacs,
        numbers: resultNumbers,
        wave: { main: recWaves[0], defense: recWaves[1] },
        heads: headRecommendations,
        tails: tailRecommendations
    };
  }

  // ==========================================
  // 自动回测系统
  // ==========================================

  static runAutoBacktest(history: DbRecord[]): BacktestResult {
    if (history.length < 100) {
      console.warn('历史数据不足，需要至少100期数据进行回测');
      return { accuracy: 0, details: { 
        totalPredictions: 0, 
        totalHits: 0,
        zodiacAccuracy: 0,
        waveAccuracy: 0,
        headAccuracy: 0,
        tailAccuracy: 0,
        top5Accuracy: 0,
        top10Accuracy: 0,
        algorithmPerformance: {}
      }};
    }

    const testSize = Math.min(100, Math.floor(history.length * 0.3));
    const testHistory = history.slice(0, testSize);
    const trainingHistory = history.slice(testSize);

    let totalHits = 0;
    let totalPredictions = 0;
    let zodiacHits = 0;
    let waveHits = 0;
    let headHits = 0;
    let tailHits = 0;
    let top5Hits = 0;
    let top10Hits = 0;

    const algorithmPerformance: Record<string, { hits: number, uses: number }> = {};

    // 执行回测
    for (let i = 0; i < testHistory.length - 1; i++) {
      const trainingData = trainingHistory.concat(testHistory.slice(i + 1));
      const testRecord = testHistory[i];
      
      try {
        // 生成预测
        const prediction = this.generate(trainingData, 'mark-six');
        
        // 获取实际开奖结果
        const actualNumbers = this.parseNumbers(testRecord.open_code);
        const actualSpecial = actualNumbers[actualNumbers.length - 1];
        const actualZodiac = this.NUM_TO_ZODIAC[actualSpecial];
        const actualWave = this.getNumWave(actualSpecial);
        const actualHead = Math.floor(actualSpecial / 10);
        const actualTail = actualSpecial % 10;

        // 检查命中情况
        const predictedNumbers = prediction.numbers.map(n => parseInt(n));
        const predictedZodiacs = prediction.zodiacs;
        const predictedWaves = [prediction.wave.main, prediction.wave.defense];
        const predictedHeads = prediction.heads.map(h => parseInt(h));
        const predictedTails = prediction.tails.map(t => parseInt(t));

        // 统计命中
        if (predictedNumbers.includes(actualSpecial)) totalHits++;
        if (predictedZodiacs.includes(actualZodiac)) zodiacHits++;
        if (predictedWaves.includes(actualWave)) waveHits++;
        if (predictedHeads.includes(actualHead)) headHits++;
        if (predictedTails.includes(actualTail)) tailHits++;
        
        // 检查前5和前10命中
        const top5Numbers = predictedNumbers.slice(0, 5);
        const top10Numbers = predictedNumbers.slice(0, 10);
        if (top5Numbers.includes(actualSpecial)) top5Hits++;
        if (top10Numbers.includes(actualSpecial)) top10Hits++;

        totalPredictions++;
        
      } catch (error) {
        console.error(`回测第${i}期时出错:`, error);
      }
    }

    // 计算准确率
    const accuracy = totalPredictions > 0 ? totalHits / totalPredictions : 0;
    const zodiacAccuracy = totalPredictions > 0 ? zodiacHits / totalPredictions : 0;
    const waveAccuracy = totalPredictions > 0 ? waveHits / totalPredictions : 0;
    const headAccuracy = totalPredictions > 0 ? headHits / totalPredictions : 0;
    const tailAccuracy = totalPredictions > 0 ? tailHits / totalPredictions : 0;
    const top5Accuracy = totalPredictions > 0 ? top5Hits / totalPredictions : 0;
    const top10Accuracy = totalPredictions > 0 ? top10Hits / totalPredictions : 0;

    const result: BacktestResult = {
      accuracy,
      details: {
        totalPredictions,
        totalHits,
        zodiacAccuracy,
        waveAccuracy,
        headAccuracy,
        tailAccuracy,
        top5Accuracy,
        top10Accuracy,
        algorithmPerformance
      }
    };

    // 保存性能记录
    this.PERFORMANCE_HISTORY.push({
      date: new Date().toISOString(),
      specialHit: accuracy > 0,
      zodiacHit: zodiacAccuracy > 0,
      waveHit: waveAccuracy > 0,
      headHit: headAccuracy > 0,
      tailHit: tailAccuracy > 0,
      top5Hit: top5Accuracy > 0,
      top10Hit: top10Accuracy > 0,
      algorithmContributions: {}
    });

    // 优化权重
    this.optimizeWeightsBasedOnBacktest(result);

    return result;
  }

  static optimizeWeightsBasedOnBacktest(backtestResult: BacktestResult): void {
    const { details } = backtestResult;
    
    if (details.totalPredictions === 0) return;

    // 计算各项命中率
    const hitRates = {
      special: details.totalHits / details.totalPredictions,
      zodiac: details.zodiacAccuracy,
      wave: details.waveAccuracy,
      head: details.headAccuracy,
      tail: details.tailAccuracy,
      top5: details.top5Accuracy,
      top10: details.top10Accuracy
    };

    // 调整基础权重
    const adjustmentFactor = 1.0 + (hitRates.special - 0.5); // 以50%为基准
    
    Object.keys(this.WEIGHT_CONFIG).forEach(key => {
      if (key.startsWith('score')) {
        // 根据整体命中率调整权重
        this.WEIGHT_CONFIG[key] *= adjustmentFactor;
        
        // 限制权重范围
        this.WEIGHT_CONFIG[key] = Math.max(0.1, Math.min(5.0, this.WEIGHT_CONFIG[key]));
      }
    });

    // 调整惩罚因子
    if (hitRates.special < 0.3) {
      // 准确率太低，减轻惩罚
      this.WEIGHT_CONFIG.punishmentLastSpecial = Math.min(0.5, this.WEIGHT_CONFIG.punishmentLastSpecial * 1.2);
      this.WEIGHT_CONFIG.punishmentSameZodiac = Math.min(0.95, this.WEIGHT_CONFIG.punishmentSameZodiac * 1.1);
    } else if (hitRates.special > 0.7) {
      // 准确率高，增强惩罚
      this.WEIGHT_CONFIG.punishmentLastSpecial = Math.max(0.1, this.WEIGHT_CONFIG.punishmentLastSpecial * 0.8);
      this.WEIGHT_CONFIG.punishmentSameZodiac = Math.max(0.5, this.WEIGHT_CONFIG.punishmentSameZodiac * 0.9);
    }
  }

  // ==========================================
  // 算法有效性评估系统
  // ==========================================

  static initializeAlgorithmPerformance(): void {
    if (Object.keys(this.ALGORITHM_PERFORMANCE).length > 0) return;

    const algorithms = [
      'zodiacTrans', 'numberTrans', 'historyMirror', 'specialTraj', 'pattern',
      'tail', 'zodiac', 'wuxing', 'wave', 'gold', 'omission', 'seasonal',
      'prime', 'sumAnalysis', 'position', 'frequency', 'cluster', 'symmetry',
      'periodic', 'trend', 'headAnalysis', 'tailPattern', 'correlation',
      'property', 'timePattern', 'seriesPattern', 'sumZone', 'elementRelation',
      'matrixCoordinate', 'latticeDistribution', 'chaosPattern', 'fractalDimension',
      'entropyAnalysis', 'deterministicCore'
    ];

    algorithms.forEach(algo => {
      this.ALGORITHM_PERFORMANCE[algo] = {
        totalUses: 0,
        totalHits: 0,
        recentHits: [],
        lastUpdate: Date.now(),
        efficiency: 0.5,
        weight: 1.0,
        adaptiveFactor: 1.0
      };
    });
  }

  static updateAlgorithmPerformance(
    contributions: Record<string, number>,
    actualSpecial: number
  ): void {
    Object.entries(contributions).forEach(([algo, contribution]) => {
      if (!this.ALGORITHM_PERFORMANCE[algo]) return;

      const perf = this.ALGORITHM_PERFORMANCE[algo];
      perf.totalUses++;
      
      if (contribution > 0.5) {
        perf.totalHits++;
        perf.recentHits.push(1);
      } else {
        perf.recentHits.push(0);
      }
      
      if (perf.recentHits.length > 100) {
        perf.recentHits.shift();
      }
      
      const recentEfficiency = perf.recentHits.length > 0 
        ? perf.recentHits.reduce((a, b) => a + b, 0) / perf.recentHits.length
        : 0;
      
      const overallEfficiency = perf.totalUses > 0 
        ? perf.totalHits / perf.totalUses 
        : 0;
      
      perf.efficiency = recentEfficiency * 0.7 + overallEfficiency * 0.3;
      perf.lastUpdate = Date.now();
      
      if (perf.efficiency > 0.7) {
        perf.adaptiveFactor = Math.min(2.0, perf.adaptiveFactor * 1.1);
      } else if (perf.efficiency < 0.3) {
        perf.adaptiveFactor = Math.max(0.5, perf.adaptiveFactor * 0.9);
      }
    });
  }

  static getAlgorithmWeight(algorithmName: string): number {
    const perf = this.ALGORITHM_PERFORMANCE[algorithmName];
    if (!perf) return 1.0;
    
    const timeFactor = Math.max(0.5, 1.0 - (Date.now() - perf.lastUpdate) / (30 * 24 * 60 * 60 * 1000));
    return perf.adaptiveFactor * timeFactor;
  }

  static calculateAlgorithmEffectiveness(scores: Record<number, number>, actualNumber: number): number {
    if (!scores[actualNumber]) return 0;
    
    const scoreValues = Object.values(scores);
    const maxScore = Math.max(...scoreValues);
    const minScore = Math.min(...scoreValues);
    
    if (maxScore === minScore) return 0.5;
    
    const normalizedScore = (scores[actualNumber] - minScore) / (maxScore - minScore);
    return normalizedScore;
  }

  static calculateTailEffectiveness(scores: Record<number, number>, actualTail: number): number {
    return scores[actualTail] > 0 ? 1 : 0;
  }

  static calculateZodiacEffectiveness(scores: Record<string, number>, actualZodiac: string): number {
    return scores[actualZodiac] > 0 ? 1 : 0;
  }

  static calculateWuxingEffectiveness(scores: Record<string, number>, actualWuxing: string): number {
    return scores[actualWuxing] > 0 ? 1 : 0;
  }

  static calculateWaveEffectiveness(scores: Record<string, number>, actualWave: string): number {
    return scores[actualWave] > 0 ? 1 : 0;
  }

  // ==========================================
  // 权重优化算法
  // ==========================================

  static applyOptimizedWeights(): void {
    Object.entries(this.ALGORITHM_PERFORMANCE).forEach(([algo, perf]) => {
      const weightKey = `score${algo.charAt(0).toUpperCase() + algo.slice(1)}`;
      if (this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] !== undefined) {
        const efficiencyFactor = perf.efficiency;
        const targetWeight = (this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] as number) * (0.5 + efficiencyFactor);
        
        (this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] as number) = 
          (this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] as number) * 0.7 + targetWeight * 0.3;
        
        (this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] as number) = 
          Math.max(0.1, Math.min(5.0, this.WEIGHT_CONFIG[weightKey as keyof typeof this.WEIGHT_CONFIG] as number));
      }
    });

    if (this.PERFORMANCE_HISTORY.length >= 20) {
      const recentHistory = this.PERFORMANCE_HISTORY.slice(-20);
      const hitRate = recentHistory.filter(h => h.specialHit).length / 20;
      
      if (hitRate < 0.3) {
        this.WEIGHT_CONFIG.scoreZodiacTrans *= 1.2;
        this.WEIGHT_CONFIG.scoreNumberTrans *= 1.2;
        this.WEIGHT_CONFIG.scoreHistoryMirror *= 1.2;
      } else if (hitRate > 0.7) {
        Object.keys(this.WEIGHT_CONFIG).forEach(key => {
          if (key.startsWith('score')) {
            (this.WEIGHT_CONFIG[key as keyof typeof this.WEIGHT_CONFIG] as number) *= 0.95;
          }
        });
      }
    }
  }

  static optimizeWeightsWithGA(history: DbRecord[], generations: number = 10): void {
    console.log('开始遗传算法优化权重...');
    
    const populationSize = 20;
    const eliteSize = 4;
    const mutationRate = 0.1;
    
    let population: WeightChromosome[] = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(this.createRandomChromosome());
    }
    
    for (let gen = 0; gen < generations; gen++) {
      population.forEach(chromosome => {
        if (chromosome.fitness === undefined) {
          chromosome.fitness = this.evaluateChromosome(chromosome, history);
        }
      });
      
      population.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
      
      console.log(`第${gen + 1}代，最佳适应度: ${population[0].fitness}`);
      
      const elites = population.slice(0, eliteSize);
      const newPopulation: WeightChromosome[] = [...elites];
      
      while (newPopulation.length < populationSize) {
        const parent1 = this.selectParent(population);
        const parent2 = this.selectParent(population);
        const child = this.crossover(parent1, parent2);
        this.mutate(child, mutationRate);
        newPopulation.push(child);
      }
      
      population = newPopulation;
    }
    
    const bestChromosome = population[0];
    this.applyChromosomeWeights(bestChromosome);
    
    console.log('遗传算法优化完成，最佳适应度:', bestChromosome.fitness);
  }

  private static createRandomChromosome(): WeightChromosome {
    const chromosome: WeightChromosome = {
      weights: {},
      fitness: undefined
    };
    
    Object.keys(this.WEIGHT_CONFIG).forEach(key => {
      if (key.startsWith('score')) {
        chromosome.weights[key] = Math.random() * 4 + 0.1;
      }
    });
    
    return chromosome;
  }

  private static evaluateChromosome(chromosome: WeightChromosome, history: DbRecord[]): number {
    const originalWeights = { ...this.WEIGHT_CONFIG };
    
    Object.keys(chromosome.weights).forEach(key => {
      (this.WEIGHT_CONFIG[key as keyof typeof this.WEIGHT_CONFIG] as number) = chromosome.weights[key];
    });
    
    const backtestResult = this.runAutoBacktest(history.slice(0, 100));
    
    Object.keys(originalWeights).forEach(key => {
      (this.WEIGHT_CONFIG[key as keyof typeof this.WEIGHT_CONFIG] as number) = originalWeights[key as keyof typeof this.WEIGHT_CONFIG];
    });
    
    return backtestResult.accuracy;
  }

  private static selectParent(population: WeightChromosome[]): WeightChromosome {
    const totalFitness = population.reduce((sum, chrom) => sum + (chrom.fitness || 0), 0);
    let random = Math.random() * totalFitness;
    
    for (const chrom of population) {
      random -= chrom.fitness || 0;
      if (random <= 0) {
        return chrom;
      }
    }
    
    return population[0];
  }

  private static crossover(parent1: WeightChromosome, parent2: WeightChromosome): WeightChromosome {
    const child: WeightChromosome = {
      weights: {},
      fitness: undefined
    };
    
    Object.keys(parent1.weights).forEach(key => {
      if (Math.random() < 0.5) {
        child.weights[key] = parent1.weights[key];
      } else {
        child.weights[key] = parent2.weights[key];
      }
    });
    
    return child;
  }

  private static mutate(chromosome: WeightChromosome, mutationRate: number): void {
    Object.keys(chromosome.weights).forEach(key => {
      if (Math.random() < mutationRate) {
        chromosome.weights[key] = Math.max(0.1, chromosome.weights[key] + (Math.random() - 0.5) * 0.5);
      }
    });
  }

  private static applyChromosomeWeights(chromosome: WeightChromosome): void {
    Object.keys(chromosome.weights).forEach(key => {
      (this.WEIGHT_CONFIG[key as keyof typeof this.WEIGHT_CONFIG] as number) = chromosome.weights[key];
    });
  }

  // ==========================================
  // 实时性能监控
  // ==========================================

  static getPerformanceReport(): PerformanceReport {
    const recentHistory = this.PERFORMANCE_HISTORY.slice(-50);
    const total = recentHistory.length;
    
    const hitRates = {
      special: recentHistory.filter(h => h.specialHit).length / total,
      zodiac: recentHistory.filter(h => h.zodiacHit).length / total,
      wave: recentHistory.filter(h => h.waveHit).length / total,
      head: recentHistory.filter(h => h.headHit).length / total,
      tail: recentHistory.filter(h => h.tailHit).length / total,
      top5: recentHistory.filter(h => h.top5Hit).length / total,
      top10: recentHistory.filter(h => h.top10Hit).length / total,
    };
    
    const algorithmRanking = Object.entries(this.ALGORITHM_PERFORMANCE)
      .map(([name, perf]) => ({
        name,
        efficiency: perf.efficiency,
        uses: perf.totalUses,
        adaptiveFactor: perf.adaptiveFactor
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
    
    const weightDistribution = Object.entries(this.WEIGHT_CONFIG)
      .filter(([key]) => key.startsWith('score'))
      .map(([key, value]) => ({
        algorithm: key.replace('score', ''),
        weight: value as number
      }))
      .sort((a, b) => b.weight - a.weight);
    
    return {
      timestamp: new Date().toISOString(),
      period: `${total}期`,
      hitRates,
      algorithmRanking: algorithmRanking.slice(0, 10),
      weightDistribution: weightDistribution.slice(0, 10),
      recommendations: this.generateOptimizationRecommendations(hitRates)
    };
  }

  private static generateOptimizationRecommendations(hitRates: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    if (hitRates.special < 0.3) {
      recommendations.push('特码命中率过低，建议增强核心算法权重');
      recommendations.push('考虑减少惩罚因子，避免过度惩罚');
    }
    
    if (hitRates.zodiac < 0.4) {
      recommendations.push('生肖命中率不足，建议优化生肖转移算法');
    }
    
    if (hitRates.wave < 0.4) {
      recommendations.push('波色命中率不足，建议调整波色分析');
    }
    
    if (hitRates.top5 > hitRates.special * 1.5) {
      recommendations.push('前5号码命中率较高，建议增强排名靠前号码的选择');
    }
    
    return recommendations;
  }

  // ==========================================
  // 基础算法实现
  // ==========================================

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => this.NUM_TO_ZODIAC[n] = z);
    }
    
    for (const [w, nums] of Object.entries(this.WU_XING_MAP)) {
      nums.forEach(n => this.NUM_TO_WUXING[n] = w);
    }
    
    for (let num = 1; num <= 49; num++) {
      this.NUM_TO_HEAD[num] = Math.floor(num / 10);
      this.NUM_TO_SIZE[num] = num <= 25 ? 'small' : 'large';
      this.NUM_TO_PARITY[num] = num % 2 === 0 ? 'even' : 'odd';
      this.NUM_TO_PRIME[num] = this.PRIME_NUMBERS.includes(num);
      
      for (const [cluster, nums] of Object.entries(this.CLUSTER_GROUPS)) {
        if (nums.includes(num)) {
          this.NUM_TO_CLUSTER[num] = parseInt(cluster);
          break;
        }
      }
      
      const row = Math.floor((num - 1) / 7) + 1;
      const col = ((num - 1) % 7) + 1;
      this.NUM_TO_MATRIX[num] = { row, col };
      this.MATRIX_COORDINATES[num] = { row, col };
    }
  }

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    return code.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  }

  private static getNumWave(num: number): string {
    if (this.WAVES_MAP.red.includes(num)) return 'red';
    if (this.WAVES_MAP.blue.includes(num)) return 'blue';
    if (this.WAVES_MAP.green.includes(num)) return 'green';
    return 'red';
  }

  private static getSeasonByMonth(month: number): string {
    if (month >= 3 && month <= 5) return '春';
    if (month >= 6 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }

  private static getDeterministicAdjustment(
    num: number, 
    lastSpecial: number, 
    day: number, 
    weekday: number
  ): number {
    const hash = this.deterministicHash(num, lastSpecial, day, weekday);
    return (hash % 50) / 100;
  }

  private static deterministicHash(...args: number[]): number {
    let hash = 5381;
    for (const arg of args) {
      hash = ((hash << 5) + hash) + arg;
    }
    return Math.abs(hash) % 10000;
  }

  private static getRecentZodiacCount(history: DbRecord[], zodiac: string): number {
    let count = 0;
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        if (this.NUM_TO_ZODIAC[num] === zodiac) {
          count++;
        }
      });
    });
    return count;
  }

  private static selectDiverseNumbers(stats: NumberStat[], limit: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const zodiacCount: Record<string, number> = {};
    const waveCount: Record<string, number> = { red: 0, blue: 0, green: 0 };

    for (const s of stats) {
      if (selected.length >= limit) break;

      const zC = zodiacCount[s.zodiac] || 0;
      const wC = waveCount[s.wave] || 0;

      if (zC < this.WEIGHT_CONFIG.maxZodiacPerGroup && wC < this.WEIGHT_CONFIG.maxWavePerGroup) {
        selected.push(s);
        zodiacCount[s.zodiac] = zC + 1;
        waveCount[s.wave] = wC + 1;
      }
    }

    if (selected.length < limit) {
      for (const s of stats) {
        if (selected.length >= limit) break;
        if (!selected.find(n => n.num === s.num)) {
          selected.push(s);
        }
      }
    }

    return selected;
  }

  private static generateDeterministic(): PredictionData {
    this.initializeMaps();
    const deterministicNums = [1, 2, 7, 8, 12, 13, 19, 23, 29, 31, 37, 41, 47, 49, 15, 25, 33, 45]
      .map(n => n < 10 ? `0${n}` : `${n}`);

    return {
      zodiacs: ['蛇', '马', '羊', '猴', '鸡', '狗'],
      numbers: deterministicNums,
      wave: { main: 'red', defense: 'blue' },
      heads: ['0', '1', '2'],
      tails: ['1', '2', '7', '8']
    };
  }

  // ==========================================
  // 核心算法实现
  // ==========================================

  private static calculateZodiacTransScores(history: DbRecord[], lastSpecialZodiac: string): Record<string, number> {
    const zodiacTransMap: Record<string, number> = {};
    let zodiacTransTotal = 0;

    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      const histZodiac = this.NUM_TO_ZODIAC[histSpecial];

      if (histZodiac === lastSpecialZodiac) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        const nextZodiac = this.NUM_TO_ZODIAC[nextSpecial];
        
        zodiacTransMap[nextZodiac] = (zodiacTransMap[nextZodiac] || 0) + 1;
        zodiacTransTotal++;
      }
    }
    
    const scores: Record<string, number> = {};
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      const occurrences = zodiacTransMap[zodiac] || 0;
      scores[zodiac] = zodiacTransTotal > 0 ? (occurrences / zodiacTransTotal) * 50 : 0;
    });
    
    return scores;
  }

  private static calculateNumberTransScores(history: DbRecord[], lastSpecial: number): Record<number, number> {
    const numTransMap: Record<number, number> = {};
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      
      if (histSpecial === lastSpecial) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        numTransMap[nextSpecial] = (numTransMap[nextSpecial] || 0) + 1;
      }
    }
    
    const scores: Record<number, number> = {};
    for (let num = 1; num <= 49; num++) {
      scores[num] = (numTransMap[num] || 0) * 6;
    }
    
    return scores;
  }

  private static calculateHistoryMirror(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const common = histNums.filter(n => lastDraw.includes(n));
      
      if (common.length >= 3) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const similarity = common.length / lastDraw.length;
        
        nextNums.forEach(n => {
          scores[n] = (scores[n] || 0) + similarity * 15;
        });
      }
    }
    
    return scores;
  }

  private static analyzeTrajectory(history: DbRecord[], lastSpecial: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const specials: number[] = [];
    
    for (let i = 0; i < Math.min(15, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      if (nums.length > 0) {
        specials.push(nums[nums.length - 1]);
      }
    }
    
    if (specials.length >= 3) {
      const movingAvg = specials.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const lastParity = lastSpecial % 2;
      const parityHistory = specials.map(s => s % 2);
      const sameParityCount = parityHistory.filter(p => p === lastParity).length;
      
      for (let num = 1; num <= 49; num++) {
        let score = 0;
        
        if (Math.abs(num - movingAvg) <= 5) score += 10;
        
        if ((num % 2) === lastParity && sameParityCount >= 2) score += 8;
        
        const diff = specials[0] - specials[1];
        if (diff > 0 && num < lastSpecial) score += 12;
        if (diff < 0 && num > lastSpecial) score += 12;
        
        scores[num] = score;
      }
    }
    
    return scores;
  }

  private static calculatePatternScores(lastDraw: number[], recentHistory: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const neighborSet = new Set<number>();
    lastDraw.forEach(n => {
      if (n > 1) neighborSet.add(n - 1);
      if (n < 49) neighborSet.add(n + 1);
    });
    
    const consecutiveSet = new Set<number>();
    const sortedLast = [...lastDraw].sort((a, b) => a - b);
    for (let i = 0; i < sortedLast.length - 1; i++) {
      if (sortedLast[i+1] - sortedLast[i] === 1) {
        if (sortedLast[i] > 1) consecutiveSet.add(sortedLast[i] - 1);
        if (sortedLast[i+1] < 49) consecutiveSet.add(sortedLast[i+1] + 1);
      }
    }
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      if (neighborSet.has(num)) score += 15;
      if (consecutiveSet.has(num)) score += 18;
      
      if (lastDraw.includes(num)) score -= 10;
      
      scores[num] = Math.max(score, 0);
    }
    
    return scores;
  }

  private static calculateTailScores(recentHistory: DbRecord[]): Record<number, number> {
    const tailCount: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const tail = num % 10;
        tailCount[tail] = (tailCount[tail] || 0) + 1;
      });
    });
    
    const sortedTails = Object.entries(tailCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tail]) => parseInt(tail));
    
    for (let tail = 0; tail <= 9; tail++) {
      if (sortedTails.includes(tail)) {
        scores[tail] = 20;
      } else {
        scores[tail] = 0;
      }
    }
    
    return scores;
  }

  private static calculateZodiacScores(recentHistory: DbRecord[], lastSpecialZodiac: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const zodiacCount: Record<string, number> = {};
    
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const zodiac = this.NUM_TO_ZODIAC[num];
        zodiacCount[zodiac] = (zodiacCount[zodiac] || 0) + 1;
      });
    });
    
    const hotZodiacs = Object.entries(zodiacCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([zodiac]) => zodiac);
    
    const allies = this.SAN_HE_MAP[lastSpecialZodiac] || [];
    
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      
      if (hotZodiacs.includes(zodiac)) score += 15;
      if (allies.includes(zodiac)) score += 20;
      
      if (zodiac === lastSpecialZodiac) score -= 10;
      
      scores[zodiac] = Math.max(score, 0);
    });
    
    return scores;
  }

  private static calculateWuxingScores(recentHistory: DbRecord[]): Record<string, number> {
    const wuxingCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const wuxing = this.NUM_TO_WUXING[num];
        wuxingCount[wuxing] = (wuxingCount[wuxing] || 0) + 1;
      });
    });
    
    const sortedWuxing = Object.entries(wuxingCount)
      .sort((a, b) => a[1] - b[1]);
    
    const weakWuxing = sortedWuxing[0]?.[0] || '土';
    const strongWuxing = sortedWuxing[sortedWuxing.length - 1]?.[0] || '金';
    
    Object.keys(this.WU_XING_MAP).forEach(wuxing => {
      if (wuxing === weakWuxing) {
        scores[wuxing] = 25;
      } else if (wuxing === strongWuxing) {
        scores[wuxing] = 5;
      } else {
        scores[wuxing] = 15;
      }
    });
    
    return scores;
  }

  private static calculateWaveScores(recentHistory: DbRecord[], lastSpecial: number): Record<string, number> {
    const waveCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const wave = this.getNumWave(num);
        waveCount[wave] = (waveCount[wave] || 0) + 1;
      });
    });
    
    const lastWave = this.getNumWave(lastSpecial);
    
    const sortedWaves = Object.entries(waveCount)
      .sort((a, b) => a[1] - b[1]);
    
    const weakWave = sortedWaves[0]?.[0] || 'green';
    
    ['red', 'blue', 'green'].forEach(wave => {
      let score = 0;
      
      if (wave === lastWave) score += 10;
      
      if (wave === weakWave) score += 20;
      
      scores[wave] = score;
    });
    
    return scores;
  }

  private static calculateGoldNumbers(sum: number, special: number): number[] {
    const goldNumbers: number[] = [];
    
    goldNumbers.push(Math.round(sum * 0.618) % 49 || 49);
    goldNumbers.push((sum + 7) % 49 || 49);
    goldNumbers.push(Math.round(special * 1.618) % 49 || 49);
    goldNumbers.push((special + 13) % 49 || 49);
    goldNumbers.push((special * 2) % 49 || 49);
    
    return [...new Set(goldNumbers.filter(n => n >= 1 && n <= 49 && n !== special))];
  }

  private static calculateOmissionScores(history: DbRecord[], period: number): Record<number, number> {
    const omissionMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    for (let i = 1; i <= 49; i++) {
      omissionMap[i] = period;
    }
    
    for (let i = 0; i < Math.min(period, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      nums.forEach(num => {
        omissionMap[num] = i;
      });
    }
    
    for (let num = 1; num <= 49; num++) {
      const omission = omissionMap[num];
      
      if (omission >= period * 0.8) {
        scores[num] = 25;
      } else if (omission >= period * 0.6) {
        scores[num] = 20;
      } else if (omission >= period * 0.4) {
        scores[num] = 15;
      } else if (omission >= period * 0.2) {
        scores[num] = 10;
      } else if (omission >= period * 0.1) {
        scores[num] = 5;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  private static calculateSeasonalScores(month: number, week: number): Record<string, number> {
    const scores: Record<string, number> = {};
    const season = this.getSeasonByMonth(month);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      if (seasonalZodiacs.includes(zodiac)) {
        scores[zodiac] = 20;
      } else {
        scores[zodiac] = 0;
      }
    });
    
    return scores;
  }

  private static analyzePrimeDistribution(history: DbRecord[]) {
    let primeCount = 0;
    let totalNumbers = 0;
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      totalNumbers += nums.length;
      primeCount += nums.filter(n => this.PRIME_NUMBERS.includes(n)).length;
    });
    
    const primeRatio = primeCount / totalNumbers;
    const expectedRatio = this.PRIME_NUMBERS.length / 49;
    
    return {
      currentRatio: primeRatio,
      expectedRatio,
      needMorePrimes: primeRatio < expectedRatio * 0.9,
      needMoreComposites: primeRatio > expectedRatio * 1.1
    };
  }

  private static analyzeSumPatterns(history: DbRecord[], lastSum: number) {
    const sums: number[] = [];
    const sumTails: number[] = [];
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      sums.push(sum);
      sumTails.push(sum % 10);
    });
    
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const stdSum = Math.sqrt(sums.reduce((sq, n) => sq + Math.pow(n - avgSum, 2), 0) / sums.length);
    
    const lastParity = lastSum % 2;
    const parityCounts = sumTails.reduce((counts, tail) => {
      counts[tail % 2]++;
      return counts;
    }, [0, 0]);
    
    const parityTrend = parityCounts[lastParity] > parityCounts[1 - lastParity] ? 'same' : 'alternate';
    
    return {
      getScore: (simulatedSum: number) => {
        let score = 0;
        
        if (simulatedSum >= avgSum - stdSum && simulatedSum <= avgSum + stdSum) {
          score += 15;
        }
        
        if ((parityTrend === 'same' && (simulatedSum % 2) === lastParity) ||
            (parityTrend === 'alternate' && (simulatedSum % 2) !== lastParity)) {
          score += 10;
        }
        
        return score;
      }
    };
  }

  private static calculatePositionScores(recentHistory: DbRecord[]): Record<number, number> {
    const positionStats: Record<number, Record<number, number>> = {};
    const scores: Record<number, number> = {};
    
    for (let i = 1; i <= 49; i++) {
      positionStats[i] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    }
    
    recentHistory.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, index) => {
        const position = index + 1;
        if (positionStats[num]) {
          positionStats[num][position]++;
        }
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      const positions = positionStats[num];
      const total = Object.values(positions).reduce((a, b) => a + b, 0);
      
      if (total > 0) {
        const specialScore = positions[7] * 3;
        const normalScore = (total - positions[7]) * 1;
        scores[num] = specialScore + normalScore;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  private static calculateFrequencyScores(recentHistory: DbRecord[]): Record<number, number> {
    const frequencyMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    const maxFreq = Math.max(...Object.values(frequencyMap));
    const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Object.keys(frequencyMap).length;
    
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap[num] || 0;
      
      if (freq > avgFreq * 1.5) {
        scores[num] = 15;
      } else if (freq < avgFreq * 0.5) {
        scores[num] = 12;
      } else if (freq === 0) {
        scores[num] = 20;
      } else {
        scores[num] = Math.min((freq / maxFreq) * 10, 10);
      }
    }
    
    return scores;
  }

  private static calculateClusterScores(lastDraw: number[], history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const recentNumbers: number[] = [];
    history.slice(0, 10).forEach(rec => {
      recentNumbers.push(...this.parseNumbers(rec.open_code));
    });
    
    for (let num = 1; num <= 49; num++) {
      let totalDistance = 0;
      let count = 0;
      
      lastDraw.forEach(n => {
        totalDistance += Math.abs(num - n);
        count++;
      });
      
      const recentAvg = recentNumbers.reduce((a, b) => a + b, 0) / recentNumbers.length;
      totalDistance += Math.abs(num - recentAvg) * 2;
      count += 2;
      
      const avgDistance = totalDistance / count;
      scores[num] = Math.max(0, 20 - avgDistance);
    }
    
    return scores;
  }

  private static calculateSymmetryScores(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const symmetryMap: Record<number, number> = {};
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        const symmetricNum = 50 - num;
        if (symmetricNum >= 1 && symmetricNum <= 49) {
          symmetryMap[symmetricNum] = (symmetryMap[symmetricNum] || 0) + 1;
        }
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      lastDraw.forEach(n => {
        if (50 - n === num) {
          score += 15;
        }
      });
      
      const symmetricNum = 50 - num;
      if (symmetryMap[num] && symmetryMap[num] > 0) {
        score += symmetryMap[num] * 2;
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  private static calculatePeriodicScores(history: DbRecord[], currentWeek: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const periodMap: Record<number, number[]> = {};
    
    for (let i = 1; i <= 49; i++) {
      periodMap[i] = [];
    }
    
    history.forEach((rec, index) => {
      const weekNum = Math.floor(index / 7) + 1;
      this.parseNumbers(rec.open_code).forEach(num => {
        periodMap[num].push(weekNum);
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      const appearances = periodMap[num];
      if (appearances.length < 3) {
        scores[num] = 0;
        continue;
      }
      
      let totalInterval = 0;
      for (let i = 1; i < appearances.length; i++) {
        totalInterval += appearances[i] - appearances[i-1];
      }
      const avgInterval = totalInterval / (appearances.length - 1);
      
      const lastAppearance = appearances[appearances.length - 1];
      const expectedAppearance = lastAppearance + avgInterval;
      
      if (Math.abs(currentWeek - expectedAppearance) <= 1) {
        scores[num] = 20;
      } else if (currentWeek > expectedAppearance) {
        scores[num] = 15;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  private static calculateTrendScores(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const trendMap: Record<number, {count: number, lastPositions: number[]}> = {};
    
    for (let i = 1; i <= 49; i++) {
      trendMap[i] = { count: 0, lastPositions: [] };
    }
    
    const recentHistory = history.slice(0, 20);
    recentHistory.forEach((rec, drawIndex) => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, position) => {
        const pos = position + 1;
        trendMap[num].count++;
        trendMap[num].lastPositions.push(drawIndex * 10 + pos);
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      const data = trendMap[num];
      if (data.lastPositions.length < 2) {
        scores[num] = 0;
        continue;
      }
      
      let totalDiff = 0;
      for (let i = 1; i < data.lastPositions.length; i++) {
        totalDiff += data.lastPositions[i] - data.lastPositions[i-1];
      }
      const avgDiff = totalDiff / (data.lastPositions.length - 1);
      
      if (avgDiff > 0) {
        scores[num] = 15;
      } else if (avgDiff < 0) {
        scores[num] = 10;
      } else {
        scores[num] = 5;
      }
      
      if (data.count >= 3) {
        scores[num] += 5;
      }
    }
    
    return scores;
  }

  private static analyzeHeadPatterns(history: DbRecord[], lastHead: number, weekday: number): {
    getScore: (head: number, num: number) => number;
  } {
    const headStats: Record<number, {count: number, lastAppearance: number, trends: number[]}> = {};
    
    for (let head = 0; head <= 4; head++) {
      headStats[head] = { count: 0, lastAppearance: 0, trends: [] };
    }
    
    history.forEach((rec, index) => {
      const nums = this.parseNumbers(rec.open_code);
      const headsInDraw = nums.map(num => Math.floor(num / 10));
      
      headsInDraw.forEach(head => {
        headStats[head].count++;
        headStats[head].lastAppearance = index;
        headStats[head].trends.push(index);
      });
    });
    
    const headOmission: Record<number, number> = {};
    for (let head = 0; head <= 4; head++) {
      headOmission[head] = headStats[head].lastAppearance;
    }
    
    const headEntries = Object.entries(headStats);
    const hotHeads = headEntries
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)
      .map(([head]) => parseInt(head));
    
    const coldHeads = headEntries
      .sort((a, b) => a[1].count - b[1].count)
      .slice(0, 2)
      .map(([head]) => parseInt(head));
    
    const weekdayPatterns: Record<number, number[]> = {
      0: [0, 3],
      1: [1, 4],
      2: [2, 0],
      3: [3, 1],
      4: [4, 2],
      5: [0, 3],
      6: [1, 4]
    };
    
    const weekdayHeads = weekdayPatterns[weekday] || [0, 1, 2, 3, 4];
    
    return {
      getScore: (head: number, num: number): number => {
        let score = 0;
        
        if (hotHeads.includes(head)) score += 15;
        
        if (coldHeads.includes(head)) score += 12;
        
        if (head !== lastHead) score += 10;
        
        if (weekdayHeads.includes(head)) score += 8;
        
        const omission = headOmission[head] || 0;
        if (omission > 10) score += omission * 0.5;
        
        if (num >= 40 && head === 4) score += 5;
        if (num <= 9 && head === 0) score += 5;
        
        return Math.min(score, 25);
      }
    };
  }

  private static analyzeTailPatterns(history: DbRecord[], lastTail: number, day: number): {
    getScore: (tail: number, num: number) => number;
  } {
    const tailStats: Record<number, {count: number, lastAppearance: number, trends: number[]}> = {};
    
    for (let tail = 0; tail <= 9; tail++) {
      tailStats[tail] = { count: 0, lastAppearance: 0, trends: [] };
    }
    
    history.forEach((rec, index) => {
      const nums = this.parseNumbers(rec.open_code);
      const tailsInDraw = nums.map(num => num % 10);
      
      tailsInDraw.forEach(tail => {
        tailStats[tail].count++;
        tailStats[tail].lastAppearance = index;
        tailStats[tail].trends.push(index);
      });
    });
    
    const tailOmission: Record<number, number> = {};
    for (let tail = 0; tail <= 9; tail++) {
      tailOmission[tail] = tailStats[tail].lastAppearance;
    }
    
    const tailEntries = Object.entries(tailStats);
    const hotTails = tailEntries
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([tail]) => parseInt(tail));
    
    const coldTails = tailEntries
      .sort((a, b) => a[1].count - b[1].count)
      .slice(0, 3)
      .map(([tail]) => parseInt(tail));
    
    const datePattern = day % 10;
    
    return {
      getScore: (tail: number, num: number): number => {
        let score = 0;
        
        if (hotTails.includes(tail)) score += 15;
        
        if (coldTails.includes(tail)) score += 12;
        
        if (tail !== lastTail) score += 8;
        
        if (tail === datePattern) score += 8;
        if (tail === (datePattern + 5) % 10) score += 6;
        
        const omission = tailOmission[tail] || 0;
        if (omission > 8) score += omission * 0.6;
        
        if (tail === 0 && num % 10 === 0) score += 5;
        
        return Math.min(score, 25);
      }
    };
  }

  private static calculateCorrelationScores(recentHistory: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const correlationMap: Record<number, Record<number, number>> = {};
    
    for (let i = 1; i <= 49; i++) {
      correlationMap[i] = {};
    }
    
    recentHistory.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const a = nums[i];
          const b = nums[j];
          
          correlationMap[a][b] = (correlationMap[a][b] || 0) + 1;
          correlationMap[b][a] = (correlationMap[b][a] || 0) + 1;
        }
      }
    });
    
    for (let num = 1; num <= 49; num++) {
      let totalCorrelation = 0;
      let correlationCount = 0;
      
      lastDraw.forEach(lastNum => {
        if (correlationMap[num][lastNum]) {
          totalCorrelation += correlationMap[num][lastNum];
          correlationCount++;
        }
      });
      
      if (correlationCount > 0) {
        scores[num] = Math.min(totalCorrelation / correlationCount * 3, 20);
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  private static analyzePropertyPatterns(history: DbRecord[], lastSpecial: number): {
    getScore: (stat: NumberStat) => number;
  } {
    const sizeHistory: string[] = [];
    const parityHistory: string[] = [];
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const special = nums[nums.length - 1];
      
      sizeHistory.push(this.NUM_TO_SIZE[special]);
      parityHistory.push(this.NUM_TO_PARITY[special]);
    });
    
    const lastSize = this.NUM_TO_SIZE[lastSpecial];
    const lastParity = this.NUM_TO_PARITY[lastSpecial];
    
    const sizeContinuity = this.calculateContinuity(sizeHistory, lastSize);
    const parityContinuity = this.calculateContinuity(parityHistory, lastParity);
    
    const sizeBalance = this.calculateBalance(sizeHistory, ['small', 'large']);
    const parityBalance = this.calculateBalance(parityHistory, ['odd', 'even']);
    
    return {
      getScore: (stat: NumberStat): number => {
        let score = 0;
        
        if (sizeContinuity === 'continue' && stat.size === lastSize) {
          score += 12;
        } else if (sizeContinuity === 'alternate' && stat.size !== lastSize) {
          score += 12;
        }
        
        if (sizeBalance === 'needSmall' && stat.size === 'small') {
          score += 8;
        } else if (sizeBalance === 'needLarge' && stat.size === 'large') {
          score += 8;
        }
        
        if (parityContinuity === 'continue' && stat.parity === lastParity) {
          score += 10;
        } else if (parityContinuity === 'alternate' && stat.parity !== lastParity) {
          score += 10;
        }
        
        if (parityBalance === 'needOdd' && stat.parity === 'odd') {
          score += 6;
        } else if (parityBalance === 'needEven' && stat.parity === 'even') {
          score += 6;
        }
        
        const primeHistory = history.map(rec => {
          const nums = this.parseNumbers(rec.open_code);
          const special = nums[nums.length - 1];
          return this.NUM_TO_PRIME[special];
        });
        
        const primeContinuity = this.calculateContinuity(primeHistory.map(p => p ? 'prime' : 'composite'), 
          this.NUM_TO_PRIME[lastSpecial] ? 'prime' : 'composite');
        
        if (primeContinuity === 'continue' && stat.prime === this.NUM_TO_PRIME[lastSpecial]) {
          score += 8;
        } else if (primeContinuity === 'alternate' && stat.prime !== this.NUM_TO_PRIME[lastSpecial]) {
          score += 8;
        }
        
        return Math.min(score, 25);
      }
    };
  }

  private static calculateTimePatternScores(
    weekday: number, 
    monthPeriod: 'early' | 'middle' | 'late', 
    day: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const weekdayPattern = this.TIME_PATTERNS.weekday[weekday];
    const monthPeriodPattern = this.TIME_PATTERNS.monthPeriod[monthPeriod];
    
    const dayPattern = {
      tails: [day % 10, (day % 10 + 5) % 10],
      heads: [Math.floor(day / 10), (Math.floor(day / 10) + 1) % 5]
    };
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      if (weekdayPattern.zodiacs.includes(this.NUM_TO_ZODIAC[num])) {
        score += 8;
      }
      
      if (weekdayPattern.tails.includes(num % 10)) {
        score += 6;
      }
      
      if (weekdayPattern.clusters.includes(this.NUM_TO_CLUSTER[num])) {
        score += 7;
      }
      
      if (monthPeriodPattern.heads.includes(Math.floor(num / 10))) {
        score += 7;
      }
      
      if (monthPeriodPattern.waves.includes(this.getNumWave(num))) {
        score += 7;
      }
      
      if (monthPeriodPattern.clusters.includes(this.NUM_TO_CLUSTER[num])) {
        score += 6;
      }
      
      if (dayPattern.tails.includes(num % 10)) {
        score += 5;
      }
      
      if (dayPattern.heads.includes(Math.floor(num / 10))) {
        score += 5;
      }
      
      if (day === 1 && num % 10 === 1) score += 4;
      if (day === 15 && (num === 15 || num === 25 || num === 35 || num === 45)) score += 4;
      if (day === 30 && num % 10 === 0) score += 4;
      
      scores[num] = score;
    }
    
    return scores;
  }

  private static analyzeSeriesPatterns(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const seriesPatterns: {
      type: 'double' | 'triple' | 'quad';
      numbers: number[];
      nextNumbers: number[];
    }[] = [];
    
    for (let i = 0; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code).sort((a, b) => a - b);
      const nextNums = this.parseNumbers(history[i+1].open_code);
      
      const seriesInCurrent = this.detectSeries(currentNums);
      
      if (seriesInCurrent.length > 0) {
        seriesPatterns.push({
          type: seriesInCurrent[0].type,
          numbers: seriesInCurrent[0].numbers,
          nextNumbers: nextNums
        });
      }
    }
    
    const sortedLastDraw = [...lastDraw].sort((a, b) => a - b);
    const lastSeries = this.detectSeries(sortedLastDraw);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      seriesPatterns.forEach(pattern => {
        if (lastSeries.length > 0 && pattern.numbers.length === lastSeries[0].numbers.length) {
          if (pattern.nextNumbers.includes(num)) {
            score += 10;
          }
        }
      });
      
      if (lastSeries.length > 0) {
        const lastSeriesNumbers = lastSeries[0].numbers;
        
        for (const seriesNum of lastSeriesNumbers) {
          if (Math.abs(num - seriesNum) === 1) {
            score += 12;
          }
        }
        
        const minSeries = Math.min(...lastSeriesNumbers);
        const maxSeries = Math.max(...lastSeriesNumbers);
        
        if (num >= minSeries - 2 && num <= maxSeries + 2 && !lastSeriesNumbers.includes(num)) {
          score += 8;
        }
      }
      
      const seriesFrequency = this.analyzeSeriesFrequency(history, num);
      score += seriesFrequency * 2;
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static analyzeSumZonePatterns(history: DbRecord[], lastSum: number): {
    getScore: (simulatedSum: number) => number;
  } {
    const sumZoneHistory: string[] = [];
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      const zone = this.getSumZone(sum);
      sumZoneHistory.push(zone);
    });
    
    const lastZone = this.getSumZone(lastSum);
    const zoneContinuity = this.calculateContinuity(sumZoneHistory, lastZone);
    
    const zoneBalance = this.calculateBalance(sumZoneHistory, ['small', 'medium', 'large']);
    
    return {
      getScore: (simulatedSum: number): number => {
        let score = 0;
        const simulatedZone = this.getSumZone(simulatedSum);
        
        if (zoneContinuity === 'continue' && simulatedZone === lastZone) {
          score += 10;
        } else if (zoneContinuity === 'alternate' && simulatedZone !== lastZone) {
          score += 10;
        }
        
        if (zoneBalance === 'needSmall' && simulatedZone === 'small') {
          score += 8;
        } else if (zoneBalance === 'needMedium' && simulatedZone === 'medium') {
          score += 8;
        } else if (zoneBalance === 'needLarge' && simulatedZone === 'large') {
          score += 8;
        }
        
        const zoneTransitions = this.analyzeZoneTransitions(sumZoneHistory);
        const transitionProb = zoneTransitions[lastZone]?.[simulatedZone] || 0;
        score += transitionProb * 12;
        
        return Math.min(score, 20);
      }
    };
  }

  private static calculateElementRelationScores(recentHistory: DbRecord[], lastSpecial: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastElement = this.NUM_TO_WUXING[lastSpecial];
    
    if (!lastElement) {
      for (let num = 1; num <= 49; num++) scores[num] = 0;
      return scores;
    }
    
    const elementCycle = this.WU_XING_CYCLE[lastElement];
    
    const elementHistory: string[] = [];
    recentHistory.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const special = nums[nums.length - 1];
      elementHistory.push(this.NUM_TO_WUXING[special]);
    });
    
    const elementBalance = this.calculateElementBalance(elementHistory);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      const currentElement = this.NUM_TO_WUXING[num];
      
      if (elementCycle.sheng === currentElement) {
        score += 15;
      }
      
      if (elementCycle.ke === currentElement) {
        score += 8;
      }
      
      if (elementCycle.sheng_by === currentElement) {
        score += 10;
      }
      
      if (elementCycle.ke_by === currentElement) {
        score += 12;
      }
      
      if (elementBalance.weakElement === currentElement) {
        score += 10;
      }
      
      if (elementBalance.strongElement === currentElement) {
        score -= 5;
      }
      
      if (currentElement === lastElement) {
        score += 6;
      }
      
      scores[num] = Math.max(score, 0);
    }
    
    return scores;
  }

  private static calculateMatrixCoordinateScores(
    history: DbRecord[], 
    lastMatrix: {row: number, col: number},
    weekday: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const rowHistory: number[] = [];
    const colHistory: number[] = [];
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        const matrix = this.NUM_TO_MATRIX[num];
        rowHistory.push(matrix.row);
        colHistory.push(matrix.col);
      });
    });
    
    const rowAvg = rowHistory.reduce((a, b) => a + b, 0) / rowHistory.length;
    const colAvg = colHistory.reduce((a, b) => a + b, 0) / colHistory.length;
    
    const rowContinuity = this.calculateContinuity(rowHistory.slice(-10), lastMatrix.row);
    const colContinuity = this.calculateContinuity(colHistory.slice(-10), lastMatrix.col);
    
    const weekdayMatrixPatterns: Record<number, {rows: number[], cols: number[]}> = {
      0: {rows: [1, 4, 7], cols: [2, 5]},
      1: {rows: [2, 5], cols: [3, 6]},
      2: {rows: [3, 6], cols: [1, 4]},
      3: {rows: [1, 4], cols: [2, 5]},
      4: {rows: [2, 5], cols: [3, 6]},
      5: {rows: [3, 6], cols: [1, 4]},
      6: {rows: [1, 7], cols: [4, 7]}
    };
    
    const weekdayPattern = weekdayMatrixPatterns[weekday] || {rows: [1,2,3,4,5,6,7], cols: [1,2,3,4,5,6,7]};
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      const matrix = this.NUM_TO_MATRIX[num];
      
      const rowDist = Math.abs(matrix.row - rowAvg);
      const colDist = Math.abs(matrix.col - colAvg);
      if (rowDist <= 1 && colDist <= 1) score += 10;
      
      if (rowContinuity === 'continue' && matrix.row === lastMatrix.row) score += 8;
      if (colContinuity === 'continue' && matrix.col === lastMatrix.col) score += 8;
      
      if (rowContinuity === 'alternate' && matrix.row !== lastMatrix.row) score += 6;
      if (colContinuity === 'alternate' && matrix.col !== lastMatrix.col) score += 6;
      
      if (weekdayPattern.rows.includes(matrix.row)) score += 7;
      if (weekdayPattern.cols.includes(matrix.col)) score += 7;
      
      if (matrix.row === matrix.col) score += 5;
      if (matrix.row + matrix.col === 8) score += 5;
      
      if (matrix.row >= 3 && matrix.row <= 5 && matrix.col >= 3 && matrix.col <= 5) {
        score += 6;
      }
      
      const rowDiff = Math.abs(matrix.row - lastMatrix.row);
      const colDiff = Math.abs(matrix.col - lastMatrix.col);
      
      if (rowDiff === 1 && colDiff === 1) score += 8;
      if (rowDiff === 0 && colDiff === 1) score += 7;
      if (rowDiff === 1 && colDiff === 0) score += 7;
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static calculateLatticeDistributionScores(
    history: DbRecord[], 
    lastSpecial: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const latticePatterns = {
      fibonacci: this.LATTICE_PATTERNS.fibonacci,
      goldenRatio: this.LATTICE_PATTERNS.goldenRatio,
      arithmetic: this.LATTICE_PATTERNS.arithmetic,
      geometric: this.LATTICE_PATTERNS.geometric
    };
    
    const patternCounts: Record<string, number> = {};
    Object.keys(latticePatterns).forEach(pattern => {
      patternCounts[pattern] = 0;
    });
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        Object.entries(latticePatterns).forEach(([pattern, patternNums]) => {
          if ((patternNums as number[]).includes(num)) {
            patternCounts[pattern]++;
          }
        });
      });
    });
    
    const sortedPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([pattern]) => pattern);
    
    const lastSpecialPatterns: string[] = [];
    Object.entries(latticePatterns).forEach(([pattern, patternNums]) => {
      if ((patternNums as number[]).includes(lastSpecial)) {
        lastSpecialPatterns.push(pattern);
      }
    });
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      sortedPatterns.forEach(pattern => {
        if ((latticePatterns[pattern as keyof typeof latticePatterns] as number[]).includes(num)) {
          score += 12;
        }
      });
      
      lastSpecialPatterns.forEach(pattern => {
        if ((latticePatterns[pattern as keyof typeof latticePatterns] as number[]).includes(num)) {
          score += 10;
        }
      });
      
      if (lastSpecialPatterns.length === 0) {
        Object.values(latticePatterns).forEach(patternNums => {
          if ((patternNums as number[]).includes(num)) {
            score += 8;
          }
        });
      }
      
      if (latticePatterns.goldenRatio.includes(num)) {
        score += 6;
      }
      
      if (latticePatterns.fibonacci.includes(num)) {
        score += 5;
      }
      
      if (latticePatterns.arithmetic.includes(num)) {
        const arithmeticIndex = latticePatterns.arithmetic.indexOf(num);
        if (arithmeticIndex > 0) {
          const prevInSequence = latticePatterns.arithmetic[arithmeticIndex - 1];
          if (prevInSequence === lastSpecial) {
            score += 9;
          }
        }
      }
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static analyzeChaosPatterns(
    history: DbRecord[], 
    lastSpecial: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const trajectory: number[] = [];
    history.slice(0, 20).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const special = nums[nums.length - 1];
      trajectory.push(special);
    });
    
    const lyapunovExponent = this.calculateLyapunovExponent(trajectory);
    const phaseSpace = this.reconstructPhaseSpace(trajectory, 3);
    const strangeAttractor = this.analyzeStrangeAttractor(phaseSpace);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      if (lyapunovExponent > 0) {
        const predicted = this.chaoticPrediction(trajectory, num);
        score += predicted * 8;
      }
      
      const phaseScore = this.phaseSpaceScore(phaseSpace, num, lastSpecial);
      score += phaseScore * 6;
      
      if (strangeAttractor.attractorNumbers.includes(num)) {
        score += 12;
      }
      
      const chaosEdgeScore = this.chaosEdgeAnalysis(trajectory, num);
      score += chaosEdgeScore * 4;
      
      const deterministicChaosScore = this.deterministicChaosPattern(trajectory, num);
      score += deterministicChaosScore * 5;
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static calculateFractalDimensionScores(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const fractalPatterns = {
      mandelbrot: this.FRACTAL_PATTERNS.mandelbrot,
      julia: this.FRACTAL_PATTERNS.julia,
      sierpinski: this.FRACTAL_PATTERNS.sierpinski
    };
    
    const historyNumbers: number[] = [];
    history.forEach(rec => {
      historyNumbers.push(...this.parseNumbers(rec.open_code));
    });
    
    const boxDimension = this.calculateBoxDimension(historyNumbers);
    const selfSimilarity = this.analyzeSelfSimilarity(historyNumbers);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      Object.values(fractalPatterns).forEach(pattern => {
        if ((pattern as number[]).includes(num)) {
          score += 8;
        }
      });
      
      const dimensionScore = this.fractalDimensionScore(boxDimension, num, historyNumbers);
      score += dimensionScore * 6;
      
      if (selfSimilarity.similarNumbers.includes(num)) {
        score += 10;
      }
      
      const iterationScore = this.fractalIterationPattern(num, history);
      score += iterationScore * 5;
      
      const boundaryScore = this.fractalBoundaryAnalysis(num, historyNumbers);
      score += boundaryScore * 4;
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static analyzeEntropyPatterns(
    history: DbRecord[], 
    lastSpecial: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const entropy = this.calculateInformationEntropy(history);
    const entropyTrend = this.analyzeEntropyTrend(history);
    const maxEntropyNumbers = this.maxEntropyAnalysis(history);
    const minEntropyNumbers = this.minEntropyAnalysis(history);
    const entropyChange = this.entropyChangeAnalysis(history);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      if (entropy > 3.5 && maxEntropyNumbers.includes(num)) {
        score += 12;
      }
      
      if (entropy < 2.5 && minEntropyNumbers.includes(num)) {
        score += 15;
      }
      
      if (entropyChange === 'increasing' && maxEntropyNumbers.includes(num)) {
        score += 8;
      }
      
      if (entropyChange === 'decreasing' && minEntropyNumbers.includes(num)) {
        score += 10;
      }
      
      const balanceScore = this.entropyBalanceScore(num, history, entropy);
      score += balanceScore * 5;
      
      const informationGain = this.informationGainAnalysis(num, history, lastSpecial);
      score += informationGain * 6;
      
      scores[num] = Math.min(score, 25);
    }
    
    return scores;
  }

  private static calculateDeterministicCoreScores(
    history: DbRecord[], 
    lastSpecial: number,
    currentWeek: number
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    const deterministicPatterns = {
      primeSpiral: this.DETERMINISTIC_PATTERNS.primeSpiral,
      ulamSpiral: this.DETERMINISTIC_PATTERNS.ulamSpiral,
      magicSquare: this.DETERMINISTIC_PATTERNS.magicSquare
    };
    
    const patternFrequencies: Record<string, number> = {};
    Object.keys(deterministicPatterns).forEach(pattern => {
      patternFrequencies[pattern] = 0;
    });
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        Object.entries(deterministicPatterns).forEach(([pattern, patternNums]) => {
          if ((patternNums as number[]).includes(num)) {
            patternFrequencies[pattern]++;
          }
        });
      });
    });
    
    const mostDeterministicPatterns = Object.entries(patternFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([pattern]) => pattern);
    
    const deterministicTransitions = this.analyzeDeterministicTransitions(history);
    const coreStability = this.analyzeCoreStability(history);
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      mostDeterministicPatterns.forEach(pattern => {
        if ((deterministicPatterns[pattern as keyof typeof deterministicPatterns] as number[]).includes(num)) {
          score += 15;
        }
      });
      
      if (deterministicTransitions[lastSpecial]?.includes(num)) {
        score += 12;
      }
      
      if (coreStability.stableNumbers.includes(num)) {
        score += 10;
      }
      
      if (deterministicPatterns.primeSpiral.includes(num)) {
        const spiralScore = this.primeSpiralAnalysis(num, lastSpecial, currentWeek);
        score += spiralScore;
      }
      
      if (deterministicPatterns.ulamSpiral.includes(num)) {
        const ulamScore = this.ulamSpiralAnalysis(num, history);
        score += ulamScore;
      }
      
      if (deterministicPatterns.magicSquare.includes(num)) {
        const magicSquareScore = this.magicSquareAnalysis(num, history);
        score += magicSquareScore;
      }
      
      const convergenceScore = this.deterministicConvergence(num, history);
      score += convergenceScore * 4;
      
      scores[num] = Math.min(score, 30);
    }
    
    return scores;
  }

  private static calculateHeadRecommendations(
    history: DbRecord[], 
    selectedNumbers: NumberStat[], 
    lastHead: number,
    weekday: number
  ): string[] {
    const selectedHeads: Record<number, number> = {};
    selectedNumbers.forEach(s => {
      selectedHeads[s.head] = (selectedHeads[s.head] || 0) + 1;
    });
    
    const headFrequency: Record<number, number> = {};
    history.slice(0, 30).forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const head = Math.floor(num / 10);
        headFrequency[head] = (headFrequency[head] || 0) + 1;
      });
    });
    
    const headOmission: Record<number, number> = {};
    for (let head = 0; head <= 4; head++) {
      headOmission[head] = 30;
    }
    
    history.forEach((rec, index) => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const head = Math.floor(num / 10);
        headOmission[head] = Math.min(headOmission[head], index);
      });
    });
    
    const headScores: {head: number, score: number}[] = [];
    for (let head = 0; head <= 4; head++) {
      let score = 0;
      
      score += (selectedHeads[head] || 0) * 20;
      
      const freq = headFrequency[head] || 0;
      const avgFreq = Object.values(headFrequency).reduce((a, b) => a + b, 0) / 5;
      if (Math.abs(freq - avgFreq) < avgFreq * 0.3) {
        score += 15;
      }
      
      const omission = headOmission[head] || 30;
      score += Math.min(omission * 2, 20);
      
      if (head !== lastHead) score += 15;
      
      const weekdayPatterns: Record<number, number[]> = {
        0: [0, 3], 1: [1, 4], 2: [2, 0], 3: [3, 1], 
        4: [4, 2], 5: [0, 3], 6: [1, 4]
      };
      if (weekdayPatterns[weekday]?.includes(head)) score += 12;
      
      headScores.push({head, score});
    }
    
    headScores.sort((a, b) => b.score - a.score);
    
    const recommendations: number[] = [];
    const selectedSet = new Set<number>();
    
    for (const {head} of headScores) {
      if (recommendations.length < 3 && !selectedSet.has(head)) {
        if (head !== lastHead) {
          recommendations.push(head);
          selectedSet.add(head);
        }
      }
    }
    
    if (recommendations.length < 2) {
      for (const {head} of headScores) {
        if (!recommendations.includes(head) && recommendations.length < 3) {
          recommendations.push(head);
        }
      }
    }
    
    return recommendations.sort().map(h => h.toString());
  }

  private static calculateTailRecommendations(
    history: DbRecord[], 
    selectedNumbers: NumberStat[], 
    lastTail: number,
    day: number
  ): string[] {
    const selectedTails: Record<number, number> = {};
    selectedNumbers.forEach(s => {
      selectedTails[s.tail] = (selectedTails[s.tail] || 0) + 1;
    });
    
    const tailScores: { tail: number, score: number }[] = [];
    for (let tail = 0; tail <= 9; tail++) {
      let score = 0;
      score += (selectedTails[tail] || 0) * 8;
      if (tail === day % 10) score += 20;
      if (tail === (day + 5) % 10) score += 10;
      if (tail % 2 !== lastTail % 2) score += 12;

      tailScores.push({ tail, score });
    }

    return tailScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(t => t.tail.toString());
  }

  // ==========================================
  // 辅助方法
  // ==========================================

  private static calculateLyapunovExponent(trajectory: number[]): number {
    if (trajectory.length < 4) return 0;
    
    let sum = 0;
    const count = Math.min(10, trajectory.length - 3);
    
    for (let i = 0; i < count; i++) {
      const delta1 = Math.abs(trajectory[i+1] - trajectory[i]);
      const delta2 = Math.abs(trajectory[i+2] - trajectory[i+1]);
      
      if (delta1 > 0 && delta2 > 0) {
        sum += Math.log(delta2 / delta1);
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  private static reconstructPhaseSpace(trajectory: number[], dimension: number): number[][] {
    const phaseSpace: number[][] = [];
    
    for (let i = 0; i <= trajectory.length - dimension; i++) {
      phaseSpace.push(trajectory.slice(i, i + dimension));
    }
    
    return phaseSpace;
  }

  private static analyzeStrangeAttractor(phaseSpace: number[][]): {
    attractorNumbers: number[];
    dimension: number;
  } {
    const attractorNumbers: number[] = [];
    
    if (phaseSpace.length === 0) {
      return { attractorNumbers: [], dimension: 0 };
    }
    
    const pointCounts: Record<string, number> = {};
    
    phaseSpace.forEach(point => {
      const key = point.join(',');
      pointCounts[key] = (pointCounts[key] || 0) + 1;
    });
    
    const sortedPoints = Object.entries(pointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedPoints.forEach(([key]) => {
      const numbers = key.split(',').map(Number);
      attractorNumbers.push(...numbers);
    });
    
    const uniqueNumbers = [...new Set(attractorNumbers)];
    
    return {
      attractorNumbers: uniqueNumbers,
      dimension: phaseSpace[0]?.length || 0
    };
  }

  private static chaoticPrediction(trajectory: number[], num: number): number {
    if (trajectory.length < 3) return 0;
    
    const r = 3.9;
    const last = trajectory[trajectory.length - 1] / 49;
    const predicted = r * last * (1 - last) * 49;
    
    const distance = Math.abs(num - predicted);
    
    if (distance <= 5) return 8;
    if (distance <= 10) return 5;
    if (distance <= 15) return 3;
    
    return 0;
  }

  private static phaseSpaceScore(phaseSpace: number[][], num: number, lastSpecial: number): number {
    if (phaseSpace.length === 0) return 0;
    
    let score = 0;
    
    phaseSpace.forEach(point => {
      if (point.includes(num)) {
        score += 3;
      }
    });
    
    const lastPoint = phaseSpace[phaseSpace.length - 1];
    if (lastPoint && lastPoint.includes(lastSpecial)) {
      const otherPoints = phaseSpace.filter(point => 
        point.includes(lastSpecial) && point.includes(num)
      );
      
      if (otherPoints.length > 0) {
        score += 6;
      }
    }
    
    return Math.min(score, 10);
  }

  private static chaosEdgeAnalysis(trajectory: number[], num: number): number {
    let totalFluctuation = 0;
    for (let i = 1; i < trajectory.length; i++) {
      totalFluctuation += Math.abs(trajectory[i] - trajectory[i-1]);
    }
    
    const avgFluctuation = totalFluctuation / (trajectory.length - 1);
    
    if (avgFluctuation >= 15 && avgFluctuation <= 30) {
      const minHistory = Math.min(...trajectory);
      const maxHistory = Math.max(...trajectory);
      
      if (num >= minHistory && num <= maxHistory) {
        return 8;
      }
    }
    
    return 0;
  }

  private static deterministicChaosPattern(trajectory: number[], num: number): number {
    if (trajectory.length < 5) return 0;
    
    let autocorrelation = 0;
    const lag = 2;
    
    for (let i = 0; i < trajectory.length - lag; i++) {
      if (trajectory[i] === num) {
        if (trajectory[i + lag] === num) {
          autocorrelation++;
        }
      }
    }
    
    if (autocorrelation > 0) {
      return 6;
    }
    
    return 0;
  }

  private static calculateBoxDimension(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const boxes = 7;
    const boxSize = 49 / boxes;
    
    let filledBoxes = 0;
    const boxGrid: boolean[][] = Array(boxes).fill(0).map(() => Array(boxes).fill(false));
    
    numbers.forEach(num => {
      const boxRow = Math.floor((num - 1) / boxSize);
      const boxCol = Math.floor(((num - 1) % 49) / boxSize);
      
      if (!boxGrid[boxRow][boxCol]) {
        boxGrid[boxRow][boxCol] = true;
        filledBoxes++;
      }
    });
    
    return filledBoxes > 0 ? Math.log(filledBoxes) / Math.log(boxes) : 0;
  }

  private static analyzeSelfSimilarity(numbers: number[]): {
    similarNumbers: number[];
    similarityScore: number;
  } {
    const similarNumbers: number[] = [];
    
    numbers.forEach(num => {
      const digitSum = this.sumDigits(num);
      
      for (let otherNum = 1; otherNum <= 49; otherNum++) {
        if (otherNum !== num && this.sumDigits(otherNum) === digitSum) {
          similarNumbers.push(otherNum);
        }
      }
    });
    
    const uniqueNumbers = [...new Set(similarNumbers)];
    
    return {
      similarNumbers: uniqueNumbers,
      similarityScore: uniqueNumbers.length > 0 ? 1.0 : 0
    };
  }

  private static fractalDimensionScore(
    boxDimension: number, 
    num: number, 
    historyNumbers: number[]
  ): number {
    if (boxDimension === 0) return 0;
    
    if (boxDimension > 1.5) {
      if (num <= 10 || num >= 40 || num % 10 === 0 || num % 10 === 9) {
        return 8;
      }
    } else {
      if (num >= 20 && num <= 30) {
        return 8;
      }
    }
    
    return 0;
  }

  private static fractalIterationPattern(num: number, history: DbRecord[]): number {
    let score = 0;
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      if (nums.includes(num)) {
        const position = nums.indexOf(num);
        if (position >= 0) {
          score += 2;
        }
      }
    });
    
    return Math.min(score, 8);
  }

  private static fractalBoundaryAnalysis(num: number, historyNumbers: number[]): number {
    let neighborCount = 0;
    const neighbors = [
      num - 1, num + 1,
      num - 7, num + 7,
      num - 8, num - 6, num + 6, num + 8
    ];
    
    neighbors.forEach(neighbor => {
      if (neighbor >= 1 && neighbor <= 49 && historyNumbers.includes(neighbor)) {
        neighborCount++;
      }
    });
    
    if (neighborCount <= 2) {
      return 6;
    }
    
    return 0;
  }

  private static calculateInformationEntropy(history: DbRecord[]): number {
    const frequency: Record<number, number> = {};
    let total = 0;
    
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        total++;
      });
    });
    
    if (total === 0) return 0;
    
    let entropy = 0;
    Object.values(frequency).forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });
    
    return entropy;
  }

  private static analyzeEntropyTrend(history: DbRecord[]): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 10) return 'stable';
    
    const midpoint = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, midpoint);
    const secondHalf = history.slice(midpoint);
    
    const entropy1 = this.calculateInformationEntropy(firstHalf);
    const entropy2 = this.calculateInformationEntropy(secondHalf);
    
    if (entropy2 > entropy1 * 1.1) return 'increasing';
    if (entropy2 < entropy1 * 0.9) return 'decreasing';
    
    return 'stable';
  }

  private static maxEntropyAnalysis(history: DbRecord[]): number[] {
    const frequency: Record<number, number> = {};
    
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
    });
    
    const sortedNumbers = Object.entries(frequency)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([num]) => parseInt(num));
    
    return sortedNumbers;
  }

  private static minEntropyAnalysis(history: DbRecord[]): number[] {
    const deterministicNumbers: number[] = [];
    
    for (let num = 1; num <= 49; num++) {
      if (this.PRIME_NUMBERS.includes(num) || 
          num % 10 === 0 || 
          num % 10 === 5 ||
          num === 25 || num === 37 || num === 49) {
        deterministicNumbers.push(num);
      }
    }
    
    return deterministicNumbers.slice(0, 10);
  }

  private static entropyChangeAnalysis(history: DbRecord[]): 'increasing' | 'decreasing' | 'stable' {
    return this.analyzeEntropyTrend(history);
  }

  private static entropyBalanceScore(num: number, history: DbRecord[], entropy: number): number {
    if (entropy > 3.5) {
      const frequency = this.getNumberFrequency(history, num);
      if (frequency < 2) {
        return 8;
      }
    } else if (entropy < 2.5) {
      const frequency = this.getNumberFrequency(history, num);
      if (frequency >= 3) {
        return 8;
      }
    }
    
    return 0;
  }

  private static informationGainAnalysis(num: number, history: DbRecord[], lastSpecial: number): number {
    const beforeEntropy = this.calculateInformationEntropy(history);
    
    const simulatedHistory = [...history.slice(0, 5)];
    const simulatedRecord: DbRecord = {
      open_code: [...this.parseNumbers(simulatedHistory[0]?.open_code || '').slice(0, 6), num].join(','),
      draw_time: new Date().toISOString()
    };
    
    const afterHistory = [simulatedRecord, ...simulatedHistory];
    const afterEntropy = this.calculateInformationEntropy(afterHistory);
    
    const informationGain = beforeEntropy - afterEntropy;
    
    if (informationGain > 0.5) {
      return 8;
    } else if (informationGain > 0.2) {
      return 5;
    }
    
    return 0;
  }

  private static analyzeDeterministicTransitions(history: DbRecord[]): Record<number, number[]> {
    const transitions: Record<number, number[]> = {};
    
    for (let i = 1; i < history.length; i++) {
      const prevNums = this.parseNumbers(history[i].open_code);
      const currentNums = this.parseNumbers(history[i-1].open_code);
      
      const prevSpecial = prevNums[prevNums.length - 1];
      const currentSpecial = currentNums[currentNums.length - 1];
      
      const prevIsDeterministic = this.isDeterministicNumber(prevSpecial);
      const currentIsDeterministic = this.isDeterministicNumber(currentSpecial);
      
      if (prevIsDeterministic && currentIsDeterministic) {
        if (!transitions[prevSpecial]) {
          transitions[prevSpecial] = [];
        }
        transitions[prevSpecial].push(currentSpecial);
      }
    }
    
    Object.keys(transitions).forEach(key => {
      const num = parseInt(key);
      transitions[num] = [...new Set(transitions[num])];
    });
    
    return transitions;
  }

  private static analyzeCoreStability(history: DbRecord[]): {
    stableNumbers: number[];
    stabilityScore: number;
  } {
    const stableNumbers: number[] = [];
    
    const frequency: Record<number, number[]> = {};
    
    history.forEach((rec, index) => {
      this.parseNumbers(rec.open_code).forEach(num => {
        if (!frequency[num]) {
          frequency[num] = [];
        }
        frequency[num].push(index);
      });
    });
    
    Object.entries(frequency).forEach(([numStr, appearances]) => {
      const num = parseInt(numStr);
      
      if (appearances.length >= 3) {
        let isRegular = true;
        for (let i = 1; i < appearances.length - 1; i++) {
          const interval1 = appearances[i] - appearances[i-1];
          const interval2 = appearances[i+1] - appearances[i];
          
          if (Math.abs(interval1 - interval2) > 3) {
            isRegular = false;
            break;
          }
        }
        
        if (isRegular) {
          stableNumbers.push(num);
        }
      }
    });
    
    return {
      stableNumbers,
      stabilityScore: stableNumbers.length > 0 ? 1.0 : 0
    };
  }

  private static primeSpiralAnalysis(num: number, lastSpecial: number, currentWeek: number): number {
    if (!this.PRIME_NUMBERS.includes(num)) return 0;
    
    let score = 0;
    
    const spiralOrder = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const lastIndex = spiralOrder.indexOf(lastSpecial);
    const currentIndex = spiralOrder.indexOf(num);
    
    if (lastIndex >= 0 && currentIndex >= 0) {
      if (currentIndex === (lastIndex + 1) % spiralOrder.length) {
        score += 10;
      } else if (currentIndex === (lastIndex + 2) % spiralOrder.length) {
        score += 7;
      }
    }
    
    const weekdayPrimePatterns: Record<number, number[]> = {
      0: [7, 17, 37],
      1: [2, 13, 23],
      2: [3, 19, 29],
      3: [5, 11, 31],
      4: [7, 17, 37],
      5: [13, 23, 43],
      6: [19, 29, 47]
    };
    
    const weekdayPattern = weekdayPrimePatterns[currentWeek % 7];
    if (weekdayPattern && weekdayPattern.includes(num)) {
      score += 8;
    }
    
    return score;
  }

  private static ulamSpiralAnalysis(num: number, history: DbRecord[]): number {
    const diagonalNumbers = [1, 9, 25, 49, 4, 16, 36, 8, 24, 48];
    
    if (diagonalNumbers.includes(num)) {
      let diagonalCount = 0;
      history.forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => {
          if (diagonalNumbers.includes(n)) {
            diagonalCount++;
          }
        });
      });
      
      if (diagonalCount >= 3) {
        return 8;
      }
    }
    
    return 0;
  }

  private static magicSquareAnalysis(num: number, history: DbRecord[]): number {
    const magicSquareCenters = [5, 15, 25, 35, 45];
    const magicSquareCorners = [1, 7, 43, 49];
    
    if (magicSquareCenters.includes(num)) {
      return 6;
    } else if (magicSquareCorners.includes(num)) {
      return 5;
    } else if (num === 25) {
      return 8;
    }
    
    return 0;
  }

  private static deterministicConvergence(num: number, history: DbRecord[]): number {
    const historyNumbers: number[] = [];
    history.forEach(rec => {
      historyNumbers.push(...this.parseNumbers(rec.open_code));
    });
    
    if (historyNumbers.length === 0) return 0;
    
    const mean = historyNumbers.reduce((a, b) => a + b, 0) / historyNumbers.length;
    const std = Math.sqrt(
      historyNumbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historyNumbers.length
    );
    
    if (Math.abs(num - mean) <= std / 2) {
      const frequency = historyNumbers.filter(n => n === num).length;
      if (frequency >= 2) {
        return 6;
      }
    }
    
    return 0;
  }

  private static sumDigits(num: number): number {
    return num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  private static getNumberFrequency(history: DbRecord[], num: number): number {
    let count = 0;
    history.forEach(rec => {
      if (this.parseNumbers(rec.open_code).includes(num)) {
        count++;
      }
    });
    return count;
  }

  private static isDeterministicNumber(num: number): boolean {
    return (
      this.PRIME_NUMBERS.includes(num) ||
      num % 10 === 0 ||
      num % 10 === 5 ||
      num === 25 || num === 37 || num === 49 ||
      this.DETERMINISTIC_PATTERNS.primeSpiral.includes(num) ||
      this.DETERMINISTIC_PATTERNS.ulamSpiral.includes(num) ||
      this.DETERMINISTIC_PATTERNS.magicSquare.includes(num)
    );
  }

  private static calculateContinuity<T>(history: T[], lastValue: T): 'continue' | 'alternate' | 'random' {
    if (history.length < 3) return 'random';
    
    let continueCount = 0;
    let alternateCount = 0;
    
    for (let i = 1; i < history.length; i++) {
      if (history[i] === history[i-1]) {
        continueCount++;
      } else {
        alternateCount++;
      }
    }
    
    const continueRatio = continueCount / (history.length - 1);
    const alternateRatio = alternateCount / (history.length - 1);
    
    if (continueRatio > 0.6) return 'continue';
    if (alternateRatio > 0.6) return 'alternate';
    return 'random';
  }

  private static calculateBalance<T>(history: T[], categories: T[]): 'balanced' | `need${Capitalize<string>}` {
    const counts: Record<string, number> = {};
    
    categories.forEach(cat => {
      counts[String(cat)] = 0;
    });
    
    history.forEach(value => {
      const key = String(value);
      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const avg = total / categories.length;
    
    let minCategory = categories[0];
    let minCount = counts[String(minCategory)];
    
    categories.forEach(cat => {
      const count = counts[String(cat)];
      if (count < minCount) {
        minCount = count;
        minCategory = cat;
      }
    });
    
    if (minCount < avg * 0.7) {
      return `need${String(minCategory).charAt(0).toUpperCase() + String(minCategory).slice(1)}` as any;
    }
    
    return 'balanced';
  }

  private static calculateElementBalance(history: string[]): {
    weakElement: string | null;
    strongElement: string | null;
  } {
    const counts: Record<string, number> = {
      '金': 0, '木': 0, '水': 0, '火': 0, '土': 0
    };
    
    history.forEach(element => {
      if (counts[element] !== undefined) {
        counts[element]++;
      }
    });
    
    let weakElement: string | null = null;
    let strongElement: string | null = null;
    let minCount = Infinity;
    let maxCount = -Infinity;
    
    Object.entries(counts).forEach(([element, count]) => {
      if (count < minCount) {
        minCount = count;
        weakElement = element;
      }
      if (count > maxCount) {
        maxCount = count;
        strongElement = element;
      }
    });
    
    return { weakElement, strongElement };
  }

  private static detectSeries(numbers: number[]): Array<{
    type: 'double' | 'triple' | 'quad';
    numbers: number[];
  }> {
    const series: Array<{type: 'double' | 'triple' | 'quad', numbers: number[]}> = [];
    const sorted = [...numbers].sort((a, b) => a - b);
    
    let currentSeries: number[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i-1] + 1) {
        currentSeries.push(sorted[i]);
      } else {
        if (currentSeries.length >= 2) {
          const type = currentSeries.length === 2 ? 'double' : 
                      currentSeries.length === 3 ? 'triple' : 'quad';
          series.push({ type, numbers: [...currentSeries] });
        }
        currentSeries = [sorted[i]];
      }
    }
    
    if (currentSeries.length >= 2) {
      const type = currentSeries.length === 2 ? 'double' : 
                  currentSeries.length === 3 ? 'triple' : 'quad';
      series.push({ type, numbers: [...currentSeries] });
    }
    
    return series;
  }

  private static analyzeSeriesFrequency(history: DbRecord[], num: number): number {
    let frequency = 0;
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code).sort((a, b) => a - b);
      const series = this.detectSeries(nums);
      
      series.forEach(s => {
        if (s.numbers.includes(num)) {
          frequency++;
        }
      });
    });
    
    return Math.min(frequency, 5);
  }

  private static getSumZone(sum: number): 'small' | 'medium' | 'large' {
    if (sum >= this.SUM_ZONES.small.min && sum <= this.SUM_ZONES.small.max) {
      return 'small';
    } else if (sum >= this.SUM_ZONES.medium.min && sum <= this.SUM_ZONES.medium.max) {
      return 'medium';
    } else {
      return 'large';
    }
  }

  private static analyzeZoneTransitions(zoneHistory: string[]): Record<string, Record<string, number>> {
    const transitions: Record<string, Record<string, number>> = {
      'small': {'small': 0, 'medium': 0, 'large': 0},
      'medium': {'small': 0, 'medium': 0, 'large': 0},
      'large': {'small': 0, 'medium': 0, 'large': 0}
    };
    
    for (let i = 1; i < zoneHistory.length; i++) {
      const from = zoneHistory[i-1];
      const to = zoneHistory[i];
      
      if (transitions[from] && transitions[from][to] !== undefined) {
        transitions[from][to]++;
      }
    }
    
    Object.keys(transitions).forEach(from => {
      const total = Object.values(transitions[from]).reduce((a, b) => a + b, 0);
      if (total > 0) {
        Object.keys(transitions[from]).forEach(to => {
          transitions[from][to] = transitions[from][to] / total;
        });
      }
    });
    
    return transitions;
  }
}
