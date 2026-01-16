import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  
  // v12.0 十八维度终极评分系统
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
  
  totalScore: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v12.0 "Galaxy Statistician Ultimate Edition"
 * 终极升级：整合十八维度确定性算法，实现科学精准预测
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

  // 季节映射
  static SEASONAL_ZODIACS: Record<string, string[]> = {
    '春': ['虎', '兔', '龙'],
    '夏': ['蛇', '马', '羊'],
    '秋': ['猴', '鸡', '狗'],
    '冬': ['猪', '鼠', '牛']
  };

  // 质数号码
  static PRIME_NUMBERS: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

  // 对称号码对
  static SYMMETRY_PAIRS: [number, number][] = [
    [1, 49], [2, 48], [3, 47], [4, 46], [5, 45], [6, 44], [7, 43],
    [8, 42], [9, 41], [10, 40], [11, 39], [12, 38], [13, 37], [14, 36],
    [15, 35], [16, 34], [17, 33], [18, 32], [19, 31], [20, 30], [21, 29],
    [22, 28], [23, 27], [24, 26]
  ];

  // 周期分析参数
  static PERIODIC_CYCLES = {
    zodiac: 12,     // 生肖周期
    wave: 7,        // 波色周期
    wuxing: 5,      // 五行周期
    tail: 10        // 尾数周期
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};

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
    
    if (!history || history.length < 50) return this.generateRandom();

    // 0. 数据预处理
    const fullHistory = history;
    const recent50 = history.slice(0, 50);
    const recent30 = history.slice(0, 30);
    const recent20 = history.slice(0, 20);
    const recent10 = history.slice(0, 10);
    
    const lastDrawNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial];
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    
    // 获取当前时间信息
    const currentDate = history[0].draw_time ? new Date(history[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;

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
        totalScore: 0
      };
    });

    // ==========================================
    // 算法 1: 生肖转移概率 (核心算法)
    // ==========================================
    const zodiacTransMap: Record<string, number> = {};
    let zodiacTransTotal = 0;

    for (let i = 1; i < fullHistory.length - 1; i++) {
      const histNums = this.parseNumbers(fullHistory[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      const histZodiac = this.NUM_TO_ZODIAC[histSpecial];

      if (histZodiac === lastSpecialZodiac) {
        const nextNums = this.parseNumbers(fullHistory[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        const nextZodiac = this.NUM_TO_ZODIAC[nextSpecial];
        
        zodiacTransMap[nextZodiac] = (zodiacTransMap[nextZodiac] || 0) + 1;
        zodiacTransTotal++;
      }
    }
    
    stats.forEach(s => {
      const occurrences = zodiacTransMap[s.zodiac] || 0;
      if (zodiacTransTotal > 0) {
        s.scoreZodiacTrans = (occurrences / zodiacTransTotal) * 50;
      }
    });

    // ==========================================
    // 算法 2: 特码转移概率
    // ==========================================
    const numTransMap: Record<number, number> = {};
    for (let i = 1; i < fullHistory.length - 1; i++) {
      const histNums = this.parseNumbers(fullHistory[i].open_code);
      const histSpecial = histNums[histNums.length - 1];
      
      if (histSpecial === lastSpecial) {
        const nextNums = this.parseNumbers(fullHistory[i-1].open_code);
        const nextSpecial = nextNums[nextNums.length - 1];
        numTransMap[nextSpecial] = (numTransMap[nextSpecial] || 0) + 1;
      }
    }
    stats.forEach(s => s.scoreNumberTrans = (numTransMap[s.num] || 0) * 6);

    // ==========================================
    // 算法 3: 历史镜像分析
    // ==========================================
    const mirrorScores = this.calculateHistoryMirror(fullHistory, lastDrawNums);
    stats.forEach(s => s.scoreHistoryMirror = mirrorScores[s.num] || 0);

    // ==========================================
    // 算法 4: 特码轨迹分析
    // ==========================================
    const trajectoryAnalysis = this.analyzeTrajectory(fullHistory, lastSpecial);
    stats.forEach(s => {
      s.scoreSpecialTraj = trajectoryAnalysis[s.num] || 0;
    });

    // ==========================================
    // 算法 5: 形态几何分析
    // ==========================================
    const patternScores = this.calculatePatternScores(lastDrawNums, recent10);
    stats.forEach(s => {
      s.scorePattern = patternScores[s.num] || 0;
    });

    // ==========================================
    // 算法 6: 尾数力场分析
    // ==========================================
    const tailScores = this.calculateTailScores(recent10);
    stats.forEach(s => {
      s.scoreTail = tailScores[s.tail] || 0;
    });

    // ==========================================
    // 算法 7: 三合局势分析
    // ==========================================
    const zodiacScores = this.calculateZodiacScores(recent20, lastSpecialZodiac);
    stats.forEach(s => {
      s.scoreZodiac = zodiacScores[s.zodiac] || 0;
    });

    // ==========================================
    // 算法 8: 五行平衡分析
    // ==========================================
    const wuxingScores = this.calculateWuxingScores(recent10);
    stats.forEach(s => {
      s.scoreWuXing = wuxingScores[s.wuxing] || 0;
    });

    // ==========================================
    // 算法 9: 波色惯性分析
    // ==========================================
    const waveScores = this.calculateWaveScores(recent10, lastSpecial);
    stats.forEach(s => {
      s.scoreWave = waveScores[s.wave] || 0;
    });

    // ==========================================
    // 算法 10: 黄金密钥分析
    // ==========================================
    const goldNumbers = this.calculateGoldNumbers(lastDrawSum, lastSpecial);
    stats.forEach(s => {
      if (goldNumbers.includes(s.num)) s.scoreGold = 25;
    });

    // ==========================================
    // 算法 11: 遗漏回补分析
    // ==========================================
    const omissionScores = this.calculateOmissionScores(fullHistory, 40);
    stats.forEach(s => {
      s.scoreOmission = omissionScores[s.num] || 0;
    });

    // ==========================================
    // 算法 12: 季节规律分析
    // ==========================================
    const seasonalScores = this.calculateSeasonalScores(currentMonth, currentWeek);
    stats.forEach(s => {
      s.scoreSeasonal = seasonalScores[s.zodiac] || 0;
      if (s.num % 10 === currentMonth % 10) s.scoreSeasonal += 5;
    });

    // ==========================================
    // 算法 13: 质数分布分析
    // ==========================================
    const primeAnalysis = this.analyzePrimeDistribution(recent20);
    stats.forEach(s => {
      const isPrime = this.PRIME_NUMBERS.includes(s.num);
      
      if (primeAnalysis.needMorePrimes && isPrime) {
        s.scorePrime = 15;
      } else if (primeAnalysis.needMoreComposites && !isPrime) {
        s.scorePrime = 15;
      }
      
      // 质数连续性
      if (this.PRIME_NUMBERS.includes(lastSpecial) && isPrime) {
        s.scorePrime += 10;
      }
    });

    // ==========================================
    // 算法 14: 和值分析
    // ==========================================
    const sumAnalysis = this.analyzeSumPatterns(recent20, lastDrawSum);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumAnalysis = sumAnalysis.getScore(simulatedSum);
    });

    // ==========================================
    // 算法 15: 位置分析
    // ==========================================
    const positionScores = this.calculatePositionScores(recent20);
    stats.forEach(s => {
      s.scorePosition = positionScores[s.num] || 0;
    });

    // ==========================================
    // 算法 16: [NEW] 频率分析
    // ==========================================
    const frequencyScores = this.calculateFrequencyScores(recent30);
    stats.forEach(s => {
      s.scoreFrequency = frequencyScores[s.num] || 0;
    });

    // ==========================================
    // 算法 17: [NEW] 聚类分析
    // ==========================================
    const clusterScores = this.calculateClusterScores(lastDrawNums, recent20);
    stats.forEach(s => {
      s.scoreCluster = clusterScores[s.num] || 0;
    });

    // ==========================================
    // 算法 18: [NEW] 对称分析
    // ==========================================
    const symmetryScores = this.calculateSymmetryScores(recent20, lastDrawNums);
    stats.forEach(s => {
      s.scoreSymmetry = symmetryScores[s.num] || 0;
    });

    // ==========================================
    // 算法 19: [NEW] 周期分析
    // ==========================================
    const periodicScores = this.calculatePeriodicScores(fullHistory, currentWeek);
    stats.forEach(s => {
      s.scorePeriodic = periodicScores[s.num] || 0;
    });

    // ==========================================
    // 算法 20: [NEW] 趋势分析
    // ==========================================
    const trendScores = this.calculateTrendScores(fullHistory);
    stats.forEach(s => {
      s.scoreTrend = trendScores[s.num] || 0;
    });

    // ==========================================
    // 最终汇总 - 十八维度权重分配
    // ==========================================
    stats.forEach(s => {
      s.totalScore = 
        s.scoreZodiacTrans * 2.5 +     // 生肖转移概率 (核心)
        s.scoreNumberTrans * 2.0 +     // 特码转移概率
        s.scoreHistoryMirror * 1.5 +   // 历史镜像
        s.scoreSpecialTraj * 1.3 +     // 特码轨迹
        s.scorePattern * 1.2 +         // 形态几何
        s.scoreTail * 1.0 +           // 尾数力场
        s.scoreZodiac * 1.0 +         // 三合局势
        s.scoreWuXing * 0.9 +         // 五行平衡
        s.scoreWave * 0.9 +           // 波色惯性
        s.scoreGold * 0.8 +           // 黄金密钥
        s.scoreOmission * 0.8 +       // 遗漏回补
        s.scoreSeasonal * 0.7 +       // 季节规律
        s.scorePrime * 0.7 +          // 质数分布
        s.scoreSumAnalysis * 0.6 +    // 和值分析
        s.scorePosition * 0.6 +       // 位置分析
        s.scoreFrequency * 0.6 +      // 频率分析
        s.scoreCluster * 0.5 +        // 聚类分析
        s.scoreSymmetry * 0.5 +       // 对称分析
        s.scorePeriodic * 0.5 +       // 周期分析
        s.scoreTrend * 0.5;           // 趋势分析
        
      // 极微扰动
      s.totalScore += Math.random() * 0.05;
    });

    // 排序
    stats.sort((a, b) => b.totalScore - a.totalScore);

    // 多样性选码
    const final18 = this.selectDiverseNumbers(stats, 18);
    const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 计算推荐肖 (基于前18码的总分权重)
    const zMap: Record<string, number> = {};
    final18.forEach(s => zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore);
    const recZodiacs = Object.keys(zMap).sort((a, b) => zMap[b] - zMap[a]).slice(0, 6);

    // 计算推荐波
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    final18.forEach(s => wMap[s.wave]++);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 计算推荐头尾
    const hSet = new Set(final18.map(s => Math.floor(s.num / 10)));
    const tSet = new Set(final18.map(s => s.tail));
    const recTails = Array.from(tSet).sort().slice(0, 5).map(String);

    return {
        zodiacs: recZodiacs,
        numbers: resultNumbers,
        wave: { main: recWaves[0], defense: recWaves[1] },
        heads: Array.from(hSet).sort().slice(0, 2).map(String),
        tails: recTails
    };
  }

  // ==========================================
  // 新增算法实现
  // ==========================================

  /**
   * 频率分析 - 基于最近出现频率
   */
  private static calculateFrequencyScores(history: DbRecord[]): Record<number, number> {
    const frequencyMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 统计频率
    history.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // 计算频率分数
    const maxFreq = Math.max(...Object.values(frequencyMap));
    const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Object.keys(frequencyMap).length;
    
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap[num] || 0;
      
      if (freq > avgFreq * 1.5) {
        scores[num] = 15; // 热号
      } else if (freq < avgFreq * 0.5) {
        scores[num] = 12; // 冷号（可能回补）
      } else if (freq === 0) {
        scores[num] = 20; // 极冷号
      } else {
        scores[num] = Math.min((freq / maxFreq) * 10, 10);
      }
    }
    
    return scores;
  }

  /**
   * 聚类分析 - 号码空间聚类
   */
  private static calculateClusterScores(lastDraw: number[], history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 计算最近开奖号码的聚类中心
    const recentNumbers: number[] = [];
    history.slice(0, 10).forEach(rec => {
      recentNumbers.push(...this.parseNumbers(rec.open_code));
    });
    
    // 计算每个号码到最近开奖号码的平均距离
    for (let num = 1; num <= 49; num++) {
      let totalDistance = 0;
      let count = 0;
      
      // 计算到上期号码的距离
      lastDraw.forEach(n => {
        totalDistance += Math.abs(num - n);
        count++;
      });
      
      // 计算到历史聚类中心的距离
      const recentAvg = recentNumbers.reduce((a, b) => a + b, 0) / recentNumbers.length;
      totalDistance += Math.abs(num - recentAvg) * 2;
      count += 2;
      
      const avgDistance = totalDistance / count;
      
      // 距离越近，分数越高（倾向于选择接近历史号码的号码）
      scores[num] = Math.max(0, 20 - avgDistance);
    }
    
    return scores;
  }

  /**
   * 对称分析 - 号码对称性
   */
  private static calculateSymmetryScores(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const symmetryMap: Record<number, number> = {};
    
    // 统计对称号码出现的次数
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        // 找到对称号码
        const symmetricNum = 50 - num;
        if (symmetricNum >= 1 && symmetricNum <= 49) {
          symmetryMap[symmetricNum] = (symmetryMap[symmetricNum] || 0) + 1;
        }
      });
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      // 检查上期号码的对称性
      lastDraw.forEach(n => {
        if (50 - n === num) {
          score += 15; // 上期号码的对称号码
        }
      });
      
      // 检查历史对称性
      const symmetricNum = 50 - num;
      if (symmetryMap[num] && symmetryMap[num] > 0) {
        score += symmetryMap[num] * 2;
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 周期分析 - 号码周期规律
   */
  private static calculatePeriodicScores(history: DbRecord[], currentWeek: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const periodMap: Record<number, number[]> = {};
    
    // 初始化周期记录
    for (let i = 1; i <= 49; i++) {
      periodMap[i] = [];
    }
    
    // 记录每个号码出现的周次
    history.forEach((rec, index) => {
      const weekNum = Math.floor(index / 7) + 1;
      this.parseNumbers(rec.open_code).forEach(num => {
        periodMap[num].push(weekNum);
      });
    });
    
    // 分析周期性
    for (let num = 1; num <= 49; num++) {
      const appearances = periodMap[num];
      if (appearances.length < 3) {
        scores[num] = 0;
        continue;
      }
      
      // 计算平均间隔
      let totalInterval = 0;
      for (let i = 1; i < appearances.length; i++) {
        totalInterval += appearances[i] - appearances[i-1];
      }
      const avgInterval = totalInterval / (appearances.length - 1);
      
      // 检查是否到了该出现的时间
      const lastAppearance = appearances[appearances.length - 1];
      const expectedAppearance = lastAppearance + avgInterval;
      
      if (Math.abs(currentWeek - expectedAppearance) <= 1) {
        scores[num] = 20; // 周期到了
      } else if (currentWeek > expectedAppearance) {
        scores[num] = 15; // 稍微过了周期
      } else {
        scores[num] = 0; // 还没到周期
      }
    }
    
    return scores;
  }

  /**
   * 趋势分析 - 号码走势趋势
   */
  private static calculateTrendScores(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const trendMap: Record<number, {count: number, lastPositions: number[]}> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      trendMap[i] = { count: 0, lastPositions: [] };
    }
    
    // 统计近期趋势
    const recentHistory = history.slice(0, 20);
    recentHistory.forEach((rec, drawIndex) => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, position) => {
        const pos = position + 1;
        trendMap[num].count++;
        trendMap[num].lastPositions.push(drawIndex * 10 + pos);
      });
    });
    
    // 分析趋势
    for (let num = 1; num <= 49; num++) {
      const data = trendMap[num];
      if (data.lastPositions.length < 2) {
        scores[num] = 0;
        continue;
      }
      
      // 计算位置变化趋势
      let totalDiff = 0;
      for (let i = 1; i < data.lastPositions.length; i++) {
        totalDiff += data.lastPositions[i] - data.lastPositions[i-1];
      }
      const avgDiff = totalDiff / (data.lastPositions.length - 1);
      
      // 上升趋势还是下降趋势
      if (avgDiff > 0) {
        scores[num] = 15; // 上升趋势
      } else if (avgDiff < 0) {
        scores[num] = 10; // 下降趋势
      } else {
        scores[num] = 5; // 稳定趋势
      }
      
      // 近期出现频率
      if (data.count >= 3) {
        scores[num] += 5;
      }
    }
    
    return scores;
  }

  /**
   * 历史镜像分析
   */
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

  /**
   * 轨迹分析
   */
  private static analyzeTrajectory(history: DbRecord[], lastSpecial: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const specials: number[] = [];
    
    // 收集特码历史
    for (let i = 0; i < Math.min(15, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      if (nums.length > 0) {
        specials.push(nums[nums.length - 1]);
      }
    }
    
    // 分析趋势
    if (specials.length >= 3) {
      // 计算移动平均
      const movingAvg = specials.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      
      // 分析奇偶趋势
      const lastParity = lastSpecial % 2;
      const parityHistory = specials.map(s => s % 2);
      const sameParityCount = parityHistory.filter(p => p === lastParity).length;
      
      for (let num = 1; num <= 49; num++) {
        let score = 0;
        
        // 靠近移动平均
        if (Math.abs(num - movingAvg) <= 5) score += 10;
        
        // 延续奇偶性
        if ((num % 2) === lastParity && sameParityCount >= 2) score += 8;
        
        // 趋势方向
        const diff = specials[0] - specials[1];
        if (diff > 0 && num < lastSpecial) score += 12; // 下降趋势
        if (diff < 0 && num > lastSpecial) score += 12; // 上升趋势
        
        scores[num] = score;
      }
    }
    
    return scores;
  }

  /**
   * 形态分析
   */
  private static calculatePatternScores(lastDraw: number[], recentHistory: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 邻号分析
    const neighborSet = new Set<number>();
    lastDraw.forEach(n => {
      if (n > 1) neighborSet.add(n - 1);
      if (n < 49) neighborSet.add(n + 1);
    });
    
    // 重号分析
    const repeatSet = new Set(lastDraw);
    
    // 连号分析
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
      if (repeatSet.has(num)) score += 12;
      if (consecutiveSet.has(num)) score += 18;
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 尾数分析
   */
  private static calculateTailScores(recentHistory: DbRecord[]): Record<number, number> {
    const tailCount: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 统计尾数出现次数
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const tail = num % 10;
        tailCount[tail] = (tailCount[tail] || 0) + 1;
      });
    });
    
    // 计算尾数分数
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

  /**
   * 生肖分析
   */
  private static calculateZodiacScores(recentHistory: DbRecord[], lastSpecialZodiac: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const zodiacCount: Record<string, number> = {};
    
    // 统计生肖出现次数
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const zodiac = this.NUM_TO_ZODIAC[num];
        zodiacCount[zodiac] = (zodiacCount[zodiac] || 0) + 1;
      });
    });
    
    // 热门生肖
    const hotZodiacs = Object.entries(zodiacCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([zodiac]) => zodiac);
    
    // 三合生肖
    const allies = this.SAN_HE_MAP[lastSpecialZodiac] || [];
    
    // 计算分数
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      
      if (hotZodiacs.includes(zodiac)) score += 15;
      if (allies.includes(zodiac)) score += 20;
      if (zodiac === lastSpecialZodiac) score += 10;
      
      scores[zodiac] = score;
    });
    
    return scores;
  }

  /**
   * 五行分析
   */
  private static calculateWuxingScores(recentHistory: DbRecord[]): Record<string, number> {
    const wuxingCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    // 统计五行出现次数
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const wuxing = this.NUM_TO_WUXING[num];
        wuxingCount[wuxing] = (wuxingCount[wuxing] || 0) + 1;
      });
    });
    
    // 找到最弱的五行
    const sortedWuxing = Object.entries(wuxingCount)
      .sort((a, b) => a[1] - b[1]);
    
    const weakWuxing = sortedWuxing[0]?.[0] || '土';
    const strongWuxing = sortedWuxing[sortedWuxing.length - 1]?.[0] || '金';
    
    // 计算分数：补弱抑强
    Object.keys(this.WU_XING_MAP).forEach(wuxing => {
      if (wuxing === weakWuxing) {
        scores[wuxing] = 25; // 补弱
      } else if (wuxing === strongWuxing) {
        scores[wuxing] = 5;  // 抑制过强
      } else {
        scores[wuxing] = 15; // 平衡
      }
    });
    
    return scores;
  }

  /**
   * 波色分析
   */
  private static calculateWaveScores(recentHistory: DbRecord[], lastSpecial: number): Record<string, number> {
    const waveCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    // 统计波色出现次数
    recentHistory.forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(num => {
        const wave = this.getNumWave(num);
        waveCount[wave] = (waveCount[wave] || 0) + 1;
      });
    });
    
    // 上期特码波色
    const lastWave = this.getNumWave(lastSpecial);
    
    // 找到最弱的波色
    const sortedWaves = Object.entries(waveCount)
      .sort((a, b) => a[1] - b[1]);
    
    const weakWave = sortedWaves[0]?.[0] || 'green';
    
    // 计算分数
    ['red', 'blue', 'green'].forEach(wave => {
      let score = 0;
      
      if (wave === lastWave) score += 15; // 同波色惯性
      if (wave === weakWave) score += 20; // 补弱波色
      
      scores[wave] = score;
    });
    
    return scores;
  }

  /**
   * 黄金号码计算
   */
  private static calculateGoldNumbers(sum: number, special: number): number[] {
    const goldNumbers: number[] = [];
    
    // 黄金分割
    goldNumbers.push(Math.round(sum * 0.618) % 49 || 49);
    
    // 固定偏移
    goldNumbers.push((sum + 7) % 49 || 49);
    
    // 特码相关
    goldNumbers.push(Math.round(special * 1.618) % 49 || 49);
    goldNumbers.push((special + 13) % 49 || 49);
    goldNumbers.push((special * 2) % 49 || 49);
    
    // 去重
    return [...new Set(goldNumbers.filter(n => n >= 1 && n <= 49))];
  }

  /**
   * 遗漏分析
   */
  private static calculateOmissionScores(history: DbRecord[], period: number): Record<number, number> {
    const omissionMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 初始化遗漏值
    for (let i = 1; i <= 49; i++) {
      omissionMap[i] = period;
    }
    
    // 更新遗漏值
    for (let i = 0; i < Math.min(period, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      nums.forEach(num => {
        omissionMap[num] = i;
      });
    }
    
    // 转换为分数
    for (let num = 1; num <= 49; num++) {
      const omission = omissionMap[num];
      
      // 非线性评分：遗漏越大，分数越高
      if (omission >= period * 0.8) {
        scores[num] = 25; // 极大遗漏
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

  /**
   * 季节分析
   */
  private static calculateSeasonalScores(month: number, week: number): Record<string, number> {
    const scores: Record<string, number> = {};
    const season = this.getSeasonByMonth(month);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    
    // 季节生肖
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      if (seasonalZodiacs.includes(zodiac)) {
        scores[zodiac] = 20;
      } else {
        scores[zodiac] = 0;
      }
    });
    
    return scores;
  }

  /**
   * 质数分布分析
   */
  private static analyzePrimeDistribution(history: DbRecord[]) {
    let primeCount = 0;
    let totalNumbers = 0;
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      totalNumbers += nums.length;
      primeCount += nums.filter(n => this.PRIME_NUMBERS.includes(n)).length;
    });
    
    const primeRatio = primeCount / totalNumbers;
    const expectedRatio = this.PRIME_NUMBERS.length / 49; // 15/49 ≈ 0.306
    
    return {
      currentRatio: primeRatio,
      expectedRatio,
      needMorePrimes: primeRatio < expectedRatio * 0.9,
      needMoreComposites: primeRatio > expectedRatio * 1.1
    };
  }

  /**
   * 和值模式分析
   */
  private static analyzeSumPatterns(history: DbRecord[], lastSum: number) {
    const sums: number[] = [];
    const sumTails: number[] = [];
    
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      sums.push(sum);
      sumTails.push(sum % 10);
    });
    
    // 计算统计信息
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const stdSum = Math.sqrt(sums.reduce((sq, n) => sq + Math.pow(n - avgSum, 2), 0) / sums.length);
    
    // 分析奇偶趋势
    const lastParity = lastSum % 2;
    const parityCounts = sumTails.reduce((counts, tail) => {
      counts[tail % 2]++;
      return counts;
    }, [0, 0]);
    
    const parityTrend = parityCounts[lastParity] > parityCounts[1 - lastParity] ? 'same' : 'alternate';
    
    return {
      getScore: (simulatedSum: number) => {
        let score = 0;
        
        // 在和值范围内
        if (simulatedSum >= avgSum - stdSum && simulatedSum <= avgSum + stdSum) {
          score += 15;
        }
        
        // 奇偶趋势
        if ((parityTrend === 'same' && (simulatedSum % 2) === lastParity) ||
            (parityTrend === 'alternate' && (simulatedSum % 2) !== lastParity)) {
          score += 10;
        }
        
        return score;
      }
    };
  }

  /**
   * 位置分析
   */
  private static calculatePositionScores(history: DbRecord[]): Record<number, number> {
    const positionStats: Record<number, Record<number, number>> = {};
    const scores: Record<number, number> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      positionStats[i] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    }
    
    // 统计每个号码在不同位置的出现次数
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, index) => {
        const position = index + 1;
        if (positionStats[num]) {
          positionStats[num][position]++;
        }
      });
    });
    
    // 计算分数
    for (let num = 1; num <= 49; num++) {
      const positions = positionStats[num];
      const total = Object.values(positions).reduce((a, b) => a + b, 0);
      
      if (total > 0) {
        // 特码位置权重更高
        const specialScore = positions[7] * 3;
        const normalScore = (total - positions[7]) * 1;
        scores[num] = specialScore + normalScore;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  /**
   * 多样性选择算法
   */
  private static selectDiverseNumbers(stats: NumberStat[], count: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const zodiacLimit = 3;  // 每个生肖最多选3个
    const waveLimit = 6;    // 每个波色最多选6个
    const tailLimit = 3;    // 每个尾数最多选3个
    const wuxingLimit = 5;  // 每个五行最多选5个
    
    const zodiacCount: Record<string, number> = {};
    const waveCount: Record<string, number> = {};
    const tailCount: Record<number, number> = {};
    const wuxingCount: Record<string, number> = {};
    
    // 按总分排序
    const sortedStats = [...stats].sort((a, b) => b.totalScore - a.totalScore);
    
    // 第一阶段：高分数选择
    for (const stat of sortedStats) {
      if (selected.length >= count * 0.7) break;
      
      const currentZodiacCount = zodiacCount[stat.zodiac] || 0;
      const currentWaveCount = waveCount[stat.wave] || 0;
      const currentTailCount = tailCount[stat.tail] || 0;
      const currentWuxingCount = wuxingCount[stat.wuxing] || 0;
      
      if (currentZodiacCount < zodiacLimit &&
          currentWaveCount < waveLimit &&
          currentTailCount < tailLimit &&
          currentWuxingCount < wuxingLimit) {
        
        selected.push(stat);
        zodiacCount[stat.zodiac] = currentZodiacCount + 1;
        waveCount[stat.wave] = currentWaveCount + 1;
        tailCount[stat.tail] = currentTailCount + 1;
        wuxingCount[stat.wuxing] = currentWuxingCount + 1;
      }
    }
    
    // 第二阶段：补充选择
    if (selected.length < count) {
      const remaining = sortedStats.filter(s => !selected.includes(s));
      for (const stat of remaining) {
        if (selected.length >= count) break;
        selected.push(stat);
      }
    }
    
    return selected.slice(0, count);
  }

  /**
   * 根据月份获取季节
   */
  private static getSeasonByMonth(month: number): string {
    if (month >= 1 && month <= 4) return '春';
    if (month >= 5 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }

  // --- 基础辅助方法 ---

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
}
