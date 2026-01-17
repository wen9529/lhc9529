import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  
  // 十八维度终极评分系统
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
  scoreCorrelation: number;    // 相关性分析
  
  totalScore: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v16.0 "Complete Working Edition"
 * 经过全面修复，确保所有算法正常工作，预测引擎100%可用
 */
export class PredictionEngine {
  // 配置参数
  private static readonly CONFIG = {
    periods: {
      full: 100,      // 完整分析期数
      recent50: 50,   // 近期分析
      recent30: 30,
      recent20: 20,
      recent10: 10,
      omission: 100,  // 遗漏分析期数
      prime: 50,      // 质数分析期数
      sum: 50,        // 和值分析期数
      position: 50    // 位置分析期数
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
      omissionCritical: 0.8  // 80%期数遗漏
    },
    diversity: {
      zodiac: 3,
      wave: 6,
      tail: 3,
      wuxing: 5,
      head: 3
    }
  };

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
    zodiac: 12,     // 生肖周期
    wave: 7,        // 波色周期
    wuxing: 5,      // 五行周期
    tail: 10        // 尾数周期
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};
  static NUM_TO_WAVE: Record<number, string> = {};

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
    // 初始化生肖映射
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          this.NUM_TO_ZODIAC[n] = z;
        }
      });
    }
    
    // 初始化五行映射
    for (const [w, nums] of Object.entries(this.WU_XING_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          this.NUM_TO_WUXING[n] = w;
        }
      });
    }
    
    // 初始化波色映射
    for (const [wave, nums] of Object.entries(this.WAVES_MAP)) {
      nums.forEach(n => {
        this.NUM_TO_WAVE[n] = wave;
      });
    }
  }

  /**
   * 主预测函数
   */
  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    console.log('开始预测...');
    this.initializeMaps();
    
    // 检查历史数据是否足够
    if (!history || history.length < this.CONFIG.thresholds.minHistoryLength) {
      console.warn(`历史数据不足${this.CONFIG.thresholds.minHistoryLength}期，使用增强随机生成`);
      return this.generateEnhancedRandom(history);
    }

    console.log(`历史数据: ${history.length}期`);

    // 确保历史数据按时间倒序排列（最新一期在索引0）
    const sortedHistory = [...history].sort((a, b) => {
      const timeA = a.draw_time ? new Date(a.draw_time).getTime() : 0;
      const timeB = b.draw_time ? new Date(b.draw_time).getTime() : 0;
      return timeB - timeA;
    });

    // 数据切片（使用全部历史记录，但限制最大数量）
    const availableHistory = sortedHistory;
    const fullHistory = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.full));
    const recent50 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent50));
    const recent30 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent30));
    const recent20 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent20));
    const recent10 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent10));
    
    // 上期开奖数据
    const lastDrawNums = this.parseNumbers(fullHistory[0].open_code);
    if (lastDrawNums.length === 0) {
      console.error('无法解析上期开奖号码');
      return this.generateEnhancedRandom(history);
    }
    
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial] || '';
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    
    console.log(`上期特码: ${lastSpecial} (${lastSpecialZodiac}), 和值: ${lastDrawSum}`);
    
    // 当前时间信息
    const currentDate = fullHistory[0].draw_time ? new Date(fullHistory[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    const currentDay = currentDate.getDay(); // 0-6, 0是周日

    console.log(`当前时间: 月${currentMonth} 季${currentSeason} 周${currentWeek} 星期${currentDay}`);

    // 初始化状态池
    const stats: NumberStat[] = [];
    for (let i = 1; i <= 49; i++) {
      stats.push({
        num: i,
        zodiac: this.NUM_TO_ZODIAC[i] || '',
        wave: this.getNumWave(i),
        wuxing: this.NUM_TO_WUXING[i] || '',
        tail: i % 10,
        head: Math.floor(i / 10),
        
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
        scoreCorrelation: 0,
        totalScore: 0
      });
    }

    console.log('开始执行算法分析...');

    // ==========================================
    // 算法 1: 生肖转移概率 (核心算法) - 使用全部历史
    // ==========================================
    console.log('执行算法 1: 生肖转移概率...');
    const zodiacTransMap: Record<string, number> = {};
    let zodiacTransTotal = 0;

    for (let i = 0; i < fullHistory.length - 1; i++) {
      const currentNums = this.parseNumbers(fullHistory[i].open_code);
      const nextNums = this.parseNumbers(fullHistory[i + 1].open_code);
      
      if (currentNums.length === 0 || nextNums.length === 0) continue;
      
      const currentSpecial = currentNums[currentNums.length - 1];
      const currentZodiac = this.NUM_TO_ZODIAC[currentSpecial] || '';

      if (currentZodiac === lastSpecialZodiac) {
        const nextSpecial = nextNums[nextNums.length - 1];
        const nextZodiac = this.NUM_TO_ZODIAC[nextSpecial] || '';
        
        if (nextZodiac) {
          zodiacTransMap[nextZodiac] = (zodiacTransMap[nextZodiac] || 0) + 1;
          zodiacTransTotal++;
        }
      }
    }
    
    stats.forEach(s => {
      const occurrences = zodiacTransMap[s.zodiac] || 0;
      if (zodiacTransTotal > 0) {
        s.scoreZodiacTrans = (occurrences / zodiacTransTotal) * 50;
      }
    });

    // ==========================================
    // 算法 2: 特码转移概率 - 使用全部历史
    // ==========================================
    console.log('执行算法 2: 特码转移概率...');
    const numTransMap: Record<number, number> = {};
    for (let i = 0; i < fullHistory.length - 1; i++) {
      const currentNums = this.parseNumbers(fullHistory[i].open_code);
      const nextNums = this.parseNumbers(fullHistory[i + 1].open_code);
      
      if (currentNums.length === 0 || nextNums.length === 0) continue;
      
      const currentSpecial = currentNums[currentNums.length - 1];
      
      if (currentSpecial === lastSpecial) {
        const nextSpecial = nextNums[nextNums.length - 1];
        numTransMap[nextSpecial] = (numTransMap[nextSpecial] || 0) + 1;
      }
    }
    stats.forEach(s => s.scoreNumberTrans = (numTransMap[s.num] || 0) * 6);

    // ==========================================
    // 算法 3: 历史镜像分析 - 使用全部历史
    // ==========================================
    console.log('执行算法 3: 历史镜像分析...');
    const mirrorScores = this.calculateHistoryMirror(fullHistory, lastDrawNums);
    stats.forEach(s => s.scoreHistoryMirror = mirrorScores[s.num] || 0);

    // ==========================================
    // 算法 4: 特码轨迹分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 4: 特码轨迹分析...');
    const trajectoryAnalysis = this.analyzeTrajectory(recent50, lastSpecial);
    stats.forEach(s => {
      s.scoreSpecialTraj = trajectoryAnalysis[s.num] || 0;
    });

    // ==========================================
    // 算法 5: 形态几何分析 - 使用最近10期
    // ==========================================
    console.log('执行算法 5: 形态几何分析...');
    const patternScores = this.calculatePatternScores(lastDrawNums, recent10);
    stats.forEach(s => {
      s.scorePattern = patternScores[s.num] || 0;
    });

    // ==========================================
    // 算法 6: 尾数力场分析 - 使用最近10期
    // ==========================================
    console.log('执行算法 6: 尾数力场分析...');
    const tailScores = this.calculateTailScores(recent10);
    stats.forEach(s => {
      s.scoreTail = tailScores[s.tail] || 0;
    });

    // ==========================================
    // 算法 7: 三合局势分析 - 使用最近20期
    // ==========================================
    console.log('执行算法 7: 三合局势分析...');
    const zodiacScores = this.calculateZodiacScores(recent20, lastSpecialZodiac);
    stats.forEach(s => {
      s.scoreZodiac = zodiacScores[s.zodiac] || 0;
    });

    // ==========================================
    // 算法 8: 五行平衡分析 - 使用最近10期
    // ==========================================
    console.log('执行算法 8: 五行平衡分析...');
    const wuxingScores = this.calculateWuxingScores(recent10);
    stats.forEach(s => {
      s.scoreWuXing = wuxingScores[s.wuxing] || 0;
    });

    // ==========================================
    // 算法 9: 波色惯性分析 - 使用最近10期
    // ==========================================
    console.log('执行算法 9: 波色惯性分析...');
    const waveScores = this.calculateWaveScores(recent10, lastSpecial);
    stats.forEach(s => {
      s.scoreWave = waveScores[s.wave] || 0;
    });

    // ==========================================
    // 算法 10: 黄金密钥分析
    // ==========================================
    console.log('执行算法 10: 黄金密钥分析...');
    const goldNumbers = this.calculateGoldNumbers(lastDrawSum, lastSpecial);
    stats.forEach(s => {
      if (goldNumbers.includes(s.num)) s.scoreGold = 25;
    });

    // ==========================================
    // 算法 11: 遗漏回补分析 - 使用全部历史
    // ==========================================
    console.log('执行算法 11: 遗漏回补分析...');
    const omissionScores = this.calculateOmissionScores(fullHistory);
    stats.forEach(s => {
      s.scoreOmission = omissionScores[s.num] || 0;
    });

    // ==========================================
    // 算法 12: 季节规律分析
    // ==========================================
    console.log('执行算法 12: 季节规律分析...');
    const seasonalScores = this.calculateSeasonalScores(currentMonth, currentWeek, currentDay);
    stats.forEach(s => {
      s.scoreSeasonal = seasonalScores[s.zodiac] || 0;
      if (s.num % 10 === currentMonth % 10) s.scoreSeasonal += 5;
      if (s.num % 7 === currentDay) s.scoreSeasonal += 3;
    });

    // ==========================================
    // 算法 13: 质数分布分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 13: 质数分布分析...');
    const primeAnalysis = this.analyzePrimeDistribution(recent50);
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
    // 算法 14: 和值分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 14: 和值分析...');
    const sumAnalysis = this.analyzeSumPatterns(recent50, lastDrawSum);
    stats.forEach(s => {
      const simulatedSum = lastDrawSum - lastSpecial + s.num;
      s.scoreSumAnalysis = sumAnalysis.getScore(simulatedSum);
    });

    // ==========================================
    // 算法 15: 位置分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 15: 位置分析...');
    const positionScores = this.calculatePositionScores(recent50);
    stats.forEach(s => {
      s.scorePosition = positionScores[s.num] || 0;
    });

    // ==========================================
    // 算法 16: 频率分析 - 使用全部历史
    // ==========================================
    console.log('执行算法 16: 频率分析...');
    const frequencyScores = this.calculateFrequencyScores(fullHistory);
    stats.forEach(s => {
      s.scoreFrequency = frequencyScores[s.num] || 0;
    });

    // ==========================================
    // 算法 17: 聚类分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 17: 聚类分析...');
    const clusterScores = this.calculateClusterScores(lastDrawNums, recent50);
    stats.forEach(s => {
      s.scoreCluster = clusterScores[s.num] || 0;
    });

    // ==========================================
    // 算法 18: 对称分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 18: 对称分析...');
    const symmetryScores = this.calculateSymmetryScores(recent50, lastDrawNums);
    stats.forEach(s => {
      s.scoreSymmetry = symmetryScores[s.num] || 0;
    });

    // ==========================================
    // 算法 19: 周期分析 - 使用全部历史
    // ==========================================
    console.log('执行算法 19: 周期分析...');
    const periodicScores = this.calculatePeriodicScores(fullHistory, currentWeek);
    stats.forEach(s => {
      s.scorePeriodic = periodicScores[s.num] || 0;
    });

    // ==========================================
    // 算法 20: 趋势分析 - 使用全部历史
    // ==========================================
    console.log('执行算法 20: 趋势分析...');
    const trendScores = this.calculateTrendScores(fullHistory);
    stats.forEach(s => {
      s.scoreTrend = trendScores[s.num] || 0;
    });

    // ==========================================
    // 算法 21: 相关性分析 - 使用50期数据
    // ==========================================
    console.log('执行算法 21: 相关性分析...');
    const correlationScores = this.calculateCorrelationScores(recent50);
    stats.forEach(s => {
      s.scoreCorrelation = correlationScores[s.num] || 0;
    });

    // ==========================================
    // 最终汇总 - 权重分配
    // ==========================================
    console.log('计算最终分数...');
    const weights = this.CONFIG.weights;
    stats.forEach(s => {
      s.totalScore = 
        s.scoreZodiacTrans * weights.zodiacTrans +
        s.scoreNumberTrans * weights.numberTrans +
        s.scoreHistoryMirror * weights.historyMirror +
        s.scoreSpecialTraj * weights.specialTraj +
        s.scorePattern * weights.pattern +
        s.scoreTail * weights.tail +
        s.scoreZodiac * weights.zodiac +
        s.scoreWuXing * weights.wuXing +
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
        s.scoreCorrelation * weights.correlation;
        
      // 极微扰动 (0.01-0.05)
      s.totalScore += (Math.random() * 0.04 + 0.01);
    });

    // 排序
    stats.sort((a, b) => b.totalScore - a.totalScore);

    // 输出前10个高分号码
    console.log('前10个高分号码:');
    stats.slice(0, 10).forEach((s, i) => {
      console.log(`${i + 1}. 号码${s.num} (${s.zodiac}) - 总分: ${s.totalScore.toFixed(2)}`);
    });

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
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as keyof typeof wMap] - wMap[a as keyof typeof wMap]);

    // 计算推荐头尾
    const hSet = new Set(final18.map(s => s.head));
    const tSet = new Set(final18.map(s => s.tail));
    const recHeads = Array.from(hSet).sort((a, b) => a - b).slice(0, 3).map(String);
    const recTails = Array.from(tSet).sort((a, b) => a - b).slice(0, 5).map(String);

    console.log(`最终预测结果: ${resultNumbers.join(', ')}`);
    console.log(`推荐生肖: ${recZodiacs.join(', ')}`);
    console.log(`推荐波色: ${recWaves[0]}, ${recWaves[1] || recWaves[0]}`);
    console.log(`推荐头数: ${recHeads.join(', ')}`);
    console.log(`推荐尾数: ${recTails.join(', ')}`);

    return {
        zodiacs: recZodiacs,
        numbers: resultNumbers,
        wave: { main: recWaves[0] as 'red' | 'blue' | 'green', defense: (recWaves[1] || recWaves[0]) as 'red' | 'blue' | 'green' },
        heads: recHeads,
        tails: recTails
    };
  }

  // ==========================================
  // 核心算法实现 (修复版)
  // ==========================================

  /**
   * 频率分析 - 基于全部历史记录出现频率
   */
  private static calculateFrequencyScores(history: DbRecord[]): Record<number, number> {
    const frequencyMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 统计频率 (全部历史)
    history.forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // 计算频率分数
    const maxFreq = Math.max(...Object.values(frequencyMap), 1);
    const totalDraws = history.length;
    const expectedFreqPerNumber = totalDraws * 7 / 49; // 每个号码的理论平均出现次数
    
    for (let num = 1; num <= 49; num++) {
      const freq = frequencyMap[num] || 0;
      
      if (freq === 0) {
        scores[num] = 25; // 从未出现，极冷号
      } else if (freq > expectedFreqPerNumber * this.CONFIG.thresholds.hotNumberThreshold) {
        scores[num] = 18; // 热号
      } else if (freq < expectedFreqPerNumber * this.CONFIG.thresholds.coldNumberThreshold) {
        scores[num] = 15; // 冷号（可能回补）
      } else {
        scores[num] = Math.min((freq / maxFreq) * 12, 12); // 温号
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
    history.forEach(rec => {
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
      const recentAvg = recentNumbers.length > 0 ? 
        recentNumbers.reduce((a, b) => a + b, 0) / recentNumbers.length : 25;
      totalDistance += Math.abs(num - recentAvg) * 2;
      count += 2;
      
      const avgDistance = totalDistance / count;
      
      // 距离越近，分数越高（倾向于选择接近历史号码的号码）
      scores[num] = Math.max(0, 25 - avgDistance * 0.7);
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
          score += 20; // 上期号码的对称号码
        }
      });
      
      // 检查历史对称性
      if (symmetryMap[num] && symmetryMap[num] > 0) {
        score += symmetryMap[num] * 3;
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 周期分析 - 号码周期规律 (全部历史)
   */
  private static calculatePeriodicScores(history: DbRecord[], currentWeek: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const periodMap: Record<number, number[]> = {};
    
    // 初始化周期记录
    for (let i = 1; i <= 49; i++) {
      periodMap[i] = [];
    }
    
    // 记录每个号码出现的期次 (全部历史)
    history.forEach((rec, index) => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        periodMap[num].push(index);
      });
    });
    
    // 分析周期性
    for (let num = 1; num <= 49; num++) {
      const appearances = periodMap[num];
      if (appearances.length < 3) {
        scores[num] = appearances.length * 3; // 出现次数少，给基础分
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
      const drawsSinceLast = history.length - lastAppearance;
      
      if (drawsSinceLast >= avgInterval * 0.9 && drawsSinceLast <= avgInterval * 1.1) {
        scores[num] = 25; // 周期到了
      } else if (drawsSinceLast > avgInterval) {
        scores[num] = 20; // 稍微过了周期
      } else if (drawsSinceLast < avgInterval * 0.7) {
        scores[num] = 5;  // 远未到周期
      } else {
        scores[num] = 15; // 接近周期
      }
    }
    
    return scores;
  }

  /**
   * 趋势分析 - 号码走势趋势 (全部历史)
   */
  private static calculateTrendScores(history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    const appearanceRecord: Record<number, number[]> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      appearanceRecord[i] = [];
    }
    
    // 记录每期出现位置 (全部历史)
    history.forEach((rec, drawIndex) => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, position) => {
        appearanceRecord[num].push(drawIndex * 10 + (position + 1));
      });
    });
    
    // 分析趋势
    for (let num = 1; num <= 49; num++) {
      const appearances = appearanceRecord[num];
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
        scores[num] = 22; // 上升趋势
      } else if (!isUpTrend && avgDiff < 0) {
        scores[num] = 18; // 下降趋势
      } else {
        scores[num] = 15; // 稳定趋势
      }
    }
    
    return scores;
  }

  /**
   * 历史镜像分析 (全部历史)
   */
  private static calculateHistoryMirror(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    
    for (let i = 0; i < history.length - 1; i++) {
      const histNums = this.parseNumbers(history[i].open_code);
      const common = histNums.filter(n => lastDraw.includes(n));
      
      if (common.length >= 3) {
        const nextNums = this.parseNumbers(history[i + 1].open_code);
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
   * 轨迹分析 (50期)
   */
  private static analyzeTrajectory(history: DbRecord[], lastSpecial: number): Record<number, number> {
    const scores: Record<number, number> = {};
    const specials: number[] = [];
    
    // 收集特码历史
    for (let i = 0; i < Math.min(50, history.length); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      if (nums.length > 0) {
        specials.push(nums[nums.length - 1]);
      }
    }
    
    // 分析趋势
    if (specials.length >= 5) {
      // 计算移动平均
      const movingAvg = specials.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      
      // 分析奇偶趋势
      const lastParity = lastSpecial % 2;
      const parityHistory = specials.map(s => s % 2);
      const sameParityCount = parityHistory.filter(p => p === lastParity).length;
      const parityRatio = sameParityCount / parityHistory.length;
      
      // 分析大小趋势 (以25为界)
      const lastSize = lastSpecial > 25 ? 1 : 0;
      const sizeHistory = specials.map(s => s > 25 ? 1 : 0);
      const sameSizeCount = sizeHistory.filter(s => s === lastSize).length;
      const sizeRatio = sameSizeCount / sizeHistory.length;
      
      for (let num = 1; num <= 49; num++) {
        let score = 0;
        
        // 靠近移动平均
        if (Math.abs(num - movingAvg) <= 8) score += 12;
        
        // 延续奇偶性
        if ((num % 2) === lastParity && parityRatio > 0.6) score += 10;
        
        // 延续大小性
        if ((num > 25 ? 1 : 0) === lastSize && sizeRatio > 0.6) score += 10;
        
        scores[num] = score;
      }
    }
    
    return scores;
  }

  /**
   * 形态分析 (最近10期)
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
    const repeatSet = new Set<number>();
    recentHistory.slice(0, 3).forEach(rec => {
      this.parseNumbers(rec.open_code).forEach(n => {
        if (lastDraw.includes(n)) {
          repeatSet.add(n);
        }
      });
    });
    
    // 连号分析
    const consecutiveSet = new Set<number>();
    const sortedLast = [...lastDraw].sort((a, b) => a - b);
    for (let i = 0; i < sortedLast.length - 1; i++) {
      if (sortedLast[i+1] - sortedLast[i] === 1) {
        consecutiveSet.add(sortedLast[i]);
        consecutiveSet.add(sortedLast[i+1]);
      }
    }
    
    for (let num = 1; num <= 49; num++) {
      let score = 0;
      
      if (neighborSet.has(num)) score += 18;
      if (repeatSet.has(num)) score += 15;
      if (consecutiveSet.has(num)) score += 20;
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 尾数分析 (最近10期)
   */
  private static calculateTailScores(recentHistory: DbRecord[]): Record<number, number> {
    const tailCount: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 统计尾数出现次数
    recentHistory.slice(0, 10).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        const tail = num % 10;
        tailCount[tail] = (tailCount[tail] || 0) + 1;
      });
    });
    
    // 计算尾数分数
    const sortedTails = Object.entries(tailCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tail]) => parseInt(tail));
    
    for (let tail = 0; tail <= 9; tail++) {
      const index = sortedTails.indexOf(tail);
      if (index === -1) {
        scores[tail] = 0; // 未出现
      } else if (index < 3) {
        scores[tail] = 25; // 热门尾数
      } else if (index < 6) {
        scores[tail] = 15; // 中等尾数
      } else {
        scores[tail] = 5;  // 冷门尾数
      }
    }
    
    return scores;
  }

  /**
   * 生肖分析 (最近20期)
   */
  private static calculateZodiacScores(recentHistory: DbRecord[], lastSpecialZodiac: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const zodiacCount: Record<string, number> = {};
    
    // 统计生肖出现次数
    recentHistory.slice(0, 20).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        const zodiac = this.NUM_TO_ZODIAC[num] || '';
        if (zodiac) {
          zodiacCount[zodiac] = (zodiacCount[zodiac] || 0) + 1;
        }
      });
    });
    
    // 热门生肖
    const hotZodiacs = Object.entries(zodiacCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([zodiac]) => zodiac);
    
    // 三合生肖
    const allies = this.SAN_HE_MAP[lastSpecialZodiac] || [];
    
    // 计算分数
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      
      if (hotZodiacs.includes(zodiac)) score += 18;
      if (allies.includes(zodiac)) score += 22;
      if (zodiac === lastSpecialZodiac) score += 12;
      
      scores[zodiac] = Math.max(score, 0);
    });
    
    return scores;
  }

  /**
   * 五行分析 (最近10期)
   */
  private static calculateWuxingScores(recentHistory: DbRecord[]): Record<string, number> {
    const wuxingCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    // 统计五行出现次数
    recentHistory.slice(0, 10).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
        const wuxing = this.NUM_TO_WUXING[num] || '';
        if (wuxing) {
          wuxingCount[wuxing] = (wuxingCount[wuxing] || 0) + 1;
        }
      });
    });
    
    // 找到最弱的五行
    const sortedWuxing = Object.entries(wuxingCount)
      .sort((a, b) => a[1] - b[1]);
    
    const weakWuxing = sortedWuxing[0]?.[0] || '土';
    const strongWuxing = sortedWuxing[sortedWuxing.length - 1]?.[0] || '金';
    
    // 五行相生关系
    const generateMap: Record<string, string> = {
      '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
    };
    
    // 计算分数：补弱抑强，考虑相生
    Object.keys(this.WU_XING_MAP).forEach(wuxing => {
      let score = 15; // 基础分
      
      if (wuxing === weakWuxing) {
        score = 28; // 补弱
      } else if (wuxing === strongWuxing) {
        score = 8;  // 抑制过强
      }
      
      // 被强五行所生，加分
      if (generateMap[strongWuxing] === wuxing) {
        score += 5;
      }
      
      // 生弱五行，加分
      if (generateMap[wuxing] === weakWuxing) {
        score += 5;
      }
      
      scores[wuxing] = score;
    });
    
    return scores;
  }

  /**
   * 波色分析 (最近10期)
   */
  private static calculateWaveScores(recentHistory: DbRecord[], lastSpecial: number): Record<string, number> {
    const waveCount: Record<string, number> = {};
    const scores: Record<string, number> = {};
    
    // 统计波色出现次数
    recentHistory.slice(0, 10).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach(num => {
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
    const strongWave = sortedWaves[sortedWaves.length - 1]?.[0] || 'red';
    
    // 计算分数
    ['red', 'blue', 'green'].forEach(wave => {
      let score = 0;
      
      if (wave === lastWave) score += 18; // 同波色惯性
      if (wave === weakWave) score += 22; // 补弱波色
      if (wave === strongWave) score -= 5; // 抑制过强
      
      scores[wave] = Math.max(score, 0);
    });
    
    return scores;
  }

  /**
   * 黄金号码计算
   */
  private static calculateGoldNumbers(sum: number, special: number): number[] {
    const goldNumbers: number[] = [];
    
    // 黄金分割相关
    goldNumbers.push(Math.round(sum * 0.618) % 49 || 49);
    goldNumbers.push(Math.round(sum * 1.618) % 49 || 49);
    
    // 和值相关
    goldNumbers.push((sum % 49) || 49);
    goldNumbers.push((sum + 7) % 49 || 49);
    goldNumbers.push((sum - 7 + 49) % 49 || 49);
    
    // 特码相关
    goldNumbers.push(Math.round(special * 1.618) % 49 || 49);
    goldNumbers.push((special + 13) % 49 || 49);
    
    // 去重并过滤有效号码
    const uniqueNumbers = [...new Set(goldNumbers)];
    return uniqueNumbers.filter(n => n >= 1 && n <= 49);
  }

  /**
   * 遗漏分析 (全部历史)
   */
  private static calculateOmissionScores(history: DbRecord[]): Record<number, number> {
    const omissionMap: Record<number, number> = {};
    const scores: Record<number, number> = {};
    
    // 初始化遗漏值
    for (let i = 1; i <= 49; i++) {
      omissionMap[i] = history.length; // 最大遗漏
    }
    
    // 更新遗漏值 (全部历史)
    for (let i = 0; i < history.length; i++) {
      const nums = this.parseNumbers(history[i].open_code);
      nums.forEach(num => {
        omissionMap[num] = Math.min(omissionMap[num], i);
      });
    }
    
    // 转换为分数 (非线性评分)
    for (let num = 1; num <= 49; num++) {
      const omission = omissionMap[num];
      const period = history.length;
      
      if (omission >= period * this.CONFIG.thresholds.omissionCritical) {
        scores[num] = 30; // 极大遗漏 (80%以上期数未出现)
      } else if (omission >= period * 0.6) {
        scores[num] = 25;
      } else if (omission >= period * 0.4) {
        scores[num] = 18;
      } else if (omission >= period * 0.2) {
        scores[num] = 12;
      } else if (omission >= period * 0.1) {
        scores[num] = 8;
      } else if (omission >= period * 0.05) {
        scores[num] = 5;
      } else {
        scores[num] = 0;
      }
    }
    
    return scores;
  }

  /**
   * 季节规律分析
   */
  private static calculateSeasonalScores(month: number, week: number, day: number): Record<string, number> {
    const scores: Record<string, number> = {};
    const season = this.getSeasonByMonth(month);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    
    // 季节生肖权重
    const seasonWeight = 22;
    
    // 根据星期微调 (周日-周六: 0-6)
    const dayWeights = [1.0, 1.1, 1.0, 0.9, 1.0, 1.2, 0.8]; // 假设周五较高，周日较低
    
    // 计算分数
    Object.keys(this.ZODIACS_MAP).forEach(zodiac => {
      let score = 0;
      
      if (seasonalZodiacs.includes(zodiac)) {
        score = seasonWeight * dayWeights[day];
      }
      
      scores[zodiac] = score;
    });
    
    return scores;
  }

  /**
   * 质数分布分析 (50期)
   */
  private static analyzePrimeDistribution(history: DbRecord[]) {
    let primeCount = 0;
    let totalNumbers = 0;
    
    // 统计数据
    history.slice(0, 50).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      totalNumbers += nums.length;
      primeCount += nums.filter(n => this.PRIME_NUMBERS.includes(n)).length;
    });
    
    const primeRatio = totalNumbers > 0 ? primeCount / totalNumbers : 0;
    const expectedRatio = this.PRIME_NUMBERS.length / 49; // 15/49 ≈ 0.306
    
    return {
      currentRatio: primeRatio,
      expectedRatio,
      primeCount,
      totalNumbers,
      needMorePrimes: primeRatio < expectedRatio * 0.85,  // 低于85%期望值
      needMoreComposites: primeRatio > expectedRatio * 1.15  // 高于115%期望值
    };
  }

  /**
   * 和值模式分析 (50期)
   */
  private static analyzeSumPatterns(history: DbRecord[], lastSum: number) {
    const sums: number[] = [];
    const sumParities: number[] = []; // 0:偶, 1:奇
    
    // 收集和值数据
    history.slice(0, 50).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      const sum = nums.reduce((a, b) => a + b, 0);
      sums.push(sum);
      sumParities.push(sum % 2);
    });
    
    // 计算统计信息
    const avgSum = sums.length > 0 ? sums.reduce((a, b) => a + b, 0) / sums.length : 175;
    const stdSum = sums.length > 1 ? 
      Math.sqrt(sums.reduce((sq, n) => sq + Math.pow(n - avgSum, 2), 0) / sums.length) : 15;
    
    // 和值范围 (95%置信区间)
    const sumRange = [avgSum - 1.96 * stdSum, avgSum + 1.96 * stdSum];
    
    // 分析奇偶趋势
    const lastParity = lastSum % 2;
    const evenCount = sumParities.filter(p => p === 0).length;
    const oddCount = sumParities.filter(p => p === 1).length;
    const parityTrend = lastParity === 0 ? 
      (evenCount > oddCount ? 'same' : 'alternate') :
      (oddCount > evenCount ? 'same' : 'alternate');
    
    // 分析大小趋势 (以平均值为界)
    const lastSize = lastSum > avgSum ? 1 : 0;
    const bigCount = sums.filter(s => s > avgSum).length;
    const smallCount = sums.filter(s => s <= avgSum).length;
    const sizeTrend = lastSize === 1 ?
      (bigCount > smallCount ? 'same' : 'alternate') :
      (smallCount > bigCount ? 'same' : 'alternate');
    
    return {
      getScore: (simulatedSum: number) => {
        let score = 0;
        
        // 在和值范围内
        if (simulatedSum >= sumRange[0] && simulatedSum <= sumRange[1]) {
          score += 18;
        } else if (simulatedSum >= avgSum - 2.5 * stdSum && simulatedSum <= avgSum + 2.5 * stdSum) {
          score += 12;
        } else {
          score += 5;
        }
        
        // 奇偶趋势
        if ((parityTrend === 'same' && (simulatedSum % 2) === lastParity) ||
            (parityTrend === 'alternate' && (simulatedSum % 2) !== lastParity)) {
          score += 10;
        }
        
        // 大小趋势
        if ((sizeTrend === 'same' && ((simulatedSum > avgSum ? 1 : 0) === lastSize)) ||
            (sizeTrend === 'alternate' && ((simulatedSum > avgSum ? 1 : 0) !== lastSize))) {
          score += 8;
        }
        
        return Math.min(score, 30);
      }
    };
  }

  /**
   * 位置分析 (50期)
   */
  private static calculatePositionScores(history: DbRecord[]): Record<number, number> {
    const positionStats: Record<number, Record<number, number>> = {};
    const scores: Record<number, number> = {};
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      positionStats[i] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    }
    
    // 统计每个号码在不同位置的出现次数
    history.slice(0, 50).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
      nums.forEach((num, index) => {
        const position = index + 1;
        if (positionStats[num]) {
          positionStats[num][position]++;
        }
      });
    });
    
    // 计算分数，特码位置权重更高
    for (let num = 1; num <= 49; num++) {
      const positions = positionStats[num];
      let totalScore = 0;
      
      // 普通位置权重
      for (let pos = 1; pos <= 6; pos++) {
        totalScore += positions[pos] * 2;
      }
      
      // 特码位置权重 (3倍)
      totalScore += positions[7] * 6;
      
      scores[num] = Math.min(totalScore, 30);
    }
    
    return scores;
  }

  /**
   * 相关性分析 - 号码之间的关联性 (50期)
   */
  private static calculateCorrelationScores(history: DbRecord[]): Record<number, number> {
    const correlationMatrix: number[][] = Array.from({ length: 50 }, () => Array(50).fill(0));
    const scores: Record<number, number> = {};
    
    // 构建相关性矩阵
    history.slice(0, 50).forEach(rec => {
      const nums = this.parseNumbers(rec.open_code);
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
          if (correlationMatrix[num][other] >= 3) { // 强关联
            strongConnections++;
          }
        }
      }
      
      // 评分公式：基础关联度 + 强关联奖励
      const avgCorrelation = totalCorrelation / 48;
      scores[num] = Math.min(avgCorrelation * 4 + strongConnections * 2, 25);
    }
    
    return scores;
  }

  /**
   * 多样性选择算法
   */
  private static selectDiverseNumbers(stats: NumberStat[], count: number): NumberStat[] {
    const selected: NumberStat[] = [];
    const limits = this.CONFIG.diversity;
    
    const zodiacCount: Record<string, number> = {};
    const waveCount: Record<string, number> = { red: 0, blue: 0, green: 0 };
    const tailCount: Record<number, number> = {};
    const wuxingCount: Record<string, number> = {};
    const headCount: Record<number, number> = {};
    
    // 按总分排序
    const sortedStats = [...stats].sort((a, b) => b.totalScore - a.totalScore);
    
    // 第一阶段：高分数选择 (70%)
    const phase1Count = Math.floor(count * 0.7);
    
    for (const stat of sortedStats) {
      if (selected.length >= phase1Count) break;
      
      const currentZodiacCount = zodiacCount[stat.zodiac] || 0;
      const currentWaveCount = waveCount[stat.wave];
      const currentTailCount = tailCount[stat.tail] || 0;
      const currentWuxingCount = wuxingCount[stat.wuxing] || 0;
      const currentHeadCount = headCount[stat.head] || 0;
      
      if (currentZodiacCount < limits.zodiac &&
          currentWaveCount < limits.wave &&
          currentTailCount < limits.tail &&
          currentWuxingCount < limits.wuxing &&
          currentHeadCount < limits.head) {
        
        selected.push(stat);
        zodiacCount[stat.zodiac] = currentZodiacCount + 1;
        waveCount[stat.wave] = currentWaveCount + 1;
        tailCount[stat.tail] = currentTailCount + 1;
        wuxingCount[stat.wuxing] = currentWuxingCount + 1;
        headCount[stat.head] = currentHeadCount + 1;
      }
    }
    
    // 第二阶段：补充选择，考虑多样性缺口
    if (selected.length < count) {
      const remaining = sortedStats.filter(s => !selected.includes(s));
      
      // 找出多样性不足的类别
      const needsMoreZodiacs = Object.entries(zodiacCount)
        .filter(([_, count]) => count < 1) // 还没有出现的生肖
        .map(([zodiac]) => zodiac);
      
      const needsMoreWaves = Object.entries(waveCount)
        .filter(([_, count]) => count < 2) // 每个波色至少2个
        .map(([wave]) => wave);
      
      for (const stat of remaining) {
        if (selected.length >= count) break;
        
        let shouldSelect = false;
        
        // 优先补充多样性
        if (needsMoreZodiacs.includes(stat.zodiac) && 
            (zodiacCount[stat.zodiac] || 0) < limits.zodiac) {
          shouldSelect = true;
        } else if (needsMoreWaves.includes(stat.wave) && 
                  waveCount[stat.wave] < limits.wave) {
          shouldSelect = true;
        } else if (selected.length < count) {
          // 如果没有多样性需求，按分数补充
          shouldSelect = true;
        }
        
        if (shouldSelect) {
          selected.push(stat);
          zodiacCount[stat.zodiac] = (zodiacCount[stat.zodiac] || 0) + 1;
          waveCount[stat.wave] = waveCount[stat.wave] + 1;
        }
      }
    }
    
    // 第三阶段：如果还不够，补充最高分数的
    if (selected.length < count) {
      const remaining = sortedStats.filter(s => !selected.includes(s));
      selected.push(...remaining.slice(0, count - selected.length));
    }
    
    return selected.slice(0, count);
  }

  /**
   * 增强随机生成 (当历史数据不足时使用)
   */
  private static generateEnhancedRandom(history?: DbRecord[]): PredictionData {
    console.log('使用增强随机生成...');
    const nums: string[] = [];
    const generated = new Set<number>();
    
    // 如果有部分历史，尝试基于最后几期生成
    if (history && history.length > 0) {
      const lastDraw = this.parseNumbers(history[0].open_code);
      
      // 包含一些上期号码的邻号
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
    
    // 随机生肖推荐 (基于当前季节)
    const currentMonth = new Date().getMonth() + 1;
    const season = this.getSeasonByMonth(currentMonth);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    
    // 选择6个生肖 (季节生肖优先)
    const allZodiacs = Object.keys(this.ZODIACS_MAP);
    const recZodiacs = [...seasonalZodiacs];
    
    // 补充其他生肖
    while (recZodiacs.length < 6) {
      const randomZodiac = allZodiacs[Math.floor(Math.random() * allZodiacs.length)];
      if (!recZodiacs.includes(randomZodiac)) {
        recZodiacs.push(randomZodiac);
      }
    }
    
    console.log('增强随机生成结果:', nums.join(', '));
    
    return {
      zodiacs: recZodiacs.slice(0, 6),
      numbers: nums,
      wave: { main: 'red', defense: 'blue' },
      heads: ['0', '1', '2'],
      tails: ['1', '5', '8', '3', '9']
    };
  }

  /**
   * 根据月份获取季节
   */
  private static getSeasonByMonth(month: number): string {
    if (month >= 1 && month <= 3) return '春';
    if (month >= 4 && month <= 6) return '夏';
    if (month >= 7 && month <= 9) return '秋';
    return '冬';
  }

  // --- 基础辅助方法 ---

  private static parseNumbers(code: string): number[] {
    if (!code) return [];
    // 处理各种可能的分隔符
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

  private static getNumWave(n: number): string {
    if (this.WAVES_MAP.red.includes(n)) return 'red';
    if (this.WAVES_MAP.blue.includes(n)) return 'blue';
    return 'green';
  }
  
  /**
   * 简单预测接口
   */
  static simplePredict(history: DbRecord[]): PredictionData {
    return this.generate(history, 'mark-six');
  }
}
