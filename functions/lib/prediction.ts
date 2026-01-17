import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  
  // v15.0 二十四维度终极评分系统
  scoreHistoryMirror: number;  // 历史镜像
  scoreZodiacTrans: number;    // 生肖转移概率
  scoreNumberTrans: number;    // 特码转移概率
  scoreSpecialTraj: number;    // 特码轨迹
  scorePattern: number;        // 形态几何
  scoreTail: number;           // 尾数力场
  scoreZodiac: number;         // 三合局势
  scoreWuXing: number;         // 五行平衡
  scoreWave: number;           // 波色惯性
  scoreGold: number;           // 黄金密钥
  scoreOmission: number;       // 遗漏回补
  scoreSeasonal: number;       // 季节规律
  scorePrime: number;          // 质数分布
  scoreSumAnalysis: number;    // 和值分析
  scorePosition: number;       // 位置分析
  scoreFrequency: number;      // 频率分析
  scoreCluster: number;        // 聚类分析
  scoreSymmetry: number;       // 对称分析
  scorePeriodic: number;       // 周期分析
  scoreTrend: number;          // 趋势分析
  scoreMatrix: number;         // 矩阵分析
  scoreQuantum: number;        // 量子概率
  scoreChaos: number;          // 混沌分析
  scoreGenetic: number;        // 遗传算法
  scoreNeural: number;         // 神经网络评分
  
  totalScore: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v15.0 "Galaxy Statistician Supreme Edition"
 * 最终升级：整合二十四维度确定性算法，融合量子计算思想
 */
export class PredictionEngine {

  // --- 基础数据映射 (2025 Snake Year) ---
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

  // 扩展数据映射
  static SEASONAL_ZODIACS: Record<string, string[]> = {
    '春': ['虎', '兔', '龙'],
    '夏': ['蛇', '马', '羊'],
    '秋': ['猴', '鸡', '狗'],
    '冬': ['猪', '鼠', '牛']
  };

  static PRIME_NUMBERS: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  
  static COMPOSITE_NUMBERS: number[] = Array.from({length: 49}, (_, i) => i + 1)
    .filter(n => !this.PRIME_NUMBERS.includes(n));
  
  static ODD_NUMBERS: number[] = Array.from({length: 49}, (_, i) => i + 1).filter(n => n % 2 === 1);
  static EVEN_NUMBERS: number[] = Array.from({length: 49}, (_, i) => i + 1).filter(n => n % 2 === 0);
  
  static BIG_NUMBERS: number[] = Array.from({length: 49}, (_, i) => i + 1).filter(n => n > 24);
  static SMALL_NUMBERS: number[] = Array.from({length: 49}, (_, i) => i + 1).filter(n => n <= 24);

