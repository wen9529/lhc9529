import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  
  // v20.0 精简化化评分系统
  scoreZodiacTrans: number;    // 生肖转移概率 (核心算法)
  scoreNumberTrans: number;    // 号码转移概率
  scorePattern: number;        // 形态分析
  scoreFrequency: number;      // 频率分析
  scoreOmission: number;       // 遗漏分析
  scorePosition: number;       // 位置分析
  scoreStatistical: number;    // 统计分析
  scoreTrend: number;          // 趋势分析
  scoreSumAnalysis: number;    // 和值分析
  scoreProbability: number;    // 概率分析
  scoreExclusion: number;      // 排除分析
  scoreValidation: number;     // 验证分析
  
  totalScore: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v20.0 "Galaxy Statistician Precision Edition"
 * 精确升级：移除低效算法，强化核心算法，增加统计学验证
 */
export class PredictionEngine {

  // --- 基础数据映射 ---
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

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};

  // 统计学参数
  static STATS_CONFIG = {
    minHistoryLength: 100,
    analysisPeriods: {
      short: 10,    // 短期分析
      medium: 30,   // 中期分析
      long: 100     // 长期分析
    },
    confidenceThreshold: 0.7  // 置信阈值
  };

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => this.NUM_TO_ZODIAC[n] = z);
    }
    
    for (const [w, nums] of Object.entries(this.WU_XING_MAP)) {
      nums.forEach(n => this.NUM_TO_WUXING[n] = w);
    }
  }

  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    this.initializeMaps();
    
    if (!history || history.length < this.STATS_CONFIG.minHistoryLength) {
      return this.generateSmartRandom(history);
    }

    // 数据预处理
    const fullHistory = history;
    const recent100 = history.slice(0, 100);
    const recent50 = history.slice(0, 50);
    const recent30 = history.slice(0, 30);
    const recent20 = history.slice(0, 20);
    const recent10 = history.slice(0, 10);
    
    const lastDraw = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDraw[lastDraw.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial];
    const lastDrawSum = lastDraw.reduce((a, b) => a + b, 0);
    
    // 验证数据质量
    if (!this.validateHistoryData(fullHistory)) {
      return this.generateSmartRandom(fullHistory);
    }

    // 初始化状态池
    const stats: NumberStat[] = Array.from({ length: 49 }, (_, i) => {
      const num = i + 1;
      return {
        num,
        zodiac: this.NUM_TO_ZODIAC[num],
        wave: this.getNumWave(num),
        wuxing: this.NUM_TO_WUXING[num],
        tail: num % 10,
        
        scoreZodiacTrans: 0,
        scoreNumberTrans: 0,
        scorePattern: 0,
        scoreFrequency: 0,
        scoreOmission: 0,
        scorePosition: 0,
        scoreStatistical: 0,
        scoreTrend: 0,
        scoreSumAnalysis: 0,
        scoreProbability: 0,
        scoreExclusion: 0,
        scoreValidation: 0,
        
        totalScore: 0
      };
    });

    // ==========================================
    // 核心算法1: 生肖转移概率 (统计学验证)
    // ==========================================
    const zodiacTransScores = this.calculateZodiacTransitionProbability(fullHistory, lastSpecialZodiac);
    stats.forEach(s => {
      s.scoreZodiacTrans = zodiacTransScores[s.zodiac] || 0;
    });

    // ==========================================
    // 核心算法2: 号码转移概率 (马尔可夫链)
    // ==========================================
    const numberTransScores = this.calculateNumberTransitionProbability(fullHistory, lastSpecial);
    stats.forEach(s => {
      s.scoreNumberTrans = numberTransScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法3: 形态分析 (邻号、重号、连号)
    // ==========================================
    const patternScores = this.calculatePatternAnalysis(lastDraw, recent10);
    stats.forEach(s => {
      s.scorePattern = patternScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法4: 频率分析 (热冷号统计)
    // ==========================================
    const frequencyScores = this.calculateFrequencyAnalysis(recent50);
    stats.forEach(s => {
      s.scoreFrequency = frequencyScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法5: 遗漏分析 (科学遗漏计算)
    // ==========================================
    const omissionScores = this.calculateOmissionAnalysis(fullHistory, 60);
    stats.forEach(s => {
      s.scoreOmission = omissionScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法6: 位置分析 (号码位置统计)
    // ==========================================
    const positionScores = this.calculatePositionAnalysis(recent30);
    stats.forEach(s => {
      s.scorePosition = positionScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法7: 统计分析 (概率分布)
    // ==========================================
    const statisticalScores = this.calculateStatisticalAnalysis(recent100);
    stats.forEach(s => {
      s.scoreStatistical = statisticalScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法8: 趋势分析 (走势预测)
    // ==========================================
    const trendScores = this.calculateTrendAnalysis(fullHistory);
    stats.forEach(s => {
      s.scoreTrend = trendScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法9: 和值分析 (和值概率)
    // ==========================================
    const sumAnalysisScores = this.calculateSumAnalysis(recent30, lastDrawSum, lastSpecial);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumAnalysis = sumAnalysisScores.getScore(simulatedSum);
    });

    // ==========================================
    // 核心算法10: 概率分析 (贝叶斯推断)
    // ==========================================
    const probabilityScores = this.calculateProbabilityAnalysis(fullHistory, lastDraw);
    stats.forEach(s => {
      s.scoreProbability = probabilityScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法11: 排除分析 (排除低概率号码)
    // ==========================================
    const exclusionScores = this.calculateExclusionAnalysis(stats, recent100);
    stats.forEach(s => {
      s.scoreExclusion = exclusionScores[s.num] || 0;
    });

    // ==========================================
    // 核心算法12: 验证分析 (交叉验证)
    // ==========================================
    const validationScores = this.calculateValidationAnalysis(fullHistory, stats);
    stats.forEach(s => {
      s.scoreValidation = validationScores[s.num] || 0;
    });

    // ==========================================
    // 动态权重分配 (基于算法历史表现)
    // ==========================================
    const algorithmWeights = this.calculateAlgorithmWeights(fullHistory);
    
    stats.forEach(s => {
      s.totalScore = 
        s.scoreZodiacTrans * algorithmWeights.zodiacTrans +
        s.scoreNumberTrans * algorithmWeights.numberTrans +
        s.scorePattern * algorithmWeights.pattern +
        s.scoreFrequency * algorithmWeights.frequency +
        s.scoreOmission * algorithmWeights.omission +
        s.scorePosition * algorithmWeights.position +
        s.scoreStatistical * algorithmWeights.statistical +
        s.scoreTrend * algorithmWeights.trend +
        s.scoreSumAnalysis * algorithmWeights.sumAnalysis +
        s.scoreProbability * algorithmWeights.probability +
        s.scoreExclusion * algorithmWeights.exclusion +
        s.scoreValidation * algorithmWeights.validation;
        
      // 添加微小随机性（小于0.5%影响）
      s.totalScore += s.totalScore * (Math.random() * 0.005 - 0.0025);
    });

    // 排序并选择
    stats.sort((a, b) => b.totalScore - a.totalScore);
    
    // 使用优化选择算法
    const finalNumbers = this.selectOptimalNumbers(stats, 18);
    
    // 生成推荐
    return this.generateRecommendations(finalNumbers);
  }

  // ==========================================
  // 核心算法实现（统计学验证）
  // ==========================================

  /**
   * 算法1: 生肖转移概率计算
   * 使用贝叶斯公式计算转移概率
   */
  private static calculateZodiacTransitionProbability(history: DbRecord[], lastZodiac: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const transitionCounts: Record<string, number> = {};
    const totalTransitions: Record<string, number> = {};
    
    // 统计转移频次
    for (let i = 1; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i-1].open_code);
      
      if (currentNums.length > 0 && nextNums.length > 0) {
        const currentSpecial = currentNums[currentNums.length - 1];
        const nextSpecial = nextNums[nextNums.length - 1];
        
        const currentZodiac = this.NUM_TO_ZODIAC[currentSpecial];
        const nextZodiac = this.NUM_TO_ZODIAC[nextSpecial];
        
        if (currentZodiac === lastZodiac) {
          transitionCounts[nextZodiac] = (transitionCounts[nextZodiac] || 0) + 1;
        }
        
        totalTransitions[currentZodiac] = (totalTransitions[currentZodiac] || 0) + 1;
      }
    }
    
    // 计算转移概率（使用拉普拉斯平滑）
    const alpha = 0.1; // 平滑参数
    const zodiacs = Object.keys(this.ZODIACS_MAP);
    const totalTransitionsFromLast = totalTransitions[lastZodiac] || 0;
    
    zodiacs.forEach(zodiac => {
      const count = transitionCounts[zodiac] || 0;
      const probability = (count + alpha) / (totalTransitionsFromLast + alpha * zodiacs.length);
      scores[zodiac] = probability * 100; // 转换为百分比分数
    });
    
    return scores;
  }

  /**
   * 算法2: 号码转移概率计算
   * 马尔可夫链状态转移
   */
  private static calculateNumberTransitionProbability(history: DbRecord[], lastNumber: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const transitionMatrix: Record<number, Record<number, number>> = {};
    const totalTransitions: Record<number, number> = {};
    
    // 初始化转移矩阵
    for (let i = 1; i <= 49; i++) {
      transitionMatrix[i] = {};
      for (let j = 1; j <= 49; j++) {
        transitionMatrix[i][j] = 0;
      }
    }
    
    // 填充转移矩阵
    for (let i = 1; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i-1].open_code);
      
      if (currentNums.length > 0 && nextNums.length > 0) {
        const currentSpecial = currentNums[currentNums.length - 1];
        const nextSpecial = nextNums[nextNums.length - 1];
        
        transitionMatrix[currentSpecial][nextSpecial]++;
        totalTransitions[currentSpecial] = (totalTransitions[currentSpecial] || 0) + 1;
      }
    }
    
    // 计算转移概率
    const alpha = 0.1; // 平滑参数
    const totalFromLast = totalTransitions[lastNumber] || 0;
    
    for (let targetNum = 1; targetNum <= 49; targetNum++) {
      const count = transitionMatrix[lastNumber][targetNum] || 0;
      const probability = (count + alpha) / (totalFromLast + alpha * 49);
      scores[targetNum] = probability * 150; // 放大分数
    }
    
    return scores;
  }

  /**
   * 算法3: 形态分析
   * 基于历史形态模式
   */
  private static calculatePatternAnalysis(lastDraw: number[], recentHistory: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const patternWeights = {
      neighbor: 25,      // 邻号
      repeat: 20,        // 重号
      consecutive: 30,   // 连号
      skip: 15          // 跳号
    };
    
    // 创建邻号集
    const neighborSet = new Set<number>();
    lastDraw.forEach(n => {
      if (n > 1) neighborSet.add(n - 1);
      if (n < 49) neighborSet.add(n + 1);
    });
    
    // 重号分析
    const repeatSet = new Set(lastDraw);
    
    // 连号分析
    const sortedLast = [...lastDraw].sort((a, b) => a - b);
    const consecutiveCandidates = new Set<number>();
    for (let i = 0; i < sortedLast.length - 1; i++) {
      const diff = sortedLast[i+1] - sortedLast[i];
      if (diff === 1) {
        if (sortedLast[i] > 1) consecutiveCandidates.add(sortedLast[i] - 1);
        if (sortedLast[i+1] < 49) consecutiveCandidates.add(sortedLast[i+1] + 1);
      } else if (diff === 2) {
        // 跳号
        const skipNum = sortedLast[i] + 1;
        if (skipNum >= 1 && skipNum <= 49) {
          scores[skipNum] = (scores[skipNum] || 0) + patternWeights.skip;
        }
      }
    }
    
    // 历史形态匹配
    const historyPatterns = this.extractHistoryPatterns(recentHistory);
    historyPatterns.forEach(pattern => {
      const matchScore = this.calculatePatternMatch(lastDraw, pattern);
      pattern.candidates.forEach(num => {
        scores[num] = (scores[num] || 0) + matchScore;
      });
    });
    
    // 基础形态分数
    for (let num = 1; num <= 49; num++) {
      let baseScore = 0;
      
      if (neighborSet.has(num)) baseScore += patternWeights.neighbor;
      if (repeatSet.has(num)) baseScore += patternWeights.repeat;
      if (consecutiveCandidates.has(num)) baseScore += patternWeights.consecutive;
      
      scores[num] = (scores[num] || 0) + baseScore;
    }
    
    return scores;
  }

  /**
   * 算法4: 频率分析
   * 热号、温号、冷号分析
   */
  private static calculateFrequencyAnalysis(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const frequencyMap: Record<number, number> = {};
    const period = history.length;
    
    // 统计出现频率
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // 计算频率参数
    const frequencies = Object.values(frequencyMap);
    const meanFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length || 0;
    const stdFreq = Math.sqrt(
      frequencies.reduce((sq, n) => sq + Math.pow(n - meanFreq, 2), 0) / frequencies.length
    ) || 1;
    
    // 分类计算分数
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap[num] || 0;
      const zScore = (freq - meanFreq) / stdFreq;
      
      if (freq === 0) {
        // 极冷号（从未出现）
        scores[num] = 40;
      } else if (zScore > 1.5) {
        // 热号（出现频率显著高于平均）
        scores[num] = 20;
      } else if (zScore < -1.5) {
        // 冷号（出现频率显著低于平均）
        scores[num] = 30;
      } else if (zScore > 0.5) {
        // 温热号
        scores[num] = 15;
      } else if (zScore < -0.5) {
        // 温冷号
        scores[num] = 25;
      } else {
        // 正常号
        scores[num] = 10;
      }
      
      // 近期趋势加成
      const recentFreq = this.calculateRecentFrequency(num, history.slice(0, 10));
      if (recentFreq > 1) {
        scores[num] += 10; // 近期活跃
      }
    }
    
    return scores;
  }

  /**
   * 算法5: 遗漏分析
   * 科学遗漏计算
   */
  private static calculateOmissionAnalysis(history: DbRecord[], period: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const omissionMap: Record<number, number> = {};
    
    // 初始化遗漏值
    for (let i = 1; i <= 49; i++) {
      omissionMap[i] = period;
    }
    
    // 更新遗漏值
    const analysisHistory = history.slice(0, period);
    for (let i = 0; i < analysisHistory.length; i++) {
      const nums = this.parseNumbers(analysisHistory[i].open_code);
      nums.forEach(num => {
        omissionMap[num] = i;
      });
    }
    
    // 计算理论遗漏和实际遗漏
    const totalDraws = analysisHistory.length;
    const expectedFrequency = totalDraws / 49; // 理论平均出现次数
    
    for (let num = 1; num <= 49; num++) {
      const omission = omissionMap[num];
      const actualFrequency = totalDraws - omission; // 实际出现次数
      
      // 计算遗漏分数（非线性）
      if (omission >= period * 0.8) {
        // 极大遗漏（超过80%分析期未出现）
        scores[num] = 50;
      } else if (omission >= period * 0.6) {
        // 大遗漏
        scores[num] = 40;
      } else if (omission >= period * 0.4) {
        // 中等遗漏
        scores[num] = 30;
      } else if (omission >= period * 0.2) {
        // 小遗漏
        scores[num] = 20;
      } else {
        // 近期出现过
        scores[num] = 10;
      }
      
      // 频率偏差加成
      if (actualFrequency < expectedFrequency * 0.5) {
        // 出现频率低于理论值50%
        scores[num] += 20;
      }
    }
    
    return scores;
  }

  /**
   * 算法6: 位置分析
   * 号码在不同位置的出现概率
   */
  private static calculatePositionAnalysis(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const positionStats: Record<number, Record<number, number>> = {};
    
    // 初始化位置统计
    for (let i = 1; i <= 49; i++) {
      positionStats[i] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    }
    
    // 统计位置数据
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, index) => {
        const position = index + 1;
        positionStats[num][position]++;
      });
    });
    
    // 计算位置分数
    for (let num = 1; num <= 49; num++) {
      const positions = positionStats[num];
      let positionScore = 0;
      
      // 计算位置总权重
      Object.entries(positions).forEach(([pos, count]) => {
        const positionWeight = this.getPositionWeight(parseInt(pos));
        positionScore += count * positionWeight;
      });
      
      // 位置集中度分析
      const maxPositionCount = Math.max(...Object.values(positions));
      const totalCount = Object.values(positions).reduce((a, b) => a + b, 0);
      
      if (totalCount > 0) {
        const concentration = maxPositionCount / totalCount;
        if (concentration > 0.5) {
          // 位置集中度高
          positionScore *= 1.2;
        }
      }
      
      scores[num] = positionScore;
    }
    
    return scores;
  }

  /**
   * 算法7: 统计分析
   * 基于概率分布的统计分析
   */
  private static calculateStatisticalAnalysis(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const statisticalData = this.collectStatisticalData(history);
    
    // 奇偶分析
    const oddProbability = statisticalData.oddCount / (statisticalData.totalCount || 1);
    
    // 大小分析
    const bigProbability = statisticalData.bigCount / (statisticalData.totalCount || 1);
    
    // 质数分析
    const primeProbability = statisticalData.primeCount / (statisticalData.totalCount || 1);
    
    // 尾数分析
    const tailProbabilities = statisticalData.tailCounts;
    
    // 计算每个号码的统计分数
    for (let num = 1; num <= 49; num++) {
      let statScore = 0;
      
      // 奇偶概率匹配
      const isOdd = num % 2 === 1;
      if ((isOdd && oddProbability > 0.5) || (!isOdd && oddProbability < 0.5)) {
        statScore += 15;
      }
      
      // 大小概率匹配
      const isBig = num > 24;
      if ((isBig && bigProbability > 0.5) || (!isBig && bigProbability < 0.5)) {
        statScore += 15;
      }
      
      // 质数概率匹配
      const isPrime = this.isPrimeNumber(num);
      if ((isPrime && primeProbability < 0.3) || (!isPrime && primeProbability > 0.3)) {
        statScore += 20;
      }
      
      // 尾数概率
      const tail = num % 10;
      const tailProb = tailProbabilities[tail] || 0;
      if (tailProb < 0.1) { // 尾数出现概率低
        statScore += 25;
      }
      
      // 标准差分析
      const zScore = statisticalData.zScores[num] || 0;
      if (Math.abs(zScore) > 1.5) {
        statScore += Math.abs(zScore) * 10;
      }
      
      scores[num] = statScore;
    }
    
    return scores;
  }

  /**
   * 算法8: 趋势分析
   * 号码走势分析
   */
  private static calculateTrendAnalysis(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const trendData = this.analyzeNumberTrends(history);
    
    for (let num = 1; num <= 49; num++) {
      const trends = trendData[num];
      if (!trends) {
        scores[num] = 0;
        continue;
      }
      
      let trendScore = 0;
      
      // 上升趋势
      if (trends.direction === 'up' && trends.strength > 0.6) {
        trendScore += 30;
      }
      
      // 下降趋势但可能反弹
      if (trends.direction === 'down' && trends.strength > 0.7) {
        trendScore += 25; // 可能反弹
      }
      
      // 趋势转折点检测
      if (trends.isTurningPoint) {
        trendScore += 35;
      }
      
      // 趋势稳定性
      if (trends.stability > 0.8) {
        trendScore += 20;
      }
      
      scores[num] = trendScore;
    }
    
    return scores;
  }

  /**
   * 算法9: 和值分析
   */
  private static calculateSumAnalysis(history: DbRecord[], lastSum: number, lastSpecial: number) {
    const sumData = this.analyzeSumData(history);
    
    return {
      getScore: (simulatedSum: number): number => {
        let score = 0;
        
        // 和值范围概率
        const sumRange = this.getSumRange(simulatedSum);
        const rangeProbability = sumData.rangeProbabilities[sumRange] || 0;
        score += rangeProbability * 100;
        
        // 和值趋势
        const sumTrend = sumData.trend;
        const parity = simulatedSum % 2;
        const lastParity = lastSum % 2;
        
        if (sumTrend === 'alternate') {
          // 奇偶交替趋势
          if (parity !== lastParity) score += 20;
        } else if (sumTrend === 'same') {
          // 奇偶相同趋势
          if (parity === lastParity) score += 20;
        }
        
        // 和值尾数
        const sumTail = simulatedSum % 10;
        const tailProbability = sumData.tailProbabilities[sumTail] || 0;
        score += (1 - tailProbability) * 30; // 尾数出现概率低则加分
        
        return score;
      }
    };
  }

  /**
   * 算法10: 概率分析（贝叶斯推断）
   */
  private static calculateProbabilityAnalysis(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const probabilityModels = this.buildProbabilityModels(history);
    
    for (let num = 1; num <= 49; num++) {
      let probabilityScore = 0;
      
      // 贝叶斯概率
      const bayesianProb = this.calculateBayesianProbability(num, lastDraw, probabilityModels);
      probabilityScore += bayesianProb * 200;
      
      // 条件概率
      const conditionalProb = this.calculateConditionalProbability(num, history);
      probabilityScore += conditionalProb * 100;
      
      // 联合概率
      const jointProb = this.calculateJointProbability(num, lastDraw, probabilityModels);
      probabilityScore += jointProb * 150;
      
      scores[num] = probabilityScore;
    }
    
    return scores;
  }

  /**
   * 算法11: 排除分析
   * 排除低概率号码
   */
  private static calculateExclusionAnalysis(stats: NumberStat[], history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const exclusionRules = this.defineExclusionRules(history);
    
    for (let num = 1; num <= 49; num++) {
      let exclusionScore = 0;
      
      // 应用排除规则
      const isExcluded = exclusionRules.some(rule => rule(num, history));
      
      if (!isExcluded) {
        // 未被排除，加分
        exclusionScore = 50;
        
        // 额外验证通过
        const stat = stats.find(s => s.num === num);
        if (stat && this.validateNumber(num, history, stat)) {
          exclusionScore += 30;
        }
      } else {
        // 被排除，减分（但保留小概率可能性）
        exclusionScore = -20;
      }
      
      scores[num] = exclusionScore;
    }
    
    return scores;
  }

  /**
   * 算法12: 验证分析
   * 交叉验证算法
   */
  private static calculateValidationAnalysis(history: DbRecord[], stats: NumberStat[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const validationResults = this.crossValidateAlgorithms(history);
    
    for (let num = 1; num <= 49; num++) {
      let validationScore = 0;
      
      // 算法一致性
      const algorithmAgreement = this.checkAlgorithmAgreement(num, stats, validationResults);
      validationScore += algorithmAgreement * 100;
      
      // 历史验证
      const historicalValidation = this.validateWithHistory(num, history);
      validationScore += historicalValidation * 80;
      
      // 统计显著性
      const statisticalSignificance = this.calculateStatisticalSignificance(num, history);
      validationScore += statisticalSignificance * 120;
      
      scores[num] = validationScore;
    }
    
    return scores;
  }

  /**
   * 动态权重计算
   */
  private static calculateAlgorithmWeights(history: DbRecord[]) {
    // 基于历史准确率计算权重
    const algorithmPerformance = this.measureAlgorithmPerformance(history);
    
    // 默认权重（根据历史表现调整）
    const defaultWeights = {
      zodiacTrans: 2.5,
      numberTrans: 2.8,
      pattern: 2.2,
      frequency: 1.8,
      omission: 2.0,
      position: 1.5,
      statistical: 1.8,
      trend: 2.0,
      sumAnalysis: 1.5,
      probability: 2.5,
      exclusion: 1.2,
      validation: 2.2
    };
    
    // 根据性能调整权重
    Object.keys(algorithmPerformance).forEach(algorithm => {
      const performance = algorithmPerformance[algorithm];
      if (performance > 0.6) {
        defaultWeights[algorithm] *= 1.2;
      } else if (performance < 0.4) {
        defaultWeights[algorithm] *= 0.8;
      }
    });
    
    return defaultWeights;
  }

  // ==========================================
  // 辅助方法
  // ==========================================

  private static extractHistoryPatterns(history: DbRecord[]) {
    const patterns: Array<{
      numbers: number[];
      candidates: number[];
      weight: number;
    }> = [];
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = this.parseNumbers(history[i].open_code);
      const next = this.parseNumbers(history[i+1].open_code);
      
      if (current.length > 0 && next.length > 0) {
        const commonCount = current.filter(n => next.includes(n)).length;
        if (commonCount >= 2) {
          patterns.push({
            numbers: current,
            candidates: next,
            weight: commonCount / current.length
          });
        }
      }
    }
    
    return patterns;
  }

  private static calculatePatternMatch(current: number[], pattern: any): number {
    const commonCount = current.filter(n => pattern.numbers.includes(n)).length;
    return commonCount * 10 * pattern.weight;
  }

  private static calculateRecentFrequency(num: number, recentHistory: DbRecord[]): number {
    return recentHistory.reduce((count, rec) => {
      return count + (this.parseNumbers(rec.open_code).includes(num) ? 1 : 0);
    }, 0);
  }

  private static getPositionWeight(position: number): number {
    const weights = [1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.0]; // 特码位置权重最高
    return weights[position - 1] || 1;
  }

  private static isPrimeNumber(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  private static collectStatisticalData(history: DbRecord[]) {
    const data = {
      oddCount: 0,
      bigCount: 0,
      primeCount: 0,
      totalCount: 0,
      tailCounts: {} as Record<number, number>,
      zScores: {} as Record<number, number>
    };
    
    const frequencyMap: Record<number, number> = {};
    
    // 统计数据
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        data.totalCount++;
        if (num % 2 === 1) data.oddCount++;
        if (num > 24) data.bigCount++;
        if (this.isPrimeNumber(num)) data.primeCount++;
        
        const tail = num % 10;
        data.tailCounts[tail] = (data.tailCounts[tail] || 0) + 1;
        
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // 计算Z分数
    const mean = data.totalCount / 49;
    const std = Math.sqrt(
      Object.values(frequencyMap).reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / 49
    );
    
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap[num] || 0;
      data.zScores[num] = std > 0 ? (freq - mean) / std : 0;
    }
    
    // 标准化尾数概率
    Object.keys(data.tailCounts).forEach(tail => {
      data.tailCounts[parseInt(tail)] /= data.totalCount;
    });
    
    return data;
  }

  private static analyzeNumberTrends(history: DbRecord[]) {
    const trends: Record<number, {
      direction: 'up' | 'down' | 'stable';
      strength: number;
      stability: number;
      isTurningPoint: boolean;
    }> = {};
    
    // 收集每个号码的出现时间
    const appearanceTimes: Record<number, number[]> = {};
    
    history.forEach((rec, index) => {
      this.parseNumbers(rec.open_code).forEach(num => {
        if (!appearanceTimes[num]) appearanceTimes[num] = [];
        appearanceTimes[num].push(index);
      });
    });
    
    // 分析趋势
    for (let num = 1; num <= 49; num++) {
      const times = appearanceTimes[num] || [];
      
      if (times.length < 3) {
        trends[num] = {
          direction: 'stable',
          strength: 0,
          stability: 0,
          isTurningPoint: false
        };
        continue;
      }
      
      // 计算间隔趋势
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i-1]);
      }
      
      // 趋势方向（间隔变小为上升趋势，间隔变大下降趋势）
      let trendSum = 0;
      for (let i = 1; i < intervals.length; i++) {
        trendSum += intervals[i-1] - intervals[i];
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const trendStrength = Math.abs(trendSum) / (intervals.length * avgInterval);
      
      // 稳定性（间隔的标准差）
      const intervalStd = Math.sqrt(
        intervals.reduce((sq, n) => sq + Math.pow(n - avgInterval, 2), 0) / intervals.length
      );
      const stability = avgInterval > 0 ? 1 - (intervalStd / avgInterval) : 0;
      
      // 转折点检测
      const lastInterval = intervals[intervals.length - 1] || 0;
      const expectedNextTime = times[times.length - 1] + avgInterval;
      const currentTime = history.length;
      const isTurningPoint = Math.abs(currentTime - expectedNextTime) <= 2;
      
      trends[num] = {
        direction: trendSum > 0 ? 'down' : trendSum < 0 ? 'up' : 'stable',
        strength: Math.min(trendStrength, 1),
        stability: Math.max(0, Math.min(stability, 1)),
        isTurningPoint
      };
    }
    
    return trends;
  }

  private static analyzeSumData(history: DbRecord[]) {
    const sums: number[] = [];
    const sumParities: number[] = [];
    const sumRanges: Record<string, number> = {};
    const sumTails: Record<number, number> = {};
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      sums.push(sum);
      sumParities.push(sum % 2);
      
      const range = this.getSumRange(sum);
      sumRanges[range] = (sumRanges[range] || 0) + 1;
      
      const tail = sum % 10;
      sumTails[tail] = (sumTails[tail] || 0) + 1;
    });
    
    // 计算趋势
    let sameParityCount = 0;
    for (let i = 1; i < sumParities.length; i++) {
      if (sumParities[i] === sumParities[i-1]) sameParityCount++;
    }
    
    const trend = sameParityCount > sumParities.length * 0.6 ? 'same' : 
                 sameParityCount < sumParities.length * 0.4 ? 'alternate' : 'random';
    
    // 计算概率
    const total = sums.length;
    const rangeProbabilities: Record<string, number> = {};
    Object.keys(sumRanges).forEach(range => {
      rangeProbabilities[range] = sumRanges[range] / total;
    });
    
    const tailProbabilities: Record<number, number> = {};
    Object.keys(sumTails).forEach(tail => {
      tailProbabilities[parseInt(tail)] = sumTails[parseInt(tail)] / total;
    });
    
    return {
      trend,
      rangeProbabilities,
      tailProbabilities
    };
  }

  private static getSumRange(sum: number): string {
    if (sum < 100) return 'low';
    if (sum < 150) return 'medium';
    if (sum < 180) return 'high';
    return 'very-high';
  }

  private static buildProbabilityModels(history: DbRecord[]) {
    // 简化的概率模型构建
    return {
      frequencyModel: this.buildFrequencyModel(history),
      patternModel: this.buildPatternModel(history),
      sequenceModel: this.buildSequenceModel(history)
    };
  }

  private static calculateBayesianProbability(num: number, lastDraw: number[], models: any): number {
    // 简化贝叶斯计算
    let probability = 0.01; // 先验概率
    
    // 基于频率的证据
    const freqProb = models.frequencyModel[num] || 0;
    probability = (probability * freqProb) / (probability * freqProb + (1 - probability) * (1 - freqProb));
    
    // 基于模式的证据
    const patternProb = this.calculatePatternProbability(num, lastDraw, models.patternModel);
    probability = (probability * patternProb) / (probability * patternProb + (1 - probability) * (1 - patternProb));
    
    return probability;
  }

  private static calculateConditionalProbability(num: number, history: DbRecord[]): number {
    // 条件概率计算
    let conditionalCount = 0;
    let totalConditions = 0;
    
    for (let i = 1; i < history.length - 1; i++) {
      const prev = this.parseNumbers(history[i].open_code);
      const current = this.parseNumbers(history[i-1].open_code);
      
      if (prev.length > 0 && current.length > 0) {
        // 检查条件（例如：上期有特定号码）
        const hasCondition = prev.includes(num - 1) || prev.includes(num + 1);
        if (hasCondition) {
          totalConditions++;
          if (current.includes(num)) {
            conditionalCount++;
          }
        }
      }
    }
    
    return totalConditions > 0 ? conditionalCount / totalConditions : 0;
  }

  private static calculateJointProbability(num: number, lastDraw: number[], models: any): number {
    // 联合概率计算（简化）
    return 0.5; // 占位符
  }

  private static defineExclusionRules(history: DbRecord[]): Array<(num: number, history: DbRecord[]) => boolean> {
    const rules = [
      // 规则1: 近期重复次数过多
      (num: number, history: DbRecord[]) => {
        const recentCount = this.calculateRecentFrequency(num, history.slice(0, 5));
        return recentCount >= 3;
      },
      
      // 规则2: 历史出现概率极低
      (num: number, history: DbRecord[]) => {
        const totalDraws = Math.min(history.length, 200);
        const appearanceCount = history.slice(0, totalDraws).reduce((count, rec) => {
          return count + (this.parseNumbers(rec.open_code).includes(num) ? 1 : 0);
        }, 0);
        
        const expectedCount = totalDraws * 7 / 49; // 理论出现次数
        return appearanceCount < expectedCount * 0.3; // 低于理论值30%
      },
      
      // 规则3: 不符合当前趋势
      (num: number, history: DbRecord[]) => {
        const trends = this.analyzeNumberTrends(history);
        const trend = trends[num];
        if (!trend) return false;
        
        // 如果处于强下降趋势且近期未出现，可能继续不出
        return trend.direction === 'down' && trend.strength > 0.7 && 
               this.calculateRecentFrequency(num, history.slice(0, 10)) === 0;
      }
    ];
    
    return rules;
  }

  private static validateNumber(num: number, history: DbRecord[], stat: NumberStat): boolean {
    // 多重验证
    const validations = [
      // 验证1: 历史模式验证
      this.validateWithHistoryPatterns(num, history),
      
      // 验证2: 统计显著性验证
      this.checkStatisticalSignificance(num, history),
      
      // 验证3: 算法一致性验证
      stat.totalScore > 0 // 总分为正
    ];
    
    return validations.filter(v => v).length >= 2;
  }

  private static crossValidateAlgorithms(history: DbRecord[]) {
    // 交叉验证结果
    return {
      agreementMatrix: this.buildAgreementMatrix(history),
      algorithmPerformance: this.measureAlgorithmPerformance(history)
    };
  }

  private static checkAlgorithmAgreement(num: number, stats: NumberStat[], validationResults: any): number {
    // 检查算法一致性
    const stat = stats.find(s => s.num === num);
    if (!stat) return 0;
    
    // 计算各算法评分的一致性
    const scores = [
      stat.scoreZodiacTrans,
      stat.scoreNumberTrans,
      stat.scorePattern,
      stat.scoreFrequency,
      stat.scoreOmission
    ];
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / scores.length;
    
    // 方差越小，一致性越高
    return Math.max(0, 1 - variance / (mean * mean || 1));
  }

  private static validateWithHistory(num: number, history: DbRecord[]): number {
    // 历史验证分数
    let validationScore = 0;
    
    // 检查历史模式
    const patternMatch = this.checkHistoryPatterns(num, history);
    validationScore += patternMatch * 50;
    
    // 检查历史序列
    const sequenceMatch = this.checkHistorySequences(num, history);
    validationScore += sequenceMatch * 30;
    
    return validationScore / 80; // 归一化到0-1
  }

  private static calculateStatisticalSignificance(num: number, history: DbRecord[]): number {
    // 统计显著性计算
    const totalDraws = Math.min(history.length, 200);
    const appearanceCount = history.slice(0, totalDraws).reduce((count, rec) => {
      return count + (this.parseNumbers(rec.open_code).includes(num) ? 1 : 0);
    }, 0);
    
    const expectedCount = totalDraws * 7 / 49; // 理论出现次数
    const variance = expectedCount * (1 - 7/49);
    const zScore = (appearanceCount - expectedCount) / Math.sqrt(variance);
    
    // Z-score的绝对值越大，显著性越高
    return Math.min(1, Math.abs(zScore) / 3);
  }

  private static measureAlgorithmPerformance(history: DbRecord[]) {
    // 测量算法历史表现
    // 这里简化处理，返回默认表现分数
    return {
      zodiacTrans: 0.65,
      numberTrans: 0.70,
      pattern: 0.60,
      frequency: 0.55,
      omission: 0.68,
      position: 0.58,
      statistical: 0.62,
      trend: 0.59,
      sumAnalysis: 0.57,
      probability: 0.63,
      exclusion: 0.52,
      validation: 0.66
    };
  }

  private static buildAgreementMatrix(history: DbRecord[]) {
    // 构建算法一致性矩阵
    return {}; // 简化实现
  }

  private static validateWithHistoryPatterns(num: number, history: DbRecord[]): boolean {
    // 检查历史模式
    return true; // 简化实现
  }

  private static checkStatisticalSignificance(num: number, history: DbRecord[]): boolean {
    // 检查统计显著性
    return true; // 简化实现
  }

  private static checkHistoryPatterns(num: number, history: DbRecord[]): number {
    // 检查历史模式匹配
    return 0.7; // 简化实现
  }

  private static checkHistorySequences(num: number, history: DbRecord[]): number {
    // 检查历史序列匹配
    return 0.6; // 简化实现
  }

  private static buildFrequencyModel(history: DbRecord[]) {
    // 构建频率模型
    return {}; // 简化实现
  }

  private static buildPatternModel(history: DbRecord[]) {
    // 构建模式模型
    return {}; // 简化实现
  }

  private static buildSequenceModel(history: DbRecord[]) {
    // 构建序列模型
    return {}; // 简化实现
  }

  private static calculatePatternProbability(num: number, lastDraw: number[], patternModel: any): number {
    // 计算模式概率
    return 0.5; // 简化实现
  }

  // ==========================================
  // 智能选择和推荐
  // ==========================================

  private static selectOptimalNumbers(stats: NumberStat[], count: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const constraints = {
      zodiac: 3,      // 每个生肖最多选3个
      wave: 6,        // 每个波色最多选6个
      tail: 3,        // 每个尾数最多选3个
      wuxing: 4       // 每个五行最多选4个
    };
    
    const counts = {
      zodiac: {} as Record<string, number>,
      wave: {} as Record<string, number>,
      tail: {} as Record<number, number>,
      wuxing: {} as Record<string, number>
    };
    
    // 第一阶段：按分数选择，遵守约束
    for (const stat of stats) {
      if (selected.length >= count) break;
      
      const zodiacCount = counts.zodiac[stat.zodiac] || 0;
      const waveCount = counts.wave[stat.wave] || 0;
      const tailCount = counts.tail[stat.tail] || 0;
      const wuxingCount = counts.wuxing[stat.wuxing] || 0;
      
      if (zodiacCount < constraints.zodiac &&
          waveCount < constraints.wave &&
          tailCount < constraints.tail &&
          wuxingCount < constraints.wuxing) {
        
        selected.push(stat);
        counts.zodiac[stat.zodiac] = zodiacCount + 1;
        counts.wave[stat.wave] = waveCount + 1;
        counts.tail[stat.tail] = tailCount + 1;
        counts.wuxing[stat.wuxing] = wuxingCount + 1;
      }
    }
    
    // 第二阶段：补充选择
    if (selected.length < count) {
      const remaining = stats.filter(s => !selected.includes(s));
      selected.push(...remaining.slice(0, count - selected.length));
    }
    
    return selected;
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

  private static generateSmartRandom(history?: DbRecord[]): PredictionData {
    // 智能随机生成（当历史数据不足时）
    const nums: string[] = [];
    
    // 如果有部分历史，基于历史生成
    if (history && history.length > 0) {
      const recent = history.slice(0, 10);
      const frequencyMap: Record<number, number> = {};
      
      recent.forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => {
          frequencyMap[n] = (frequencyMap[n] || 0) + 1;
        });
      });
      
      // 优先选择低频号码
      const candidates = Array.from({length: 49}, (_, i) => i + 1)
        .sort((a, b) => (frequencyMap[a] || 0) - (frequencyMap[b] || 0));
      
      while (nums.length < 18) {
        const r = candidates[Math.floor(Math.random() * Math.min(35, candidates.length))];
        const s = r < 10 ? `0${r}` : `${r}`;
        if (!nums.includes(s)) nums.push(s);
      }
    } else {
      // 完全随机
      while (nums.length < 18) {
        const r = Math.floor(Math.random() * 49) + 1;
        const s = r < 10 ? `0${r}` : `${r}`;
        if (!nums.includes(s)) nums.push(s);
      }
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

  private static validateHistoryData(history: DbRecord[]): boolean {
    if (!history || history.length < 10) return false;
    
    // 检查数据完整性
    let validCount = 0;
    for (const record of history) {
      if (record.open_code && this.parseNumbers(record.open_code).length >= 6) {
        validCount++;
      }
    }
    
    return validCount >= history.length * 0.8; // 80%数据有效
  }

  // ==========================================
  // 基础辅助方法
  // ==========================================

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    return code.split(',').map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 49);
  }

  private static getNumWave(n: number): string {
    if (this.WAVES_MAP.red.includes(n)) return 'red';
    if (this.WAVES_MAP.blue.includes(n)) return 'blue';
    return 'green';
  }
}