  // 矩阵分析参数
  static MATRIX_7x7: number[][] = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, 32, 33, 34, 35],
    [36, 37, 38, 39, 40, 41, 42],
    [43, 44, 45, 46, 47, 48, 49]
  ];

  // 量子状态映射
  static QUANTUM_STATES = {
    superposition: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],
    entanglement: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47],
    coherence: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48]
  };

  // 混沌映射参数
  static CHAOS_CONSTANTS = {
    logistic: 3.99,
    hennonA: 1.4,
    hennonB: 0.3,
    tent: 1.999
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};
  static NUM_TO_MATRIX_POS: Record<number, {row: number, col: number}> = {};

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
    // 生肖映射
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => this.NUM_TO_ZODIAC[n] = z);
    }
    
    // 五行映射
    for (const [w, nums] of Object.entries(this.WU_XING_MAP)) {
      nums.forEach(n => this.NUM_TO_WUXING[n] = w);
    }
    
    // 矩阵位置映射
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const num = this.MATRIX_7x7[row][col];
        this.NUM_TO_MATRIX_POS[num] = {row, col};
      }
    }
  }

  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    this.initializeMaps();
    
    if (!history || history.length < 100) return this.generateRandom();

    // 0. 数据预处理
    const fullHistory = history;
    const recent100 = history.slice(0, 100);
    const recent50 = history.slice(0, 50);
    const recent30 = history.slice(0, 30);
    const recent20 = history.slice(0, 20);
    const recent10 = history.slice(0, 10);
    
    const lastDrawNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial];
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    
    // 获取时间信息
    const currentDate = history[0].draw_time ? new Date(history[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    const currentDay = currentDate.getDay(); // 0=周日, 1=周一...

    // 初始化状态池
    const stats: NumberStat[] = Array.from({ length: 49 }, (_, i) => {
      const num = i + 1;
      return {
        num,
        zodiac: this.NUM_TO_ZODIAC[num],
        wave: this.getNumWave(num),
        wuxing: this.NUM_TO_WUXING[num],
        tail: num % 10,
        
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
        scoreMatrix: 0,
        scoreQuantum: 0,
        scoreChaos: 0,
        scoreGenetic: 0,
        scoreNeural: 0,
        totalScore: 0
      };
    });

    // ==========================================
    // 算法 1-5: 核心转移概率算法
    // ==========================================
    const coreResults = this.calculateCoreAlgorithms(fullHistory, lastDrawNums, lastSpecial, lastSpecialZodiac);
    stats.forEach(s => {
      s.scoreZodiacTrans = coreResults.zodiacTrans[s.zodiac] || 0;
      s.scoreNumberTrans = coreResults.numberTrans[s.num] || 0;
      s.scoreHistoryMirror = coreResults.historyMirror[s.num] || 0;
    });

    // ==========================================
    // 算法 6-10: 形态分析算法
    // ==========================================
    const patternResults = this.calculatePatternAlgorithms(lastDrawNums, recent10, recent20);
    stats.forEach(s => {
      s.scoreSpecialTraj = patternResults.trajectory[s.num] || 0;
      s.scorePattern = patternResults.pattern[s.num] || 0;
      s.scoreTail = patternResults.tail[s.tail] || 0;
      s.scoreCluster = patternResults.cluster[s.num] || 0;
      s.scoreSymmetry = patternResults.symmetry[s.num] || 0;
    });

    // ==========================================
    // 算法 11-15: 属性分析算法
    // ==========================================
    const attributeResults = this.calculateAttributeAlgorithms(recent20, recent10, lastSpecialZodiac, lastSpecial);
    stats.forEach(s => {
      s.scoreZodiac = attributeResults.zodiac[s.zodiac] || 0;
      s.scoreWuXing = attributeResults.wuxing[s.wuxing] || 0;
      s.scoreWave = attributeResults.wave[s.wave] || 0;
      s.scorePrime = attributeResults.prime[s.num] || 0;
      s.scoreSeasonal = attributeResults.seasonal[s.zodiac] || 0;
    });

    // ==========================================
    // 算法 16-20: 统计趋势算法
    // ==========================================
    const trendResults = this.calculateTrendAlgorithms(fullHistory, recent30, currentWeek, currentDay);
    stats.forEach(s => {
      s.scoreOmission = trendResults.omission[s.num] || 0;
      s.scoreFrequency = trendResults.frequency[s.num] || 0;
      s.scorePeriodic = trendResults.periodic[s.num] || 0;
      s.scoreTrend = trendResults.trend[s.num] || 0;
      s.scorePosition = trendResults.position[s.num] || 0;
    });

    // ==========================================
    // 算法 21: 和值分析
    // ==========================================
    const sumResults = this.calculateSumAnalysis(recent20, lastDrawSum, lastSpecial);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumAnalysis = sumResults.getScore(simulatedSum, s.num);
    });

    // ==========================================
    // 算法 22: 黄金密钥
    // ==========================================
    const goldNumbers = this.calculateGoldNumbers(lastDrawSum, lastSpecial, currentDay);
    stats.forEach(s => {
      if (goldNumbers.includes(s.num)) s.scoreGold = 30;
    });

    // ==========================================
    // 算法 23: [NEW] 矩阵分析
    // ==========================================
    const matrixScores = this.calculateMatrixAnalysis(recent20, lastDrawNums);
    stats.forEach(s => {
      s.scoreMatrix = matrixScores[s.num] || 0;
    });

    // ==========================================
    // 算法 24: [NEW] 量子概率分析
    // ==========================================
    const quantumScores = this.calculateQuantumProbability(recent50, currentDay);
    stats.forEach(s => {
      s.scoreQuantum = quantumScores[s.num] || 0;
    });

    // ==========================================
    // 算法 25: [NEW] 混沌分析
    // ==========================================
    const chaosScores = this.calculateChaosAnalysis(fullHistory, lastDrawNums, currentDate);
    stats.forEach(s => {
      s.scoreChaos = chaosScores[s.num] || 0;
    });

    // ==========================================
    // 算法 26: [NEW] 遗传算法优化
    // ==========================================
    const geneticScores = this.calculateGeneticAlgorithm(fullHistory, recent20);
    stats.forEach(s => {
      s.scoreGenetic = geneticScores[s.num] || 0;
    });

    // ==========================================
    // 算法 27: [NEW] 神经网络评分
    // ==========================================
    const neuralScores = this.calculateNeuralNetworkScore(fullHistory, lastDrawNums);
    stats.forEach(s => {
      s.scoreNeural = neuralScores[s.num] || 0;
    });

    // ==========================================
    // 最终汇总 - 二十四维度权重分配
    // ==========================================
    const weights = {
      zodiacTrans: 2.8,      // 生肖转移概率
      numberTrans: 2.3,      // 特码转移概率
      historyMirror: 1.8,    // 历史镜像
      specialTraj: 1.6,      // 特码轨迹
      pattern: 1.5,          // 形态几何
      tail: 1.2,            // 尾数力场
      zodiac: 1.2,          // 三合局势
      wuxing: 1.1,          // 五行平衡
      wave: 1.1,            // 波色惯性
      gold: 1.0,            // 黄金密钥
      omission: 1.0,        // 遗漏回补
      seasonal: 0.9,        // 季节规律
      prime: 0.9,           // 质数分布
      sumAnalysis: 0.8,     // 和值分析
      position: 0.8,        // 位置分析
      frequency: 0.8,       // 频率分析
      cluster: 0.7,         // 聚类分析
      symmetry: 0.7,        // 对称分析
      periodic: 0.7,        // 周期分析
      trend: 0.7,           // 趋势分析
      matrix: 0.6,          // 矩阵分析
      quantum: 0.6,         // 量子概率
      chaos: 0.6,           // 混沌分析
      genetic: 0.5,         // 遗传算法
      neural: 0.5           // 神经网络评分
    };

    stats.forEach(s => {
      s.totalScore = 
        s.scoreZodiacTrans * weights.zodiacTrans +
        s.scoreNumberTrans * weights.numberTrans +
        s.scoreHistoryMirror * weights.historyMirror +
        s.scoreSpecialTraj * weights.specialTraj +
        s.scorePattern * weights.pattern +
        s.scoreTail * weights.tail +
        s.scoreZodiac * weights.zodiac +
        s.scoreWuXing * weights.wuxing +
        s.scoreWave * weights.wave +
        s.scoreGold * weights.gold +
        s.scoreOmission * weights.omission +
        s.scoreSeasonal * weights.seasonal +
        s.scorePrime * weights.prime +
        s.scoreSumAnalysis * weights.sumAnalysis +
        s.scorePosition * weights.position +
        s.scoreFrequency * weights.frequency +
        s.scoreCluster * weights.cluster +
        s.scoreSymmetry * weights.symmetry +
        s.scorePeriodic * weights.periodic +
        s.scoreTrend * weights.trend +
        s.scoreMatrix * weights.matrix +
        s.scoreQuantum * weights.quantum +
        s.scoreChaos * weights.chaos +
        s.scoreGenetic * weights.genetic +
        s.scoreNeural * weights.neural;
        
      // 量子扰动（极小随机性）
      s.totalScore += Math.random() * 0.02;
    });

    // 排序并选择
    stats.sort((a, b) => b.totalScore - a.totalScore);
    const final18 = this.selectOptimalNumbers(stats, 18);
    const resultNumbers = final18.map(s => s.num)
      .sort((a, b) => a - b)
      .map(n => n < 10 ? `0${n}` : `${n}`);

    // 生成推荐结果
    return this.generateRecommendations(final18);
  }

  // ==========================================
  // 核心算法组
  // ==========================================

  private static calculateCoreAlgorithms(history: DbRecord[], lastDraw: number[], lastSpecial: number, lastSpecialZodiac: string) {
    const zodiacTrans: Record<string, number> = {};
    const numberTrans: Record<number, number> = {};
    const historyMirror: Record<number, number> = {};
    
    let zodiacTransTotal = 0;
    
    // 生肖转移概率
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      const histZodiac = this.NUM_TO_ZODIAC[histSpecial];

      if (histZodiac === lastSpecialZodiac) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        const nextZodiac = this.NUM_TO_ZODIAC[nextSpecial];
        
        zodiacTrans[nextZodiac] = (zodiacTrans[nextZodiac] || 0) + 1;
        zodiacTransTotal++;
      }
    }
    
    // 标准化生肖转移分数
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      const occurrences = zodiacTrans[zodiac] || 0;
      zodiacTrans[zodiac] = zodiacTransTotal > 0 ? (occurrences / zodiacTransTotal) * 60 : 0;
    });

    // 特码转移概率
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      
      if (histSpecial === lastSpecial) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        numberTrans[nextSpecial] = (numberTrans[nextSpecial] || 0) + 1;
      }
    }

    // 历史镜像
    for (let i = 1; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const common = histNums.filter(n => lastDraw.includes(n));
      
      if (common.length >= 4) {
        const nextNums = this.parseNumbers(history[i-1].open_code);
        const similarity = common.length / lastDraw.length;
        
        nextNums.forEach(n => {
          historyMirror[n] = (historyMirror[n] || 0) + similarity * 20;
        });
      }
    }

    return { zodiacTrans, numberTrans, historyMirror };
  }

  private static calculatePatternAlgorithms(lastDraw: number[], recent10: DbRecord[], recent20: DbRecord[]) {
    const pattern: Record<number, number> = {};
    const tail: Record<number, number> = {};
    const trajectory: Record<number, number> = {};
    const cluster: Record<number, number> = {};
    const symmetry: Record<number, number> = {};
    
    // 形态分析
    const neighborSet = new Set<number>();
    const repeatSet = new Set(lastDraw);
    const consecutiveSet = new Set<number>();
    
    // 邻号分析
    lastDraw.forEach(n => {
      if (n > 1) neighborSet.add(n - 1);
      if (n < 49) neighborSet.add(n + 1);
    });
    
    // 连号分析
    const sortedLast = [...lastDraw].sort((a, b) => a - b);
    for (let i = 0; i < sortedLast.length - 1; i++) {
      if (sortedLast[i+1] - sortedLast[i] === 1) {
        if (sortedLast[i] > 1) consecutiveSet.add(sortedLast[i] - 1);
        if (sortedLast[i+1] < 49) consecutiveSet.add(sortedLast[i+1] + 1);
      }
    }
    
    // 尾数分析
    const tailCount: Record<number, number> = {};
    recent10.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const t = num % 10;
        tailCount[t] = (tailCount[t] || 0) + 1;
      });
    });
    
    const hotTails = Object.entries(tailCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([t]) => parseInt(t));
    
    // 聚类分析
    const recentNumbers: number[] = [];
    recent20.forEach(rec => {
      recentNumbers.push(...this.parseNumbers(rec.open_code));
    });
    
    // 对称分析
    const symmetryMap: Record<number, number> = {};
    recent20.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const symmetricNum = 50 - num;
        if (symmetricNum >= 1 && symmetricNum <= 49) {
          symmetryMap[symmetricNum] = (symmetryMap[symmetricNum] || 0) + 1;
        }
      });
    });
    
    // 特码轨迹
    const specials: number[] = [];
    for (let i = 0; i < Math.min(15, recent20.length); i++) {
      const nums = this.parseNumbers(recent20[i].open_code);
      if (nums.length > 0) specials.push(nums[nums.length - 1]);
    }
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      let patternScore = 0;
      let clusterScore = 0;
      let symmetryScore = 0;
      let trajectoryScore = 0;
      
      // 形态分数
      if (neighborSet.has(num)) patternScore += 18;
      if (repeatSet.has(num)) patternScore += 15;
      if (consecutiveSet.has(num)) patternScore += 20;
      
      // 尾数分数
      const t = num % 10;
      if (hotTails.includes(t)) tail[t] = 25;
      
      // 聚类分数
      if (recentNumbers.length > 0) {
        const avgNum = recentNumbers.reduce((a, b) => a + b, 0) / recentNumbers.length;
        const distance = Math.abs(num - avgNum);
        clusterScore = Math.max(0, 20 - distance);
      }
      
      // 对称分数
      const symmetricNum = 50 - num;
      lastDraw.forEach(n => {
        if (50 - n === num) symmetryScore += 20;
      });
      if (symmetryMap[num]) symmetryScore += symmetryMap[num] * 2;
      
      // 轨迹分数
      if (specials.length >= 3) {
        const movingAvg = specials.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        if (Math.abs(num - movingAvg) <= 6) trajectoryScore += 15;
        
        const lastParity = specials[0] % 2;
        if ((num % 2) === lastParity) trajectoryScore += 10;
      }
      
      pattern[num] = patternScore;
      cluster[num] = clusterScore;
      symmetry[num] = symmetryScore;
      trajectory[num] = trajectoryScore;
    }
    
    return { pattern, tail, trajectory, cluster, symmetry };
  }

  private static calculateAttributeAlgorithms(recent20: DbRecord[], recent10: DbRecord[], lastSpecialZodiac: string, lastSpecial: number) {
    const zodiac: Record<string, number> = {};
    const wuxing: Record<string, number> = {};
    const wave: Record<string, number> = {};
    const prime: Record<number, number> = {};
    const seasonal: Record<string, number> = {};
    
    // 生肖分析
    const zodiacCount: Record<string, number> = {};
    recent20.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const z = this.NUM_TO_ZODIAC[num];
        zodiacCount[z] = (zodiacCount[z] || 0) + 1;
      });
    });
    
    const hotZodiacs = Object.entries(zodiacCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([z]) => z);
    
    const allies = this.SAN_HE_MAP[lastSpecialZodiac] || [];
    
    // 五行分析
    const wuxingCount: Record<string, number> = {};
    recent10.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const w = this.NUM_TO_WUXING[num];
        wuxingCount[w] = (wuxingCount[w] || 0) + 1;
      });
    });
    
    const weakWuxing = Object.entries(wuxingCount)
      .sort((a, b) => a[1] - b[1])[0]?.[0] || '土';
    
    // 波色分析
    const waveCount: Record<string, number> = {};
    recent10.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const w = this.getNumWave(num);
        waveCount[w] = (waveCount[w] || 0) + 1;
      });
    });
    
    const lastWave = this.getNumWave(lastSpecial);
    const weakWave = Object.entries(waveCount)
      .sort((a, b) => a[1] - b[1])[0]?.[0] || 'green';
    
    // 质数分析
    let primeCount = 0;
    let totalNumbers = 0;
    recent20.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      totalNumbers += nums.length;
      primeCount += nums.filter(n => this.PRIME_NUMBERS.includes(n)).length;
    });
    
    const primeRatio = totalNumbers > 0 ? primeCount / totalNumbers : 0;
    const expectedRatio = this.PRIME_NUMBERS.length / 49;
    
    // 季节分析
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const season = this.getSeasonByMonth(currentMonth);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    
    // 计算分数
    Object.keys(this.ZODIACS_MAP).forEach(z => {
      let zodiacScore = 0;
      if (hotZodiacs.includes(z)) zodiacScore += 20;
      if (allies.includes(z)) zodiacScore += 25;
      if (z === lastSpecialZodiac) zodiacScore += 15;
      zodiac[z] = zodiacScore;
      
      // 季节分数
      if (seasonalZodiacs.includes(z)) {
        seasonal[z] = 20;
      }
    });
    
    Object.keys(this.WU_XING_MAP).forEach(w => {
      if (w === weakWuxing) {
        wuxing[w] = 30; // 补弱
      } else {
        wuxing[w] = 15; // 平衡
      }
    });
    
    ['red', 'blue', 'green'].forEach(w => {
      let waveScore = 0;
      if (w === lastWave) waveScore += 20;
      if (w === weakWave) waveScore += 25;
      wave[w] = waveScore;
    });
    
    for (let num = 1; num <= 49; num++) {
      const isPrime = this.PRIME_NUMBERS.includes(num);
      
      if (primeRatio < expectedRatio * 0.9 && isPrime) {
        prime[num] = 20; // 需要更多质数
      } else if (primeRatio > expectedRatio * 1.1 && !isPrime) {
        prime[num] = 20; // 需要更多合数
      } else if (this.PRIME_NUMBERS.includes(lastSpecial) && isPrime) {
        prime[num] = 15; // 质数连续性
      } else {
        prime[num] = 0;
      }
    }
    
    return { zodiac, wuxing, wave, prime, seasonal };
  }

  private static calculateTrendAlgorithms(history: DbRecord[], recent30: DbRecord[], currentWeek: number, currentDay: number) {
    const omission: Record<number, number> = {};
    const frequency: Record<number, number> = {};
    const periodic: Record<number, number> = {};
    const trend: Record<number, number> = {};
    const position: Record<number, number> = {};
    
    const period = 50;
    
    // 遗漏分析
    const omissionMap: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) omissionMap[i] = period;
    
    for (let i = 0; i < Math.min(period, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      nums.forEach(num => {
        omissionMap[num] = i;
      });
    }
    
    // 频率分析
    const frequencyMap: Record<number, number> = {};
    recent30.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    const maxFreq = Math.max(...Object.values(frequencyMap));
    const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Object.keys(frequencyMap).length;
    
    // 周期分析
    const periodMap: Record<number, number[]> = {};
    for (let i = 1; i <= 49; i++) periodMap[i] = [];
    
    history.slice(0, 100).forEach((rec, index) => {
      const weekNum = Math.floor(index / 7) + 1;
      this.parseNumbers(rec.open_code).forEach(num => {
        periodMap[num].push(weekNum);
      });
    });
    
    // 趋势分析
    const trendMap: Record<number, {count: number, positions: number[]}> = {};
    for (let i = 1; i <= 49; i++) trendMap[i] = {count: 0, positions: []};
    
    recent30.forEach((rec, drawIndex) => {
      this.parseNumbers(rec.open_code).forEach((num, pos) => {
        trendMap[num].count++;
        trendMap[num].positions.push(drawIndex * 10 + (pos + 1));
      });
    });
    
    // 位置分析
    const positionStats: Record<number, Record<number, number>> = {};
    for (let i = 1; i <= 49; i++) {
      positionStats[i] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};
    }
    
    recent30.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach((num, index) => {
        const pos = index + 1;
        positionStats[num][pos]++;
      });
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      // 遗漏分数
      const omissionVal = omissionMap[num];
      if (omissionVal >= period * 0.8) {
        omission[num] = 30;
      } else if (omissionVal >= period * 0.6) {
        omission[num] = 25;
      } else if (omissionVal >= period * 0.4) {
        omission[num] = 20;
      } else if (omissionVal >= period * 0.2) {
        omission[num] = 15;
      } else {
        omission[num] = 0;
      }
      
      // 频率分数
      const freq = frequencyMap[num] || 0;
      if (freq > avgFreq * 1.5) {
        frequency[num] = 15; // 热号
      } else if (freq < avgFreq * 0.5 && freq > 0) {
        frequency[num] = 20; // 冷号（可能回补）
      } else if (freq === 0) {
        frequency[num] = 25; // 极冷号
      } else {
        frequency[num] = Math.min((freq / maxFreq) * 15, 15);
      }
      
      // 周期分数
      const appearances = periodMap[num];
      if (appearances.length >= 3) {
        let totalInterval = 0;
        for (let i = 1; i < appearances.length; i++) {
          totalInterval += appearances[i] - appearances[i-1];
        }
        const avgInterval = totalInterval / (appearances.length - 1);
        const lastAppearance = appearances[appearances.length - 1];
        const expected = lastAppearance + avgInterval;
        
        if (Math.abs(currentWeek - expected) <= 1) {
          periodic[num] = 25;
        } else if (currentWeek > expected) {
          periodic[num] = 20;
        } else {
          periodic[num] = 0;
        }
      } else {
        periodic[num] = 0;
      }
      
      // 趋势分数
      const trendData = trendMap[num];
      if (trendData.positions.length >= 2) {
        let totalDiff = 0;
        for (let i = 1; i < trendData.positions.length; i++) {
          totalDiff += trendData.positions[i] - trendData.positions[i-1];
        }
        const avgDiff = totalDiff / (trendData.positions.length - 1);
        
        if (avgDiff > 0) trend[num] = 20; // 上升
        else if (avgDiff < 0) trend[num] = 15; // 下降
        else trend[num] = 10; // 稳定
        
        if (trendData.count >= 4) trend[num] += 5;
      } else {
        trend[num] = 0;
      }
      
      // 位置分数
      const positions = positionStats[num];
      const totalPos = Object.values(positions).reduce((a, b) => a + b, 0);
      if (totalPos > 0) {
        const specialScore = positions[7] * 4;
        const normalScore = (totalPos - positions[7]) * 1.5;
        position[num] = specialScore + normalScore;
      } else {
        position[num] = 0;
      }
    }
    
    return { omission, frequency, periodic, trend, position };
  }

  private static calculateSumAnalysis(recent20: DbRecord[], lastSum: number, lastSpecial: number) {
    const sums: number[] = [];
    const sumParities: number[] = [];
    
    recent20.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      sums.push(sum);
      sumParities.push(sum % 2);
    });
    
    // 计算统计
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const stdSum = Math.sqrt(sums.reduce((sq, n) => sq + Math.pow(n - avgSum, 2), 0) / sums.length);
    
    // 奇偶趋势
    const lastParity = lastSum % 2;
    const parityCounts = [0, 0];
    sumParities.forEach(p => parityCounts[p]++);
    const parityTrend = parityCounts[lastParity] > parityCounts[1 - lastParity] ? 'same' : 'alternate';
    
    return {
      getScore: (simulatedSum: number, num: number) => {
        let score = 0;
        
        // 和值范围
        const lowerBound = Math.max(80, avgSum - stdSum);
        const upperBound = Math.min(200, avgSum + stdSum);
        
        if (simulatedSum >= lowerBound && simulatedSum <= upperBound) {
          score += 20;
        }
        
        // 奇偶趋势
        const simulatedParity = simulatedSum % 2;
        if ((parityTrend === 'same' && simulatedParity === lastParity) ||
            (parityTrend === 'alternate' && simulatedParity !== lastParity)) {
          score += 15;
        }
        
        // 和值尾数
        const sumTail = simulatedSum % 10;
        const numTail = num % 10;
        if (sumTail === numTail) score += 10;
        
        return score;
      }
    };
  }

  private static calculateGoldNumbers(sum: number, special: number, day: number): number[] {
    const goldNumbers: number[] = [];
    
    // 黄金分割系列
    goldNumbers.push(Math.round(sum * 0.618) % 49 || 49);
    goldNumbers.push(Math.round(sum * 0.382) % 49 || 49);
    
    // 特码衍生
    goldNumbers.push(Math.round(special * 1.618) % 49 || 49);
    goldNumbers.push(Math.round(special * 0.618) % 49 || 49);
    goldNumbers.push((special + 13) % 49 || 49);
    
    // 日期相关
    goldNumbers.push((sum + day) % 49 || 49);
    goldNumbers.push((special * day) % 49 || 49);
    
    // 固定组合
    goldNumbers.push((sum + 7) % 49 || 49);
    goldNumbers.push((special * 2) % 49 || 49);
    
    return [...new Set(goldNumbers.filter(n => n >= 1 && n <= 49))];
  }

  // ==========================================
  // 新增高级算法
  // ==========================================

  private static calculateMatrixAnalysis(recent20: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const matrixCounts: number[][] = Array(7).fill(0).map(() => Array(7).fill(0));
    
    // 统计矩阵位置出现次数
    recent20.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const pos = this.NUM_TO_MATRIX_POS[num];
        if (pos) {
          matrixCounts[pos.row][pos.col]++;
        }
      });
    });
    
    // 计算行和列的权重
    const rowSums = matrixCounts.map(row => row.reduce((a, b) => a + b, 0));
    const colSums = Array(7).fill(0).map((_, col) => 
      matrixCounts.reduce((sum, row) => sum + row[col], 0)
    );
    
    // 计算每个号码的矩阵分数
    for (let num = 1; num <= 49; num++) {
      const pos = this.NUM_TO_MATRIX_POS[num];
      if (!pos) continue;
      
      let score = 0;
      
      // 行和列权重
      score += rowSums[pos.row] * 2;
      score += colSums[pos.col] * 2;
      
      // 对角线权重
      if (pos.row === pos.col) score += 15; // 主对角线
      if (pos.row + pos.col === 6) score += 15; // 副对角线
      
      // 邻居矩阵位置
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = pos.row + dr;
          const nc = pos.col + dc;
          if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) {
            score += matrixCounts[nr][nc];
          }
        }
      }
      
      // 上期号码的矩阵关系
      lastDraw.forEach(n => {
        const lastPos = this.NUM_TO_MATRIX_POS[n];
        if (lastPos) {
          const rowDist = Math.abs(pos.row - lastPos.row);
          const colDist = Math.abs(pos.col - lastPos.col);
          
          if (rowDist <= 1 && colDist <= 1) {
            score += 20; // 矩阵邻位
          }
        }
      });
      
      scores[num] = score;
    }
    
    return scores;
  }

  private static calculateQuantumProbability(recent50: DbRecord[], day: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const quantumStates: Record<string, number> = { superposition: 0, entanglement: 0, coherence: 0 };
    
    // 统计量子状态出现频率
    recent50.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        if (this.QUANTUM_STATES.superposition.includes(num)) {
          quantumStates.superposition++;
        } else if (this.QUANTUM_STATES.entanglement.includes(num)) {
          quantumStates.entanglement++;
        } else if (this.QUANTUM_STATES.coherence.includes(num)) {
          quantumStates.coherence++;
        }
      });
    });
    
    // 量子状态轮换（基于日期）
    const dayState = day % 3;
    let favoredState: string;
    if (dayState === 0) favoredState = 'superposition';
    else if (dayState === 1) favoredState = 'entanglement';
    else favoredState = 'coherence';
    
    // 找到最弱状态
    const sortedStates = Object.entries(quantumStates).sort((a, b) => a[1] - b[1]);
    const weakState = sortedStates[0]?.[0] || 'coherence';
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      // 确定号码的量子状态
      let numState: string | null = null;
      if (this.QUANTUM_STATES.superposition.includes(num)) numState = 'superposition';
      else if (this.QUANTUM_STATES.entanglement.includes(num)) numState = 'entanglement';
      else if (this.QUANTUM_STATES.coherence.includes(num)) numState = 'coherence';
      
      if (numState) {
        // 日期偏爱状态
        if (numState === favoredState) score += 25;
        
        // 补弱状态
        if (numState === weakState) score += 20;
        
        // 状态惯性
        const stateFreq = quantumStates[numState];
        const totalFreq = Object.values(quantumStates).reduce((a, b) => a + b, 0);
        if (totalFreq > 0) {
          const stateRatio = stateFreq / totalFreq;
          if (stateRatio < 0.3) score += 15; // 该状态出现不足
        }
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  private static calculateChaosAnalysis(history: DbRecord[], lastDraw: number[], date: Date): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 混沌系统参数
    const x0 = (date.getTime() % 1000) / 1000; // 使用时间作为种子
    const logisticIterations = 100;
    const tentIterations = 50;
    
    // Logistic映射
    let logisticValue = x0;
    for (let i = 0; i < logisticIterations; i++) {
      logisticValue = this.CHAOS_CONSTANTS.logistic * logisticValue * (1 - logisticValue);
    }
    const logisticNum = Math.floor(logisticValue * 49) + 1;
    
    // Tent映射
    let tentValue = x0;
    for (let i = 0; i < tentIterations; i++) {
      if (tentValue < 0.5) {
        tentValue = this.CHAOS_CONSTANTS.tent * tentValue;
      } else {
        tentValue = this.CHAOS_CONSTANTS.tent * (1 - tentValue);
      }
    }
    const tentNum = Math.floor(tentValue * 49) + 1;
    
    // Henon映射
    let x = 0.1;
    let y = 0.1;
    for (let i = 0; i < 100; i++) {
      const newX = y + 1 - this.CHAOS_CONSTANTS.hennonA * x * x;
      const newY = this.CHAOS_CONSTANTS.hennonB * x;
      x = newX;
      y = newY;
    }
    const henonNum = Math.floor((x + 1.5) / 3 * 49) + 1;
    
    // 混沌吸引点
    const chaosNumbers = [logisticNum, tentNum, henonNum]
      .filter(n => n >= 1 && n <= 49);
    
    // 历史混沌模式匹配
    const historyPatterns: number[][] = [];
    for (let i = 0; i < history.length - 1; i++) {
      const current = this.parseNumbers(history[i].open_code);
      const next = this.parseNumbers(history[i + 1].open_code);
      
      // 寻找混沌相似模式
      const similarity = this.calculateChaosSimilarity(current, lastDraw);
      if (similarity > 0.7) {
        historyPatterns.push(next);
      }
    }
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      // 混沌吸引点
      if (chaosNumbers.includes(num)) score += 30;
      
      // 历史模式匹配
      historyPatterns.forEach(pattern => {
        if (pattern.includes(num)) score += 5;
      });
      
      // 混沌距离（与上期号码的混沌距离）
      let minChaosDistance = Infinity;
      lastDraw.forEach(n => {
        const dist = Math.abs(num - n);
        // 非线性混沌距离
        const chaosDist = dist * (1 + Math.sin(dist * 0.1));
        if (chaosDist < minChaosDistance) minChaosDistance = chaosDist;
      });
      
      if (minChaosDistance < 10) score += 20;
      else if (minChaosDistance < 20) score += 10;
      
      scores[num] = score;
    }
    
    return scores;
  }

  private static calculateChaosSimilarity(set1: number[], set2: number[]): number {
    if (set1.length === 0 || set2.length === 0) return 0;
    
    // 计算混沌特征向量
    const features1 = this.extractChaosFeatures(set1);
    const features2 = this.extractChaosFeatures(set2);
    
    // 计算相似度
    let similarity = 0;
    for (let i = 0; i < features1.length; i++) {
      similarity += 1 - Math.abs(features1[i] - features2[i]);
    }
    
    return similarity / features1.length;
  }

  private static extractChaosFeatures(numbers: number[]): number[] {
    const features: number[] = [];
    
    if (numbers.length === 0) return features;
    
    // 平均值
    features.push(numbers.reduce((a, b) => a + b, 0) / numbers.length / 49);
    
    // 标准差
    const mean = features[0] * 49;
    const variance = numbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numbers.length;
    features.push(Math.sqrt(variance) / 24.5);
    
    // 奇偶比
    const oddCount = numbers.filter(n => n % 2 === 1).length;
    features.push(oddCount / numbers.length);
    
    // 大小比
    const bigCount = numbers.filter(n => n > 24).length;
    features.push(bigCount / numbers.length);
    
    // 质数比
    const primeCount = numbers.filter(n => this.PRIME_NUMBERS.includes(n)).length;
    features.push(primeCount / numbers.length);
    
    return features;
  }

  private static calculateGeneticAlgorithm(history: DbRecord[], recent20: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 遗传算法参数
    const POPULATION_SIZE = 20;
    const GENERATIONS = 10;
    const MUTATION_RATE = 0.1;
    
    // 提取训练数据
    const trainingData: {input: number[], output: number}[] = [];
    for (let i = 1; i < history.length - 1; i++) {
      const prev = this.parseNumbers(history[i].open_code);
      const current = this.parseNumbers(history[i-1].open_code);
      
      if (prev.length === 7 && current.length === 7) {
        // 输入特征：上一期的7个号码
        // 输出：下一期的特码
        trainingData.push({
          input: prev,
          output: current[6] // 特码
        });
      }
    }
    
    if (trainingData.length < 10) {
      // 数据不足，返回零分
      for (let i = 1; i <= 49; i++) scores[i] = 0;
      return scores;
    }
    
    // 初始化种群（染色体：一组权重）
    let population: number[][] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const chromosome = Array(49).fill(0).map(() => Math.random());
      population.push(chromosome);
    }
    
    // 进化过程
    for (let gen = 0; gen < GENERATIONS; gen++) {
      // 计算适应度
      const fitness: number[] = [];
      population.forEach(chromosome => {
        let totalError = 0;
        trainingData.forEach(data => {
          // 使用染色体权重预测
          let bestScore = -Infinity;
          let bestNum = 1;
          
          for (let num = 1; num <= 49; num++) {
            let score = 0;
            data.input.forEach(n => {
              const weight = chromosome[n-1];
              // 根据距离和权重计算分数
              const distance = Math.abs(num - n);
              score += weight * (1 - distance / 49);
            });
            
            if (score > bestScore) {
              bestScore = score;
              bestNum = num;
            }
          }
          
          // 计算误差
          const error = Math.abs(bestNum - data.output) / 49;
          totalError += error;
        });
        
        fitness.push(1 / (1 + totalError / trainingData.length));
      });
      
      // 选择（轮盘赌选择）
      const totalFitness = fitness.reduce((a, b) => a + b, 0);
      const newPopulation: number[][] = [];
      
      for (let i = 0; i < POPULATION_SIZE; i++) {
        let pick = Math.random() * totalFitness;
        let index = 0;
        while (pick > 0 && index < fitness.length) {
          pick -= fitness[index];
          index++;
        }
        index = Math.min(index, fitness.length - 1);
        
        // 交叉和变异
        let child = [...population[index]];
        
        // 变异
        if (Math.random() < MUTATION_RATE) {
          const mutationPoint = Math.floor(Math.random() * 49);
          child[mutationPoint] = Math.random();
        }
        
        newPopulation.push(child);
      }
      
      population = newPopulation;
    }
    
    // 使用最优染色体计算分数
    const bestChromosome = population[0]; // 简化：使用第一代
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      const lastDraw = this.parseNumbers(recent20[0].open_code);
      
      lastDraw.forEach(n => {
        const weight = bestChromosome[n-1];
        const distance = Math.abs(num - n);
        score += weight * (1 - distance / 49);
      });
      
      scores[num] = score * 100; // 放大分数
    }
    
    return scores;
  }

  private static calculateNeuralNetworkScore(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 简化的神经网络评分（基于模式匹配）
    const patternDatabase: Record<string, number[]> = {};
    
    // 构建模式数据库
    for (let i = 1; i < history.length - 1; i++) {
      const prev = this.parseNumbers(history[i].open_code);
      const current = this.parseNumbers(history[i-1].open_code);
      
      if (prev.length === 7 && current.length === 7) {
        // 创建模式键
        const patternKey = this.createPatternKey(prev);
        if (!patternDatabase[patternKey]) {
          patternDatabase[patternKey] = [];
        }
        patternDatabase[patternKey].push(current[6]); // 记录特码
      }
    }
    
    // 寻找相似模式
    const lastPatternKey = this.createPatternKey(lastDraw);
    let similarPatterns: number[] = [];
    
    Object.keys(patternDatabase).forEach(key => {
      const similarity = this.patternSimilarity(lastPatternKey, key);
      if (similarity > 0.6) {
        similarPatterns = similarPatterns.concat(patternDatabase[key]);
      }
    });
    
    // 统计模式中出现的号码
    const patternCounts: Record<number, number> = {};
    similarPatterns.forEach(num => {
      patternCounts[num] = (patternCounts[num] || 0) + 1;
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      const count = patternCounts[num] || 0;
      const maxCount = Math.max(...Object.values(patternCounts), 1);
      
      scores[num] = (count / maxCount) * 40; // 归一化到0-40分
    }
    
    return scores;
  }

  private static createPatternKey(numbers: number[]): string {
    // 创建模式的简化表示
    const features = [
      numbers.length,
      numbers.reduce((a, b) => a + b, 0),
      numbers.filter(n => n % 2 === 1).length,
      numbers.filter(n => n > 24).length,
      numbers.filter(n => this.PRIME_NUMBERS.includes(n)).length
    ];
    
    // 量化特征
    const quantized = features.map(f => Math.floor(f / 5) * 5);
    return quantized.join('-');
  }

  private static patternSimilarity(key1: string, key2: string): number {
    const parts1 = key1.split('-').map(Number);
    const parts2 = key2.split('-').map(Number);
    
    if (parts1.length !== parts2.length) return 0;
    
    let similarity = 0;
    for (let i = 0; i < parts1.length; i++) {
      const diff = Math.abs(parts1[i] - parts2[i]);
      const maxDiff = Math.max(parts1[i], parts2[i], 1);
      similarity += 1 - (diff / maxDiff);
    }
    
    return similarity / parts1.length;
  }

  // ==========================================
  // 选择与推荐算法
  // ==========================================

  private static selectOptimalNumbers(stats: NumberStat[], count: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const constraints = {
      zodiac: 3,      // 每个生肖最多3个
      wave: 6,        // 每个波色最多6个
      tail: 3,        // 每个尾数最多3个
      wuxing: 4,      // 每个五行最多4个
      bigSmall: 10,   // 大号最多10个
      oddEven: 10     // 奇数最多10个
    };
    
    const counts = {
      zodiac: {} as Record<string, number>,
      wave: {} as Record<string, number>,
      tail: {} as Record<number, number>,
      wuxing: {} as Record<string, number>,
      big: 0,
      odd: 0
    };
    
    // 第一阶段：按分数选择，遵守约束
    for (const stat of stats) {
      if (selected.length >= count) break;
      
      const zodiacCount = counts.zodiac[stat.zodiac] || 0;
      const waveCount = counts.wave[stat.wave] || 0;
      const tailCount = counts.tail[stat.tail] || 0;
      const wuxingCount = counts.wuxing[stat.wuxing] || 0;
      const isBig = stat.num > 24;
      const isOdd = stat.num % 2 === 1;
      
      if (zodiacCount < constraints.zodiac &&
          waveCount < constraints.wave &&
          tailCount < constraints.tail &&
          wuxingCount < constraints.wuxing &&
          (!isBig || counts.big < constraints.bigSmall) &&
          (!isOdd || counts.odd < constraints.oddEven)) {
        
        selected.push(stat);
        counts.zodiac[stat.zodiac] = zodiacCount + 1;
        counts.wave[stat.wave] = waveCount + 1;
        counts.tail[stat.tail] = tailCount + 1;
        counts.wuxing[stat.wuxing] = wuxingCount + 1;
        if (isBig) counts.big++;
        if (isOdd) counts.odd++;
      }
    }
    
    // 第二阶段：如果数量不足，放宽约束
    if (selected.length < count) {
      const remaining = stats.filter(s => !selected.includes(s));
      selected.push(...remaining.slice(0, count - selected.length));
    }
    
    return selected.slice(0, count);
  }

  private static generateRecommendations(numbers: NumberStat[]): PredictionData {
    // 计算生肖推荐
    const zodiacScores: Record<string, number> = {};
    numbers.forEach(s => {
      zodiacScores[s.zodiac] = (zodiacScores[s.zodiac] || 0) + s.totalScore;
    });
    
    const recZodiacs = Object.keys(zodiacScores)
      .sort((a, b) => zodiacScores[b] - zodiacScores[a])
      .slice(0, 6);
    
    // 计算波色推荐
    const waveCounts: Record<string, number> = { red: 0, blue: 0, green: 0 };
    numbers.forEach(s => waveCounts[s.wave]++);
    
    const sortedWaves = Object.entries(waveCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([wave]) => wave);
    
    // 计算头尾数
    const heads = Array.from(new Set(numbers.map(s => Math.floor(s.num / 10))))
      .sort((a, b) => a - b)
      .slice(0, 2)
      .map(String);
    
    const tails = Array.from(new Set(numbers.map(s => s.tail)))
      .sort((a, b) => a - b)
      .slice(0, 5)
      .map(String);
    
    // 生成号码列表
    const resultNumbers = numbers.map(s => s.num)
      .sort((a, b) => a - b)
      .map(n => n < 10 ? `0${n}` : `${n}`);
    
    return {
      zodiacs: recZodiacs,
      numbers: resultNumbers,
      wave: { 
        main: sortedWaves[0] as 'red' | 'blue' | 'green', 
        defense: sortedWaves[1] as 'red' | 'blue' | 'green' 
      },
      heads,
      tails
    };
  }

  private static generateRandom(): PredictionData {
    const nums: string[] = [];
    while(nums.length < 18) {
      const r = Math.floor(Math.random() * 49) + 1;
      const s = r < 10 ? `0${r}` : `${r}`;
      if(!nums.includes(s)) nums.push(s);
    }
    nums.sort((a, b) => parseInt(a) - parseInt(b));
    return {
      zodiacs: ['龙', '马', '猴', '猪', '虎', '鼠'],
      numbers: nums,
      wave: { main: 'red', defense: 'blue' },
      heads: ['0', '1'],
      tails: ['1', '5', '8', '3', '9']
    };
  }

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    return code.split(',').map(n => parseInt(n)).filter(n => !isNaN(n));
  }

  private static getNumWave(n: number): string {
    if (this.WAVES_MAP.red.includes(n)) return 'red';
    if (this.WAVES_MAP.blue.includes(n)) return 'blue';
    return 'green';
  }

  private static getSeasonByMonth(month: number): string {
    if (month >= 1 && month <= 4) return '春';
    if (month >= 5 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }
}
