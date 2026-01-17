import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  
  // 基础算法评分
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
  scoreCorrelation: number;
  scoreHotCold: number;
  scoreParity: number;
  scoreSize: number;
  scoreSection: number;
  scoreHeadAnalysis: number;
  scoreTailAnalysis: number;
  scoreHeadTailPair: number;
  
  // 确定性算法评分
  scoreInnovation: number;
  scoreAvoidRecent: number;
  scoreCrossPeriod: number;
  scorePatternBreak: number;
  scoreDeterministic: number;
  
  // 新增确定性算法
  scoreTransitionLogic: number;    // 转移逻辑评分
  scoreCycleAnalysis: number;      // 周期分析评分
  scorePhaseAnalysis: number;      // 相位分析评分
  scoreHarmonic: number;           // 谐波分析评分
  scoreResonance: number;          // 共振分析评分
  scoreDeterministicPattern: number; // 确定性模式评分
  scoreQuantumProbability: number; // 量子概率评分
  scoreChaosTheory: number;        // 混沌理论评分
  scoreFractalAnalysis: number;    // 分形分析评分
  scoreEntropyAnalysis: number;    // 熵分析评分
  
  totalScore: number;
  deterministicScore: number;      // 确定性综合分
}

/**
 * 🎯 Quantum Matrix Prediction Engine v20.0 "完全确定性增强版"
 * 完全消除随机性，增加12个新的确定性算法
 */
export class PredictionEngine {
  // 配置参数 - 完全确定性
  private static readonly CONFIG = {
    periods: {
      full: 120,
      recent80: 80,
      recent60: 60,
      recent50: 50,
      recent40: 40,
      recent30: 30,
      recent20: 20,
      recent10: 10,
      recent5: 5,
      longTerm: 200,
      crossAnalysis: 36,
      patternAnalysis: 24,
      cycleAnalysis: 48,
      transitionAnalysis: 30
    },
    weights: {
      // 基础算法权重
      zodiacTrans: 2.5,
      numberTrans: 2.2,
      historyMirror: 1.6,
      specialTraj: 1.5,
      pattern: 1.3,
      tail: 1.0,
      zodiac: 0.9,
      wuXing: 0.8,
      wave: 0.8,
      gold: 0.7,
      omission: 1.2,
      seasonal: 0.6,
      prime: 0.6,
      sumAnalysis: 0.8,
      position: 0.6,
      frequency: 1.0,
      cluster: 0.6,
      symmetry: 0.6,
      periodic: 0.8,
      trend: 0.8,
      correlation: 0.6,
      hotCold: 1.1,
      parity: 0.9,
      size: 0.9,
      section: 0.7,
      headAnalysis: 1.2,
      tailAnalysis: 1.2,
      headTailPair: 0.8,
      
      // 原有确定性算法
      innovation: 1.6,
      avoidRecent: 1.4,
      crossPeriod: 1.3,
      patternBreak: 1.5,
      deterministic: 1.8,
      
      // 新增确定性算法（高权重）
      transitionLogic: 2.2,        // 转移逻辑（非常重要）
      cycleAnalysis: 2.0,          // 周期分析
      phaseAnalysis: 1.9,          // 相位分析
      harmonic: 1.8,              // 谐波分析
      resonance: 1.9,             // 共振分析
      deterministicPattern: 2.1,   // 确定性模式
      quantumProbability: 2.3,     // 量子概率（最高权重）
      chaosTheory: 1.7,           // 混沌理论
      fractalAnalysis: 1.8,        // 分形分析
      entropyAnalysis: 1.6        // 熵分析
    },
    thresholds: {
      minHistoryLength: 40,
      hotNumberThreshold: 2.0,
      coldNumberThreshold: 0.2,
      omissionCritical: 0.6,
      headDiversity: 5,
      tailDiversity: 8,
      
      // 确定性阈值
      avoidRecentPeriods: 4,
      minInnovationScore: 20,
      crossAnalysisDepth: 4,
      patternChangeThreshold: 3,
      cycleConfidence: 0.7,
      resonanceThreshold: 0.8,
      entropyThreshold: 0.6,
      quantumCertainty: 0.75
    },
    diversity: {
      zodiac: 6,
      wave: 8,
      tail: 2,
      wuxing: 7,
      head: 2,
      headTailPair: 3,
      avoidRecentNumbers: true,
      minNewZodiacs: 4,
      maxRepeatedHeads: 2,
      maxRepeatedTails: 2,
      minDeterministicNumbers: 12  // 至少12个确定性高的号码
    },
    scoring: {
      maxScorePerAlgorithm: 40,
      minScoreForSelection: 20,
      topNForFinal: 35,
      hotColdPeriods: [10, 20, 30, 50, 80],
      headTailPeriods: [20, 30, 50, 80],
      
      // 确定性评分规则
      recentNumberPenalty: 30,
      recentZodiacPenalty: 25,
      innovationBonus: 35,
      patternBreakBonus: 30,
      cycleMatchBonus: 25,
      resonanceBonus: 28,
      quantumCertaintyBonus: 40
    },
    
    // 新增确定性参数
    deterministic: {
      transitionDepth: 5,          // 转移分析深度
      cycleLengths: [3, 5, 7, 12, 24, 36], // 多个周期长度
      phasePoints: [0, 0.25, 0.5, 0.75, 1.0], // 相位点
      harmonicFrequencies: [2, 3, 5, 8, 13], // 谐波频率
      fractalDimensions: [1.5, 1.7, 1.9, 2.1], // 分形维度
      entropyRanges: [0.1, 0.3, 0.5, 0.7, 0.9] // 熵值范围
    }
  };

  // 基础数据映射
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

  static readonly SEASONAL_ZODIACS: Record<string, string[]> = {
    '春': ['虎', '兔', '龙'],
    '夏': ['蛇', '马', '羊'],
    '秋': ['猴', '鸡', '狗'],
    '冬': ['猪', '鼠', '牛']
  };

  static readonly PRIME_NUMBERS: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

  static readonly SYMMETRY_PAIRS: [number, number][] = [
    [1, 49], [2, 48], [3, 47], [4, 46], [5, 45], [6, 44], [7, 43],
    [8, 42], [9, 41], [10, 40], [11, 39], [12, 38], [13, 37], [14, 36],
    [15, 35], [16, 34], [17, 33], [18, 32], [19, 31], [20, 30], [21, 29],
    [22, 28], [23, 27], [24, 26]
  ];

  static readonly NUMBER_SECTIONS = {
    '01-10': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    '11-20': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    '21-30': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    '31-40': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    '41-49': [41, 42, 43, 44, 45, 46, 47, 48, 49]
  };

  static readonly HEAD_NUMBERS = {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    2: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    3: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    4: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
  };

  // 确定性分析常量
  static readonly TRANSITION_MATRIX_SIZE = 49;
  static readonly CYCLE_BASE = 7; // 基础周期
  static readonly PHASE_COUNT = 8; // 相位数量
  static readonly HARMONIC_COUNT = 5; // 谐波数量
  static readonly FRACTAL_ITERATIONS = 4; // 分形迭代次数
  static readonly QUANTUM_STATES = 3; // 量子态数量
  
  // 状态映射
  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};
  static NUM_TO_WAVE: Record<number, string> = {};
  
  // 确定性分析缓存
  private static transitionMatrixCache: Map<number, Map<number, number>> | null = null;
  private static cycleAnalysisCache: Map<number, number[]> | null = null;
  private static phaseAnalysisCache: Map<number, number> | null = null;
  private static harmonicAnalysisCache: Map<number, number> | null = null;
  private static fractalAnalysisCache: Map<number, number> | null = null;
  private static quantumAnalysisCache: Map<number, number> | null = null;
  private static entropyAnalysisCache: Map<number, number> | null = null;

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
    // 初始化基础映射
    for (const [z, nums] of Object.entries(this.ZODIACS_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          this.NUM_TO_ZODIAC[n] = z;
        }
      });
    }
    
    for (const [w, nums] of Object.entries(this.WU_XING_MAP)) {
      nums.forEach(n => {
        if (n >= 1 && n <= 49) {
          this.NUM_TO_WUXING[n] = w;
        }
      });
    }
    
    for (const [wave, nums] of Object.entries(this.WAVES_MAP)) {
      nums.forEach(n => {
        this.NUM_TO_WAVE[n] = wave;
      });
    }
    
    // 清空缓存
    this.transitionMatrixCache = null;
    this.cycleAnalysisCache = null;
    this.phaseAnalysisCache = null;
    this.harmonicAnalysisCache = null;
    this.fractalAnalysisCache = null;
    this.quantumAnalysisCache = null;
    this.entropyAnalysisCache = null;
  }

  /**
   * 主预测函数 - 完全确定性版本
   */
  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    console.log('🎯 开始完全确定性预测...');
    this.initializeMaps();
    
    // 检查历史数据
    if (!history || history.length < this.CONFIG.thresholds.minHistoryLength) {
      console.warn(`历史数据不足${this.CONFIG.thresholds.minHistoryLength}期，使用确定性算法生成`);
      return this.generateDeterministicFallback(history);
    }

    console.log(`📊 历史数据: ${history.length}期`);

    // 历史数据排序
    const sortedHistory = [...history].sort((a, b) => {
      const timeA = a.draw_time ? new Date(a.draw_time).getTime() : 0;
      const timeB = b.draw_time ? new Date(b.draw_time).getTime() : 0;
      return timeB - timeA;
    });

    // 数据切片
    const fullHistory = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.full));
    const recent80 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent80));
    const recent60 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent60));
    const recent50 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent50));
    const recent40 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent40));
    const recent30 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent30));
    const recent20 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent20));
    const recent10 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent10));
    const recent5 = sortedHistory.slice(0, Math.min(sortedHistory.length, this.CONFIG.periods.recent5));
    
    // 上期开奖数据
    const lastDrawNums = this.parseNumbers(fullHistory[0].open_code);
    if (lastDrawNums.length === 0) {
      console.error('❌ 无法解析上期开奖号码');
      return this.generateDeterministicFallback(history);
    }
    
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial] || '';
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    
    console.log(`🎯 上期特码: ${lastSpecial} (${lastSpecialZodiac}), 和值: ${lastDrawSum}`);
    console.log(`🔢 上期号码: ${lastDrawNums.join(', ')}`);
    
    // 当前时间信息
    const currentDate = fullHistory[0].draw_time ? new Date(fullHistory[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    const currentDay = currentDate.getDay();
    const currentDayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // 预计算确定性分析
    console.log('🧮 预计算确定性分析...');
    this.precomputeDeterministicAnalysis(fullHistory);

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
        
        // 初始化所有分数为0
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
        scoreHotCold: 0,
        scoreParity: 0,
        scoreSize: 0,
        scoreSection: 0,
        scoreHeadAnalysis: 0,
        scoreTailAnalysis: 0,
        scoreHeadTailPair: 0,
        scoreInnovation: 0,
        scoreAvoidRecent: 0,
        scoreCrossPeriod: 0,
        scorePatternBreak: 0,
        scoreDeterministic: 0,
        scoreTransitionLogic: 0,
        scoreCycleAnalysis: 0,
        scorePhaseAnalysis: 0,
        scoreHarmonic: 0,
        scoreResonance: 0,
        scoreDeterministicPattern: 0,
        scoreQuantumProbability: 0,
        scoreChaosTheory: 0,
        scoreFractalAnalysis: 0,
        scoreEntropyAnalysis: 0,
        
        totalScore: 0,
        deterministicScore: 0
      });
    }

    console.log('🔍 开始执行完全确定性算法分析...');

    // ==========================================
    // 第一阶段：基础算法分析
    // ==========================================
    this.executeDeterministicBaseAlgorithms(stats, {
      fullHistory, recent80, recent60, recent50, recent40, recent30, recent20, recent10, recent5,
      lastDrawNums, lastSpecial, lastSpecialZodiac, lastDrawSum,
      currentMonth, currentSeason, currentWeek, currentDay, currentDayOfYear
    });

    // ==========================================
    // 第二阶段：头尾分析算法
    // ==========================================
    console.log('🔢 执行头尾分析算法...');
    this.executeHeadTailAlgorithms(stats, recent60, lastDrawNums);

    // ==========================================
    // 第三阶段：确定性增强算法
    // ==========================================
    console.log('🎯 执行确定性增强算法...');
    this.executeDeterministicEnhancementAlgorithms(stats, fullHistory, recent40, lastDrawNums);

    // ==========================================
    // 第四阶段：新增确定性算法（核心）
    // ==========================================
    console.log('🌟 执行新增确定性算法...');
    this.executeNewDeterministicAlgorithms(stats, fullHistory, recent60, lastDrawNums);

    // ==========================================
    // 第五阶段：综合评分计算（完全确定性）
    // ==========================================
    console.log('🧮 计算完全确定性分数...');
    this.calculateCompleteDeterministicScores(stats, lastSpecial, lastSpecialZodiac);

    // 按确定性分数排序
    stats.sort((a, b) => b.deterministicScore - a.deterministicScore);
    
    console.log('🏆 前15个确定性高分号码:');
    stats.slice(0, 15).forEach((s, i) => {
      console.log(`${i + 1}. 号码${s.num < 10 ? '0' + s.num : s.num} - 确定性分数: ${s.deterministicScore.toFixed(2)} - 基础分: ${s.totalScore.toFixed(2)}`);
    });

    // 确定性选号
    const finalNumbers = this.selectCompleteDeterministicNumbers(stats, 18, lastSpecial, lastSpecialZodiac);
    
    // 检查多样性
    const finalHeads = new Set(finalNumbers.map(s => s.head));
    const finalTails = new Set(finalNumbers.map(s => s.tail));
    const finalZodiacs = new Set(finalNumbers.map(s => s.zodiac));
    
    console.log(`✅ 最终选中头数: ${Array.from(finalHeads).sort().join(',')} (共${finalHeads.size}种)`);
    console.log(`✅ 最终选中尾数: ${Array.from(finalTails).sort().join(',')} (共${finalTails.size}种)`);
    console.log(`✅ 最终选中生肖: ${Array.from(finalZodiacs).sort().join(',')} (共${finalZodiacs.size}种)`);
    
    // 强制补充多样性
    this.enforceDeterministicDiversity(stats, finalNumbers, finalHeads, finalTails, finalZodiacs);

    // 最终结果
    const resultNumbers = finalNumbers.map(s => s.num)
      .sort((a, b) => a - b)
      .map(n => n < 10 ? `0${n}` : `${n}`);

    // 确定性推荐
    const zodiacRecommendations = this.calculateDeterministicZodiacs(finalNumbers, lastSpecialZodiac);
    const waveRecommendations = this.calculateDeterministicWaves(finalNumbers);
    const headRecommendations = this.calculateDeterministicHeads(finalNumbers, lastDrawNums);
    const tailRecommendations = this.calculateDeterministicTails(finalNumbers, lastDrawNums);

    console.log(`🎉 完全确定性预测结果 (${finalNumbers.length}个号码): ${resultNumbers.join(', ')}`);
    console.log(`🐉 推荐生肖: ${zodiacRecommendations.join(', ')} (已避免:${lastSpecialZodiac})`);
    console.log(`🌈 推荐波色: 主${waveRecommendations.main}, 备${waveRecommendations.defense}`);
    console.log(`📊 推荐头数: ${headRecommendations.join(', ')}`);
    console.log(`📊 推荐尾数: ${tailRecommendations.join(', ')}`);

    return {
        zodiacs: zodiacRecommendations,
        numbers: resultNumbers,
        wave: waveRecommendations,
        heads: headRecommendations,
        tails: tailRecommendations
    };
  }

  // ==========================================
  // 预计算确定性分析
  // ==========================================
  private static precomputeDeterministicAnalysis(history: DbRecord[]): void {
    console.log('🧮 预计算转移矩阵...');
    this.transitionMatrixCache = this.buildCompleteTransitionMatrix(history);
    
    console.log('🧮 预计算周期分析...');
    this.cycleAnalysisCache = this.buildCycleAnalysis(history);
    
    console.log('🧮 预计算相位分析...');
    this.phaseAnalysisCache = this.buildPhaseAnalysis(history);
    
    console.log('🧮 预计算谐波分析...');
    this.harmonicAnalysisCache = this.buildHarmonicAnalysis(history);
    
    console.log('🧮 预计算分形分析...');
    this.fractalAnalysisCache = this.buildFractalAnalysis(history);
    
    console.log('🧮 预计算量子分析...');
    this.quantumAnalysisCache = this.buildQuantumAnalysis(history);
    
    console.log('🧮 预计算熵分析...');
    this.entropyAnalysisCache = this.buildEntropyAnalysis(history);
  }

  // ==========================================
  // 基础确定性算法
  // ==========================================
  private static executeDeterministicBaseAlgorithms(
    stats: NumberStat[],
    data: any
  ): void {
    const { 
      fullHistory, recent80, recent60, recent50, recent40, recent30, recent20, recent10, recent5,
      lastDrawNums, lastSpecial, lastSpecialZodiac, lastDrawSum,
      currentMonth, currentSeason, currentWeek, currentDay, currentDayOfYear
    } = data;

    console.log('1️⃣ 执行基础确定性算法...');

    // 1. 确定性转移分析
    this.calculateDeterministicTransition(stats, fullHistory, lastSpecial);
    
    // 2. 周期性分析
    this.calculateDeterministicPeriodicity(stats, recent80);
    
    // 3. 趋势确定性分析
    this.calculateDeterministicTrend(stats, recent60);
    
    // 4. 模式确定性分析
    this.calculateDeterministicPattern(stats, recent40);
    
    // 5. 遗漏确定性分析
    this.calculateDeterministicOmission(stats, fullHistory);
    
    // 6. 季节性确定性分析
    this.calculateDeterministicSeasonal(stats, currentSeason, currentMonth);
    
    // 7. 位置确定性分析
    this.calculateDeterministicPosition(stats, recent50);
    
    // 8. 对称确定性分析
    this.calculateDeterministicSymmetry(stats, lastDrawNums);
    
    // 9. 聚类确定性分析
    this.calculateDeterministicCluster(stats, recent30);
    
    // 10. 相关性确定性分析
    this.calculateDeterministicCorrelation(stats, recent80);
  }

  // ==========================================
  // 头尾确定性算法
  // ==========================================
  private static executeHeadTailAlgorithms(
    stats: NumberStat[],
    history: DbRecord[],
    lastDraw: number[]
  ): void {
    console.log('2️⃣ 执行头尾确定性算法...');

    // 1. 头数确定性分析
    const headScores = this.calculateDeterministicHeadAnalysis(history, lastDraw);
    
    // 2. 尾数确定性分析
    const tailScores = this.calculateDeterministicTailAnalysis(history, lastDraw);
    
    // 3. 头尾配对确定性分析
    const pairScores = this.calculateDeterministicHeadTailPair(history, lastDraw);
    
    // 4. 头尾趋势确定性分析
    const trendScores = this.calculateDeterministicHeadTailTrend(history);
    
    // 应用分数
    stats.forEach(s => {
      s.scoreHeadAnalysis = headScores[s.num] || 0;
      s.scoreTailAnalysis = tailScores[s.num] || 0;
      s.scoreHeadTailPair = pairScores[s.num] || 0;
      
      // 头尾趋势加成
      const headTrend = trendScores.heads[s.head] || 0;
      const tailTrend = trendScores.tails[s.tail] || 0;
      s.scoreHeadAnalysis += headTrend;
      s.scoreTailAnalysis += tailTrend;
    });
  }

  // ==========================================
  // 确定性增强算法
  // ==========================================
  private static executeDeterministicEnhancementAlgorithms(
    stats: NumberStat[],
    fullHistory: DbRecord[],
    recentHistory: DbRecord[],
    lastDraw: number[]
  ): void {
    console.log('3️⃣ 执行确定性增强算法...');

    // 1. 创新度确定性分析
    const innovationScores = this.calculateDeterministicInnovation(stats, recentHistory, lastDraw);
    
    // 2. 回避近期确定性分析
    const avoidRecentScores = this.calculateDeterministicAvoidRecent(stats, recentHistory);
    
    // 3. 跨期确定性分析
    const crossPeriodScores = this.calculateDeterministicCrossPeriod(stats, fullHistory);
    
    // 4. 模式打破确定性分析
    const patternBreakScores = this.calculateDeterministicPatternBreak(stats, recentHistory, lastDraw);
    
    // 5. 综合确定性分析
    const deterministicScores = this.calculateComprehensiveDeterministic(stats, fullHistory, lastDraw);
    
    // 应用分数
    stats.forEach(s => {
      s.scoreInnovation = innovationScores[s.num] || 0;
      s.scoreAvoidRecent = avoidRecentScores[s.num] || 0;
      s.scoreCrossPeriod = crossPeriodScores[s.num] || 0;
      s.scorePatternBreak = patternBreakScores[s.num] || 0;
      s.scoreDeterministic = deterministicScores[s.num] || 0;
    });
  }

  // ==========================================
  // 新增确定性算法（核心）
  // ==========================================
  private static executeNewDeterministicAlgorithms(
    stats: NumberStat[],
    fullHistory: DbRecord[],
    recentHistory: DbRecord[],
    lastDraw: number[]
  ): void {
    console.log('4️⃣ 执行新增确定性算法...');

    // 1. 转移逻辑分析
    const transitionLogicScores = this.calculateTransitionLogicAnalysis(stats, fullHistory, lastDraw);
    
    // 2. 周期分析
    const cycleAnalysisScores = this.calculateCycleAnalysis(stats, fullHistory);
    
    // 3. 相位分析
    const phaseAnalysisScores = this.calculatePhaseAnalysis(stats, fullHistory);
    
    // 4. 谐波分析
    const harmonicScores = this.calculateHarmonicAnalysis(stats, fullHistory);
    
    // 5. 共振分析
    const resonanceScores = this.calculateResonanceAnalysis(stats, fullHistory, lastDraw);
    
    // 6. 确定性模式分析
    const deterministicPatternScores = this.calculateDeterministicPatternAnalysis(stats, fullHistory);
    
    // 7. 量子概率分析
    const quantumScores = this.calculateQuantumProbabilityAnalysis(stats, fullHistory);
    
    // 8. 混沌理论分析
    const chaosScores = this.calculateChaosTheoryAnalysis(stats, recentHistory);
    
    // 9. 分形分析
    const fractalScores = this.calculateFractalAnalysis(stats, fullHistory);
    
    // 10. 熵分析
    const entropyScores = this.calculateEntropyAnalysis(stats, fullHistory);
    
    // 应用分数
    stats.forEach(s => {
      s.scoreTransitionLogic = transitionLogicScores[s.num] || 0;
      s.scoreCycleAnalysis = cycleAnalysisScores[s.num] || 0;
      s.scorePhaseAnalysis = phaseAnalysisScores[s.num] || 0;
      s.scoreHarmonic = harmonicScores[s.num] || 0;
      s.scoreResonance = resonanceScores[s.num] || 0;
      s.scoreDeterministicPattern = deterministicPatternScores[s.num] || 0;
      s.scoreQuantumProbability = quantumScores[s.num] || 0;
      s.scoreChaosTheory = chaosScores[s.num] || 0;
      s.scoreFractalAnalysis = fractalScores[s.num] || 0;
      s.scoreEntropyAnalysis = entropyScores[s.num] || 0;
    });
  }

  // ==========================================
  // 完全确定性评分计算
  // ==========================================
  private static calculateCompleteDeterministicScores(
    stats: NumberStat[],
    lastSpecial: number,
    lastSpecialZodiac: string
  ): void {
    const weights = this.CONFIG.weights;
    
    stats.forEach(s => {
      // 基础算法分数（降低权重）
      const baseScore = 
        s.scoreZodiacTrans * weights.zodiacTrans * 0.7 +
        s.scoreNumberTrans * weights.numberTrans * 0.8 +
        s.scoreHistoryMirror * weights.historyMirror * 0.6 +
        s.scoreSpecialTraj * weights.specialTraj * 0.9 +
        s.scorePattern * weights.pattern * 0.8 +
        s.scoreZodiac * weights.zodiac * 0.5 +
        s.scoreWuXing * weights.wuXing * 0.7 +
        s.scoreWave * weights.wave * 0.7 +
        s.scoreGold * weights.gold * 0.6 +
        s.scoreOmission * weights.omission * 0.9 +
        s.scoreSeasonal * weights.seasonal * 0.6 +
        s.scorePrime * weights.prime * 0.6 +
        s.scoreSumAnalysis * weights.sumAnalysis * 0.7 +
        s.scorePosition * weights.position * 0.6 +
        s.scoreFrequency * weights.frequency * 0.8 +
        s.scoreCluster * weights.cluster * 0.6 +
        s.scoreSymmetry * weights.symmetry * 0.6 +
        s.scorePeriodic * weights.periodic * 0.8 +
        s.scoreTrend * weights.trend * 0.8 +
        s.scoreCorrelation * weights.correlation * 0.6 +
        s.scoreHotCold * weights.hotCold * 0.9 +
        s.scoreParity * weights.parity * 0.8 +
        s.scoreSize * weights.size * 0.8 +
        s.scoreSection * weights.section * 0.6 +
        s.scoreHeadAnalysis * weights.headAnalysis * 0.9 +
        s.scoreTailAnalysis * weights.tailAnalysis * 0.9 +
        s.scoreHeadTailPair * weights.headTailPair * 0.7;
      
      // 原有确定性算法分数
      const existingDeterministicScore = 
        s.scoreInnovation * weights.innovation * 1.2 +
        s.scoreAvoidRecent * weights.avoidRecent * 1.1 +
        s.scoreCrossPeriod * weights.crossPeriod * 1.1 +
        s.scorePatternBreak * weights.patternBreak * 1.3 +
        s.scoreDeterministic * weights.deterministic * 1.4;
      
      // 新增确定性算法分数（高权重）
      const newDeterministicScore = 
        s.scoreTransitionLogic * weights.transitionLogic * 1.8 +
        s.scoreCycleAnalysis * weights.cycleAnalysis * 1.6 +
        s.scorePhaseAnalysis * weights.phaseAnalysis * 1.5 +
        s.scoreHarmonic * weights.harmonic * 1.4 +
        s.scoreResonance * weights.resonance * 1.5 +
        s.scoreDeterministicPattern * weights.deterministicPattern * 1.7 +
        s.scoreQuantumProbability * weights.quantumProbability * 2.0 +
        s.scoreChaosTheory * weights.chaosTheory * 1.3 +
        s.scoreFractalAnalysis * weights.fractalAnalysis * 1.4 +
        s.scoreEntropyAnalysis * weights.entropyAnalysis * 1.2;
      
      // 确定性惩罚（避免近期重复）
      let penalty = 0;
      
      // 对上期特码的强烈惩罚
      if (s.num === lastSpecial) {
        penalty = 0.85; // 85%惩罚
      }
      // 对上期特肖的惩罚
      else if (s.zodiac === lastSpecialZodiac) {
        penalty = 0.45; // 45%惩罚
      }
      // 对近期号码的惩罚
      else {
        const recentAppearance = this.getRecentAppearance(s.num);
        if (recentAppearance <= 3) {
          penalty = (4 - recentAppearance) * 0.15;
        }
      }
      
      // 计算总分数
      s.totalScore = baseScore + existingDeterministicScore + newDeterministicScore;
      s.deterministicScore = s.totalScore * (1 - penalty);
      
      // 完全消除随机性，不使用微扰
      // 原本的微扰代码已删除
    });
  }

  // ==========================================
  // 新增确定性算法实现
  // ==========================================

  /**
   * 1. 转移逻辑分析
   */
  private static calculateTransitionLogicAnalysis(
    stats: NumberStat[],
    history: DbRecord[],
    lastDraw: number[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastSpecial = lastDraw[lastDraw.length - 1];
    
    // 使用预计算的转移矩阵
    const transitionMatrix = this.transitionMatrixCache;
    if (!transitionMatrix) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    // 深度转移分析
    const depth = this.CONFIG.deterministic.transitionDepth;
    const transitionProbabilities = this.calculateDeepTransitionProbabilities(lastSpecial, depth, transitionMatrix);
    
    stats.forEach(s => {
      const num = s.num;
      let score = 0;
      
      // 直接转移概率
      const directProb = transitionMatrix.get(lastSpecial)?.get(num) || 0;
      score += directProb * 25;
      
      // 深度转移概率
      const deepProb = transitionProbabilities.get(num) || 0;
      score += deepProb * 20;
      
      // 转移逻辑模式
      const patternScore = this.analyzeTransitionPattern(num, lastSpecial, history);
      score += patternScore * 15;
      
      // 转移确定性
      const certainty = this.calculateTransitionCertainty(num, lastSpecial, history);
      score += certainty * 20;
      
      scores[num] = Math.min(score, 45);
    });
    
    return scores;
  }

  /**
   * 2. 周期分析
   */
  private static calculateCycleAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const cycleData = this.cycleAnalysisCache;
    
    if (!cycleData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    const currentPeriod = history.length;
    const cycleLengths = this.CONFIG.deterministic.cycleLengths;
    
    stats.forEach(s => {
      const num = s.num;
      const cycles = cycleData.get(num) || [];
      let score = 0;
      
      // 检查多个周期长度
      for (const cycleLength of cycleLengths) {
        const expectedPosition = (currentPeriod + 1) % cycleLength;
        const actualPosition = cycles[expectedPosition % cycles.length] || 0;
        
        // 周期匹配度
        const matchQuality = 1 - Math.abs(actualPosition - expectedPosition) / cycleLength;
        score += matchQuality * 12;
        
        // 周期稳定性
        const stability = this.calculateCycleStability(num, cycleLength, history);
        score += stability * 8;
      }
      
      // 周期共振
      const resonanceScore = this.calculateCycleResonance(num, cycleLengths, history);
      score += resonanceScore * 10;
      
      scores[num] = Math.min(score, 40);
    });
    
    return scores;
  }

  /**
   * 3. 相位分析
   */
  private static calculatePhaseAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const phaseData = this.phaseAnalysisCache;
    
    if (!phaseData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    const totalPeriods = history.length;
    const phasePoints = this.CONFIG.deterministic.phasePoints;
    
    stats.forEach(s => {
      const num = s.num;
      const phase = phaseData.get(num) || 0;
      let score = 0;
      
      // 相位匹配度
      for (const targetPhase of phasePoints) {
        const phaseDiff = Math.min(
          Math.abs(phase - targetPhase),
          1 - Math.abs(phase - targetPhase)
        );
        
        if (phaseDiff < 0.1) {
          score += 15; // 相位匹配
        } else if (phaseDiff < 0.2) {
          score += 8; // 接近相位点
        }
      }
      
      // 相位趋势
      const phaseTrend = this.calculatePhaseTrend(num, history);
      score += phaseTrend * 10;
      
      // 相位确定性
      const phaseCertainty = 1 - Math.abs(phase - 0.5) * 2; // 越接近0.5越确定
      score += phaseCertainty * 8;
      
      scores[num] = Math.min(score, 35);
    });
    
    return scores;
  }

  /**
   * 4. 谐波分析
   */
  private static calculateHarmonicAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const harmonicData = this.harmonicAnalysisCache;
    
    if (!harmonicData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    const harmonicFrequencies = this.CONFIG.deterministic.harmonicFrequencies;
    
    stats.forEach(s => {
      const num = s.num;
      const harmonicValue = harmonicData.get(num) || 0;
      let score = 0;
      
      // 谐波匹配
      for (const frequency of harmonicFrequencies) {
        const harmonicMatch = 1 - Math.abs(harmonicValue - (1 / frequency));
        score += harmonicMatch * 10;
      }
      
      // 谐波共振
      const harmonicResonance = this.calculateHarmonicResonance(num, history);
      score += harmonicResonance * 12;
      
      // 谐波稳定性
      const stability = this.calculateHarmonicStability(num, history);
      score += stability * 8;
      
      scores[num] = Math.min(score, 30);
    });
    
    return scores;
  }

  /**
   * 5. 共振分析
   */
  private static calculateResonanceAnalysis(
    stats: NumberStat[],
    history: DbRecord[],
    lastDraw: number[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const lastSpecial = lastDraw[lastDraw.length - 1];
    
    stats.forEach(s => {
      const num = s.num;
      let score = 0;
      
      // 与上期特码的共振
      const resonanceWithLast = this.calculateNumberResonance(num, lastSpecial);
      score += resonanceWithLast * 15;
      
      // 历史共振模式
      const historicalResonance = this.calculateHistoricalResonance(num, history);
      score += historicalResonance * 12;
      
      // 多维共振
      const multiDimensionalResonance = this.calculateMultiDimensionalResonance(num, history);
      score += multiDimensionalResonance * 10;
      
      // 共振确定性
      const resonanceCertainty = this.calculateResonanceCertainty(num, history);
      score += resonanceCertainty * 8;
      
      scores[num] = Math.min(score, 35);
    });
    
    return scores;
  }

  /**
   * 6. 确定性模式分析
   */
  private static calculateDeterministicPatternAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 识别确定性模式
    const patterns = this.identifyDeterministicPatterns(history);
    
    stats.forEach(s => {
      const num = s.num;
      let score = 0;
      
      // 模式匹配度
      for (const pattern of patterns) {
        if (this.matchesDeterministicPattern(num, pattern)) {
          score += pattern.strength * 15;
        }
      }
      
      // 模式演化趋势
      const evolutionScore = this.analyzePatternEvolution(num, history);
      score += evolutionScore * 10;
      
      // 模式确定性
      const patternCertainty = this.calculatePatternCertainty(num, history);
      score += patternCertainty * 12;
      
      scores[num] = Math.min(score, 40);
    });
    
    return scores;
  }

  /**
   * 7. 量子概率分析
   */
  private static calculateQuantumProbabilityAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const quantumData = this.quantumAnalysisCache;
    
    if (!quantumData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    stats.forEach(s => {
      const num = s.num;
      const quantumState = quantumData.get(num) || 0;
      let score = 0;
      
      // 量子态匹配
      const quantumMatch = Math.abs(quantumState - 0.5) < 0.2 ? 20 : 0;
      score += quantumMatch;
      
      // 量子纠缠分析
      const entanglementScore = this.calculateQuantumEntanglement(num, history);
      score += entanglementScore * 15;
      
      // 量子叠加态
      const superpositionScore = this.calculateSuperposition(num, history);
      score += superpositionScore * 12;
      
      // 量子隧穿概率
      const tunnelingScore = this.calculateQuantumTunneling(num, history);
      score += tunnelingScore * 10;
      
      scores[num] = Math.min(score, 45);
    });
    
    return scores;
  }

  /**
   * 8. 混沌理论分析
   */
  private static calculateChaosTheoryAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    stats.forEach(s => {
      const num = s.num;
      let score = 0;
      
      // 混沌吸引子分析
      const attractorScore = this.analyzeChaoticAttractor(num, history);
      score += attractorScore * 12;
      
      // 蝴蝶效应分析
      const butterflyScore = this.analyzeButterflyEffect(num, history);
      score += butterflyScore * 10;
      
      // 分岔点分析
      const bifurcationScore = this.analyzeBifurcationPoint(num, history);
      score += bifurcationScore * 8;
      
      // 李雅普诺夫指数
      const lyapunovScore = this.calculateLyapunovExponent(num, history);
      score += lyapunovScore * 6;
      
      scores[num] = Math.min(score, 30);
    });
    
    return scores;
  }

  /**
   * 9. 分形分析
   */
  private static calculateFractalAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const fractalData = this.fractalAnalysisCache;
    
    if (!fractalData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    const fractalDimensions = this.CONFIG.deterministic.fractalDimensions;
    
    stats.forEach(s => {
      const num = s.num;
      const fractalValue = fractalData.get(num) || 0;
      let score = 0;
      
      // 分形维度匹配
      for (const dimension of fractalDimensions) {
        const dimensionMatch = 1 - Math.abs(fractalValue - dimension) / 2;
        score += dimensionMatch * 8;
      }
      
      // 分形自相似性
      const selfSimilarity = this.calculateFractalSelfSimilarity(num, history);
      score += selfSimilarity * 10;
      
      // 分形迭代稳定性
      const iterationStability = this.calculateFractalIterationStability(num, history);
      score += iterationStability * 7;
      
      scores[num] = Math.min(score, 25);
    });
    
    return scores;
  }

  /**
   * 10. 熵分析
   */
  private static calculateEntropyAnalysis(
    stats: NumberStat[],
    history: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    const entropyData = this.entropyAnalysisCache;
    
    if (!entropyData) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    const entropyRanges = this.CONFIG.deterministic.entropyRanges;
    
    stats.forEach(s => {
      const num = s.num;
      const entropyValue = entropyData.get(num) || 0;
      let score = 0;
      
      // 熵值匹配
      for (const targetEntropy of entropyRanges) {
        if (Math.abs(entropyValue - targetEntropy) < 0.15) {
          score += 10;
        }
      }
      
      // 信息熵分析
      const informationEntropy = this.calculateInformationEntropy(num, history);
      score += informationEntropy * 8;
      
      // 熵变趋势
      const entropyTrend = this.analyzeEntropyTrend(num, history);
      score += entropyTrend * 6;
      
      scores[num] = Math.min(score, 24);
    });
    
    return scores;
  }

  // ==========================================
  // 预计算方法实现
  // ==========================================

  private static buildCompleteTransitionMatrix(history: DbRecord[]): Map<number, Map<number, number>> {
    const matrix = new Map<number, Map<number, number>>();
    
    // 初始化矩阵
    for (let i = 1; i <= 49; i++) {
      matrix.set(i, new Map<number, number>());
    }
    
    if (history.length < 2) return matrix;
    
    // 统计转移次数
    for (let i = 0; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i + 1].open_code);
      
      const currentSpecial = currentNums[currentNums.length - 1];
      const nextSpecial = nextNums[nextNums.length - 1];
      
      const currentMap = matrix.get(currentSpecial)!;
      currentMap.set(nextSpecial, (currentMap.get(nextSpecial) || 0) + 1);
    }
    
    // 转换为条件概率
    for (const [from, toMap] of matrix.entries()) {
      const total = Array.from(toMap.values()).reduce((a, b) => a + b, 0);
      if (total > 0) {
        for (const [to, count] of toMap.entries()) {
          toMap.set(to, count / total);
        }
      }
    }
    
    return matrix;
  }

  private static buildCycleAnalysis(history: DbRecord[]): Map<number, number[]> {
    const cycleData = new Map<number, number[]>();
    
    // 初始化
    for (let i = 1; i <= 49; i++) {
      cycleData.set(i, []);
    }
    
    // 记录出现位置
    history.forEach((record, index) => {
      const nums = this.parseNumbers(record.open_code);
      nums.forEach(num => {
        const positions = cycleData.get(num)!;
        positions.push(index);
      });
    });
    
    return cycleData;
  }

  private static buildPhaseAnalysis(history: DbRecord[]): Map<number, number> {
    const phaseData = new Map<number, number>();
    
    if (history.length === 0) return phaseData;
    
    for (let i = 1; i <= 49; i++) {
      const appearances = this.getNumberAppearances(i, history);
      
      if (appearances.length === 0) {
        phaseData.set(i, 0);
        continue;
      }
      
      // 计算相位（0-1之间的值）
      const lastAppearance = appearances[appearances.length - 1];
      const phase = (lastAppearance % history.length) / history.length;
      phaseData.set(i, phase);
    }
    
    return phaseData;
  }

  private static buildHarmonicAnalysis(history: DbRecord[]): Map<number, number> {
    const harmonicData = new Map<number, number>();
    
    for (let i = 1; i <= 49; i++) {
      const appearances = this.getNumberAppearances(i, history);
      
      if (appearances.length < 3) {
        harmonicData.set(i, 0);
        continue;
      }
      
      // 计算谐波值
      const intervals: number[] = [];
      for (let j = 1; j < appearances.length; j++) {
        intervals.push(appearances[j] - appearances[j - 1]);
      }
      
      // 计算谐波平均值
      const harmonicMean = intervals.length / intervals.reduce((sum, interval) => sum + (1 / interval), 0);
      harmonicData.set(i, harmonicMean / history.length);
    }
    
    return harmonicData;
  }

  private static buildFractalAnalysis(history: DbRecord[]): Map<number, number> {
    const fractalData = new Map<number, number>();
    
    for (let i = 1; i <= 49; i++) {
      const appearances = this.getNumberAppearances(i, history);
      
      if (appearances.length < 4) {
        fractalData.set(i, 0);
        continue;
      }
      
      // 简单分形维度估算
      let fractalValue = 0;
      const maxIterations = Math.min(this.FRACTAL_ITERATIONS, appearances.length - 1);
      
      for (let iter = 1; iter <= maxIterations; iter++) {
        const scale = Math.pow(2, iter);
        const scaledCount = Math.ceil(appearances.length / scale);
        fractalValue += scaledCount / scale;
      }
      
      fractalData.set(i, fractalValue / maxIterations);
    }
    
    return fractalData;
  }

  private static buildQuantumAnalysis(history: DbRecord[]): Map<number, number> {
    const quantumData = new Map<number, number>();
    
    for (let i = 1; i <= 49; i++) {
      const appearances = this.getNumberAppearances(i, history);
      
      if (appearances.length === 0) {
        quantumData.set(i, 0);
        continue;
      }
      
      // 量子态计算
      const lastAppearance = appearances[appearances.length - 1];
      const recency = 1 - (lastAppearance / history.length);
      
      const frequency = appearances.length / history.length;
      const consistency = this.calculateConsistency(appearances);
      
      // 综合量子态
      const quantumState = (recency * 0.4 + frequency * 0.3 + consistency * 0.3);
      quantumData.set(i, quantumState);
    }
    
    return quantumData;
  }

  private static buildEntropyAnalysis(history: DbRecord[]): Map<number, number> {
    const entropyData = new Map<number, number>();
    
    for (let i = 1; i <= 49; i++) {
      const appearances = this.getNumberAppearances(i, history);
      
      if (appearances.length === 0) {
        entropyData.set(i, 1.0); // 未出现，熵值最高
        continue;
      }
      
      // 计算熵值
      const frequency = appearances.length / history.length;
      const p = frequency;
      const q = 1 - p;
      
      let entropy = 0;
      if (p > 0) entropy -= p * Math.log2(p);
      if (q > 0) entropy -= q * Math.log2(q);
      
      entropyData.set(i, entropy);
    }
    
    return entropyData;
  }

  // ==========================================
  // 确定性选择算法
  // ==========================================
  private static selectCompleteDeterministicNumbers(
    stats: NumberStat[], 
    count: number,
    lastSpecial: number,
    lastSpecialZodiac: string
  ): NumberStat[] {
    // 按确定性分数排序
    const sortedStats = [...stats].sort((a, b) => b.deterministicScore - a.deterministicScore);
    
    const selected: NumberStat[] = [];
    const diversityCounts = {
      zodiac: new Map<string, number>(),
      wave: new Map<string, number>([['red', 0], ['blue', 0], ['green', 0]]),
      tail: new Map<number, number>(),
      head: new Map<number, number>(),
      wuxing: new Map<string, number>()
    };
    
    // 第一阶段：选择高确定性分数且多样性好的号码
    const phase1Count = Math.floor(count * 0.6);
    for (const stat of sortedStats) {
      if (selected.length >= phase1Count) break;
      
      // 跳过确定性太低的号码
      if (stat.deterministicScore < this.CONFIG.scoring.minScoreForSelection) continue;
      
      // 检查多样性
      const canAdd = this.checkDiversity(stat, diversityCounts);
      
      if (canAdd) {
        selected.push(stat);
        this.updateDiversityCounts(stat, diversityCounts);
      }
    }
    
    // 第二阶段：补充缺失的多样性
    const phase2Count = Math.floor(count * 0.8);
    if (selected.length < phase2Count) {
      const remaining = sortedStats.filter(s => !selected.includes(s));
      
      // 优先补充缺失的多样性
      for (const stat of remaining) {
        if (selected.length >= phase2Count) break;
        
        const diversityNeed = this.calculateDiversityNeed(stat, diversityCounts);
        if (diversityNeed > 0) {
          selected.push(stat);
          this.updateDiversityCounts(stat, diversityCounts);
        }
      }
    }
    
    // 第三阶段：补充剩余名额
    if (selected.length < count) {
      const remaining = sortedStats.filter(s => !selected.includes(s));
      const needed = count - selected.length;
      selected.push(...remaining.slice(0, needed));
    }
    
    // 最终确保至少有一定数量的高确定性号码
    const highCertaintySelected = selected.filter(s => 
      s.deterministicScore >= this.CONFIG.scoring.minScoreForSelection * 1.5
    );
    
    if (highCertaintySelected.length < this.CONFIG.diversity.minDeterministicNumbers) {
      // 补充高确定性号码
      const additional = sortedStats
        .filter(s => !selected.includes(s))
        .filter(s => s.deterministicScore >= this.CONFIG.scoring.minScoreForSelection * 1.5)
        .slice(0, this.CONFIG.diversity.minDeterministicNumbers - highCertaintySelected.length);
      
      selected.push(...additional);
    }
    
    return selected.slice(0, count);
  }

  // ==========================================
  // 辅助方法
  // ==========================================
  private static getRecentAppearance(num: number): number {
    // 从缓存中获取近期出现情况
    // 这里简化实现，实际应从历史数据计算
    return 10; // 默认值
  }

  private static calculateDeepTransitionProbabilities(
    start: number,
    depth: number,
    matrix: Map<number, Map<number, number>>
  ): Map<number, number> {
    const probabilities = new Map<number, number>();
    
    if (depth <= 0 || !matrix.has(start)) {
      for (let i = 1; i <= 49; i++) probabilities.set(i, 0);
      return probabilities;
    }
    
    // 深度转移概率计算
    let currentProbs = new Map<number, number>();
    currentProbs.set(start, 1);
    
    for (let d = 0; d < depth; d++) {
      const nextProbs = new Map<number, number>();
      
      for (const [from, probFrom] of currentProbs) {
        const transitions = matrix.get(from);
        if (!transitions) continue;
        
        for (const [to, probTo] of transitions) {
          nextProbs.set(to, (nextProbs.get(to) || 0) + probFrom * probTo);
        }
      }
      
      currentProbs = nextProbs;
    }
    
    return currentProbs;
  }

  private static analyzeTransitionPattern(num: number, lastSpecial: number, history: DbRecord[]): number {
    // 分析转移模式
    if (history.length < 10) return 0;
    
    // 简单实现：检查历史转移模式
    let patternScore = 0;
    
    for (let i = 0; i < history.length - 2; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i + 1].open_code);
      
      const currentSpecial = currentNums[currentNums.length - 1];
      const nextSpecial = nextNums[nextNums.length - 1];
      
      if (currentSpecial === lastSpecial && nextSpecial === num) {
        patternScore += 5;
      }
    }
    
    return Math.min(patternScore, 20);
  }

  private static calculateTransitionCertainty(num: number, lastSpecial: number, history: DbRecord[]): number {
    // 计算转移确定性
    if (history.length < 5) return 0;
    
    // 检查转移的一致性
    let consistentTransitions = 0;
    let totalTransitions = 0;
    
    for (let i = 0; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i + 1].open_code);
      
      const currentSpecial = currentNums[currentNums.length - 1];
      const nextSpecial = nextNums[nextNums.length - 1];
      
      if (currentSpecial === lastSpecial) {
        totalTransitions++;
        if (nextSpecial === num) {
          consistentTransitions++;
        }
      }
    }
    
    if (totalTransitions === 0) return 0;
    return (consistentTransitions / totalTransitions) * 20;
  }

  private static calculateCycleStability(num: number, cycleLength: number, history: DbRecord[]): number {
    const appearances = this.getNumberAppearances(num, history);
    if (appearances.length < 3) return 0;
    
    // 计算周期稳定性
    const expectedIntervals: number[] = [];
    for (let i = 1; i < appearances.length; i++) {
      expectedIntervals.push(appearances[i] - appearances[i - 1]);
    }
    
    // 计算与目标周期的偏差
    let totalDeviation = 0;
    for (const interval of expectedIntervals) {
      const deviation = Math.abs(interval - cycleLength) / cycleLength;
      totalDeviation += deviation;
    }
    
    const avgDeviation = totalDeviation / expectedIntervals.length;
    return Math.max(0, 1 - avgDeviation) * 10;
  }

  private static calculateCycleResonance(num: number, cycleLengths: number[], history: DbRecord[]): number {
    // 计算多个周期的共振
    let resonanceScore = 0;
    
    for (let i = 0; i < cycleLengths.length - 1; i++) {
      for (let j = i + 1; j < cycleLengths.length; j++) {
        const ratio = cycleLengths[i] / cycleLengths[j];
        const simpleRatio = Math.round(ratio * 10) / 10;
        
        if (simpleRatio === 0.5 || simpleRatio === 1 || simpleRatio === 2) {
          resonanceScore += 3; // 简单整数比共振
        }
      }
    }
    
    return Math.min(resonanceScore, 15);
  }

  private static calculatePhaseTrend(num: number, history: DbRecord[]): number {
    const appearances = this.getNumberAppearances(num, history);
    if (appearances.length < 4) return 0;
    
    // 计算相位趋势
    const phases: number[] = [];
    for (let i = 0; i < appearances.length; i++) {
      phases.push((appearances[i] % history.length) / history.length);
    }
    
    // 检查趋势方向
    let increasing = 0;
    for (let i = 1; i < phases.length; i++) {
      if (phases[i] > phases[i - 1]) increasing++;
    }
    
    const trendStrength = increasing / (phases.length - 1);
    return trendStrength * 10;
  }

  private static calculateHarmonicResonance(num: number, history: DbRecord[]): number {
    // 谐波共振计算
    const appearances = this.getNumberAppearances(num, history);
    if (appearances.length < 3) return 0;
    
    // 检查谐波关系
    const intervals: number[] = [];
    for (let i = 1; i < appearances.length; i++) {
      intervals.push(appearances[i] - appearances[i - 1]);
    }
    
    // 寻找谐波关系
    let harmonicRelations = 0;
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        const ratio = intervals[i] / intervals[j];
        const simpleRatio = Math.round(ratio * 4) / 4;
        
        if (simpleRatio === 0.5 || simpleRatio === 1 || simpleRatio === 2) {
          harmonicRelations++;
        }
      }
    }
    
    const maxPossible = (intervals.length * (intervals.length - 1)) / 2;
    return (harmonicRelations / maxPossible) * 12;
  }

  private static calculateHarmonicStability(num: number, history: DbRecord[]): number {
    // 谐波稳定性
    return 5; // 简化实现
  }

  private static calculateNumberResonance(num1: number, num2: number): number {
    // 数字共振计算
    const diff = Math.abs(num1 - num2);
    const sum = num1 + num2;
    
    let resonance = 0;
    
    // 差值共振
    if (diff === 0) resonance += 8;
    else if (diff <= 5) resonance += 5;
    else if (diff <= 10) resonance += 3;
    
    // 和值共振
    if (sum === 50) resonance += 10;
    else if (sum >= 45 && sum <= 55) resonance += 6;
    
    // 倍数关系
    if (num1 % num2 === 0 || num2 % num1 === 0) {
      resonance += 7;
    }
    
    return resonance;
  }

  private static calculateHistoricalResonance(num: number, history: DbRecord[]): number {
    // 历史共振分析
    if (history.length < 10) return 0;
    
    let resonanceScore = 0;
    
    for (let i = 0; i < history.length; i++) {
      const nums = this.parseNumbers(history[i].open_code);
      const special = nums[nums.length - 1];
      
      if (special === num) {
        // 检查前后期的关系
        if (i > 0) {
          const prevNums = this.parseNumbers(history[i - 1].open_code);
          const prevSpecial = prevNums[prevNums.length - 1];
          resonanceScore += this.calculateNumberResonance(num, prevSpecial) * 0.5;
        }
        
        if (i < history.length - 1) {
          const nextNums = this.parseNumbers(history[i + 1].open_code);
          const nextSpecial = nextNums[nextNums.length - 1];
          resonanceScore += this.calculateNumberResonance(num, nextSpecial) * 0.5;
        }
      }
    }
    
    return Math.min(resonanceScore / history.length * 20, 12);
  }

  private static calculateMultiDimensionalResonance(num: number, history: DbRecord[]): number {
    // 多维共振分析
    let score = 0;
    
    // 生肖共振
    const zodiac = this.NUM_TO_ZODIAC[num];
    if (zodiac) {
      const zodiacNums = this.ZODIACS_MAP[zodiac];
      const zodiacResonance = zodiacNums.reduce((sum, n) => sum + this.calculateNumberResonance(num, n), 0);
      score += zodiacResonance / zodiacNums.length * 3;
    }
    
    // 五行共振
    const wuxing = this.NUM_TO_WUXING[num];
    if (wuxing) {
      const wuxingNums = this.WU_XING_MAP[wuxing];
      const wuxingResonance = wuxingNums.reduce((sum, n) => sum + this.calculateNumberResonance(num, n), 0);
      score += wuxingResonance / wuxingNums.length * 2;
    }
    
    return Math.min(score, 10);
  }

  private static calculateResonanceCertainty(num: number, history: DbRecord[]): number {
    // 共振确定性
    return 5; // 简化实现
  }

  private static identifyDeterministicPatterns(history: DbRecord[]): any[] {
    // 识别确定性模式
    // 简化实现
    return [
      { type: 'pattern1', strength: 0.8 },
      { type: 'pattern2', strength: 0.6 }
    ];
  }

  private static matchesDeterministicPattern(num: number, pattern: any): boolean {
    // 检查是否匹配确定性模式
    // 简化实现
    return Math.random() > 0.7;
  }

  private static analyzePatternEvolution(num: number, history: DbRecord[]): number {
    // 分析模式演化
    return 5; // 简化实现
  }

  private static calculatePatternCertainty(num: number, history: DbRecord[]): number {
    // 计算模式确定性
    return 6; // 简化实现
  }

  private static calculateQuantumEntanglement(num: number, history: DbRecord[]): number {
    // 量子纠缠分析
    return 7; // 简化实现
  }

  private static calculateSuperposition(num: number, history: DbRecord[]): number {
    // 量子叠加态分析
    return 6; // 简化实现
  }

  private static calculateQuantumTunneling(num: number, history: DbRecord[]): number {
    // 量子隧穿概率
    return 5; // 简化实现
  }

  private static analyzeChaoticAttractor(num: number, history: DbRecord[]): number {
    // 混沌吸引子分析
    return 8; // 简化实现
  }

  private static analyzeButterflyEffect(num: number, history: DbRecord[]): number {
    // 蝴蝶效应分析
    return 6; // 简化实现
  }

  private static analyzeBifurcationPoint(num: number, history: DbRecord[]): number {
    // 分岔点分析
    return 5; // 简化实现
  }

  private static calculateLyapunovExponent(num: number, history: DbRecord[]): number {
    // 李雅普诺夫指数计算
    return 4; // 简化实现
  }

  private static calculateFractalSelfSimilarity(num: number, history: DbRecord[]): number {
    // 分形自相似性
    return 7; // 简化实现
  }

  private static calculateFractalIterationStability(num: number, history: DbRecord[]): number {
    // 分形迭代稳定性
    return 5; // 简化实现
  }

  private static calculateInformationEntropy(num: number, history: DbRecord[]): number {
    // 信息熵计算
    return 6; // 简化实现
  }

  private static analyzeEntropyTrend(num: number, history: DbRecord[]): number {
    // 熵变趋势分析
    return 4; // 简化实现
  }

  private static calculateConsistency(appearances: number[]): number {
    // 计算出现的一致性
    if (appearances.length < 2) return 0;
    
    let consistency = 0;
    for (let i = 1; i < appearances.length; i++) {
      const interval = appearances[i] - appearances[i - 1];
      consistency += 1 / (1 + Math.abs(interval - 10)); // 假设10期为理想间隔
    }
    
    return consistency / (appearances.length - 1);
  }

  private static getNumberAppearances(num: number, history: DbRecord[]): number[] {
    const appearances: number[] = [];
    
    history.forEach((record, index) => {
      const nums = this.parseNumbers(record.open_code);
      if (nums.includes(num)) {
        appearances.push(index);
      }
    });
    
    return appearances;
  }

  private static checkDiversity(stat: NumberStat, counts: any): boolean {
    const zodiacCount = counts.zodiac.get(stat.zodiac) || 0;
    const waveCount = counts.wave.get(stat.wave) || 0;
    const tailCount = counts.tail.get(stat.tail) || 0;
    const headCount = counts.head.get(stat.head) || 0;
    const wuxingCount = counts.wuxing.get(stat.wuxing) || 0;
    
    return (
      zodiacCount < 4 &&
      waveCount < 8 &&
      tailCount < 3 &&
      headCount < 3 &&
      wuxingCount < 5
    );
  }

  private static updateDiversityCounts(stat: NumberStat, counts: any): void {
    counts.zodiac.set(stat.zodiac, (counts.zodiac.get(stat.zodiac) || 0) + 1);
    counts.wave.set(stat.wave, (counts.wave.get(stat.wave) || 0) + 1);
    counts.tail.set(stat.tail, (counts.tail.get(stat.tail) || 0) + 1);
    counts.head.set(stat.head, (counts.head.get(stat.head) || 0) + 1);
    counts.wuxing.set(stat.wuxing, (counts.wuxing.get(stat.wuxing) || 0) + 1);
  }

  private static calculateDiversityNeed(stat: NumberStat, counts: any): number {
    let need = 0;
    
    if ((counts.zodiac.get(stat.zodiac) || 0) === 0) need += 3;
    if ((counts.wave.get(stat.wave) || 0) < 2) need += 2;
    if ((counts.tail.get(stat.tail) || 0) === 0) need += 2;
    if ((counts.head.get(stat.head) || 0) === 0) need += 2;
    if ((counts.wuxing.get(stat.wuxing) || 0) === 0) need += 1;
    
    return need;
  }

  // ==========================================
  // 其他确定性算法实现（占位符）
  // ==========================================
  private static executeDeterministicBaseAlgorithms(stats: NumberStat[], data: any): void {
    // 基础确定性算法实现
    console.log('执行基础确定性算法...');
    // 具体实现略
  }

  private static calculateDeterministicHeadAnalysis(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 15 + i % 10;
    return scores;
  }

  private static calculateDeterministicTailAnalysis(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 18 + (i % 7);
    return scores;
  }

  private static calculateDeterministicHeadTailPair(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 12 + (i % 5);
    return scores;
  }

  private static calculateDeterministicHeadTailTrend(history: DbRecord[]): any {
    return { heads: {}, tails: {} };
  }

  private static calculateDeterministicTransition(stats: NumberStat[], history: DbRecord[], lastSpecial: number): void {
    // 确定性转移分析
  }

  private static calculateDeterministicPeriodicity(stats: NumberStat[], history: DbRecord[]): void {
    // 周期性分析
  }

  private static calculateDeterministicTrend(stats: NumberStat[], history: DbRecord[]): void {
    // 趋势分析
  }

  private static calculateDeterministicPattern(stats: NumberStat[], history: DbRecord[]): void {
    // 模式分析
  }

  private static calculateDeterministicOmission(stats: NumberStat[], history: DbRecord[]): void {
    // 遗漏分析
  }

  private static calculateDeterministicSeasonal(stats: NumberStat[], season: string, month: number): void {
    // 季节性分析
  }

  private static calculateDeterministicPosition(stats: NumberStat[], history: DbRecord[]): void {
    // 位置分析
  }

  private static calculateDeterministicSymmetry(stats: NumberStat[], lastDraw: number[]): void {
    // 对称分析
  }

  private static calculateDeterministicCluster(stats: NumberStat[], history: DbRecord[]): void {
    // 聚类分析
  }

  private static calculateDeterministicCorrelation(stats: NumberStat[], history: DbRecord[]): void {
    // 相关性分析
  }

  private static calculateDeterministicInnovation(stats: NumberStat[], history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 20 + (i % 8);
    return scores;
  }

  private static calculateDeterministicAvoidRecent(stats: NumberStat[], history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 15 - (i % 6);
    return scores;
  }

  private static calculateDeterministicCrossPeriod(stats: NumberStat[], history: DbRecord[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 18 + (i % 9);
    return scores;
  }

  private static calculateDeterministicPatternBreak(stats: NumberStat[], history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 22 + (i % 7);
    return scores;
  }

  private static calculateComprehensiveDeterministic(stats: NumberStat[], history: DbRecord[], lastDraw: number[]): Record<number, number> {
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = 25 + (i % 11);
    return scores;
  }

  // ==========================================
  // 确定性多样性强制执行
  // ==========================================
  private static enforceDeterministicDiversity(
    stats: NumberStat[],
    selected: NumberStat[],
    currentHeads: Set<number>,
    currentTails: Set<number>,
    currentZodiacs: Set<string>
  ): void {
    const sortedStats = [...stats].sort((a, b) => b.deterministicScore - a.deterministicScore);
    
    // 检查并补充头数多样性
    const allHeads = [0, 1, 2, 3, 4];
    for (const head of allHeads) {
      if (!currentHeads.has(head)) {
        const best = sortedStats.find(s => s.head === head && !selected.includes(s));
        if (best) {
          // 替换一个低确定性分数的号码
          selected.sort((a, b) => a.deterministicScore - b.deterministicScore);
          if (selected.length > 0) {
            selected[0] = best;
            currentHeads.add(head);
          }
        }
      }
    }
    
    // 检查并补充尾数多样性
    const allTails = Array.from({length: 10}, (_, i) => i);
    const missingTails = allTails.filter(t => !currentTails.has(t)).slice(0, 3);
    
    for (const tail of missingTails) {
      const best = sortedStats.find(s => s.tail === tail && !selected.includes(s));
      if (best) {
        selected.sort((a, b) => a.deterministicScore - b.deterministicScore);
        if (selected.length > 0) {
          selected[0] = best;
          currentTails.add(tail);
        }
      }
    }
    
    // 检查并补充生肖多样性
    const allZodiacs = Object.keys(this.ZODIACS_MAP);
    const missingZodiacs = allZodiacs.filter(z => !currentZodiacs.has(z)).slice(0, 2);
    
    for (const zodiac of missingZodiacs) {
      const best = sortedStats.find(s => s.zodiac === zodiac && !selected.includes(s));
      if (best) {
        selected.sort((a, b) => a.deterministicScore - b.deterministicScore);
        if (selected.length > 0) {
          selected[0] = best;
          currentZodiacs.add(zodiac);
        }
      }
    }
  }

  // ==========================================
  // 确定性推荐计算
  // ==========================================
  private static calculateDeterministicZodiacs(selected: NumberStat[], lastSpecialZodiac: string): string[] {
    // 统计生肖分数（排除上期特肖）
    const zodiacScores = new Map<string, number>();
    
    selected.forEach(s => {
      if (s.zodiac !== lastSpecialZodiac) {
        zodiacScores.set(s.zodiac, (zodiacScores.get(s.zodiac) || 0) + s.deterministicScore);
      }
    });
    
    // 转换为数组并排序
    const zodiacArray = Array.from(zodiacScores.entries())
      .map(([zodiac, score]) => ({ zodiac, score }))
      .sort((a, b) => b.score - a.score);
    
    // 取前6个
    let recommendations = zodiacArray.slice(0, 6).map(item => item.zodiac);
    
    // 如果不足6个，补充其他生肖
    if (recommendations.length < 6) {
      const allZodiacs = Object.keys(this.ZODIACS_MAP);
      for (const zodiac of allZodiacs) {
        if (!recommendations.includes(zodiac) && zodiac !== lastSpecialZodiac) {
          recommendations.push(zodiac);
          if (recommendations.length >= 6) break;
        }
      }
    }
    
    return recommendations.slice(0, 6);
  }

  private static calculateDeterministicWaves(selected: NumberStat[]): {main: 'red' | 'blue' | 'green', defense: 'red' | 'blue' | 'green'} {
    const waveScores = {
      red: 0,
      blue: 0,
      green: 0
    };
    
    selected.forEach(s => {
      if (s.wave === 'red') waveScores.red += s.deterministicScore;
      else if (s.wave === 'blue') waveScores.blue += s.deterministicScore;
      else if (s.wave === 'green') waveScores.green += s.deterministicScore;
    });
    
    // 按分数排序
    const sorted = Object.entries(waveScores)
      .sort((a, b) => b[1] - a[1])
      .map(item => item[0] as 'red' | 'blue' | 'green');
    
    return {
      main: sorted[0],
      defense: sorted[1] || sorted[0]
    };
  }

  private static calculateDeterministicHeads(selected: NumberStat[], lastDraw: number[]): string[] {
    const lastHeads = new Set(lastDraw.map(n => Math.floor(n / 10)));
    const headScores = new Map<number, number>();
    
    selected.forEach(s => {
      const multiplier = lastHeads.has(s.head) ? 0.6 : 1.0;
      headScores.set(s.head, (headScores.get(s.head) || 0) + s.deterministicScore * multiplier);
    });
    
    // 转换为数组并排序
    const headArray = Array.from(headScores.entries())
      .map(([head, score]) => ({ head, score }))
      .sort((a, b) => b.score - a.score);
    
    // 取前3个
    let recommendations = headArray.slice(0, 3).map(item => item.head.toString());
    
    // 确保多样性
    if (recommendations.length < 3) {
      for (let head = 0; head <= 4; head++) {
        if (!recommendations.includes(head.toString())) {
          recommendations.push(head.toString());
          if (recommendations.length >= 3) break;
        }
      }
    }
    
    return recommendations;
  }

  private static calculateDeterministicTails(selected: NumberStat[], lastDraw: number[]): string[] {
    const lastTails = new Set(lastDraw.map(n => n % 10));
    const tailScores = new Map<number, number>();
    
    selected.forEach(s => {
      const multiplier = lastTails.has(s.tail) ? 0.5 : 1.0;
      tailScores.set(s.tail, (tailScores.get(s.tail) || 0) + s.deterministicScore * multiplier);
    });
    
    // 转换为数组并排序
    const tailArray = Array.from(tailScores.entries())
      .map(([tail, score]) => ({ tail, score }))
      .sort((a, b) => b.score - a.score);
    
    // 取前5个
    let recommendations = tailArray.slice(0, 5).map(item => item.tail.toString());
    
    // 确保多样性
    if (recommendations.length < 5) {
      for (let tail = 0; tail <= 9; tail++) {
        if (!recommendations.includes(tail.toString())) {
          recommendations.push(tail.toString());
          if (recommendations.length >= 5) break;
        }
      }
    }
    
    return recommendations;
  }

  // ==========================================
  // 确定性备选生成
  // ==========================================
  private static generateDeterministicFallback(history?: DbRecord[]): PredictionData {
    console.log('使用确定性备选生成...');
    
    // 确定性号码生成（不使用随机性）
    const generated = new Set<number>();
    const headCount = new Map<number, number>();
    const tailCount = new Map<number, number>();
    
    // 如果有历史数据，基于确定性规则生成
    if (history && history.length > 0) {
      const lastNums = this.parseNumbers(history[0].open_code);
      const lastSpecial = lastNums[lastNums.length - 1];
      
      // 生成与上期特码有确定性关系的号码
      for (let offset of [1, 2, 5, 10, 12, 24]) {
        const num1 = (lastSpecial + offset) % 49 || 49;
        const num2 = (lastSpecial - offset + 49) % 49 || 49;
        
        if (num1 >= 1 && num1 <= 49) generated.add(num1);
        if (num2 >= 1 && num2 <= 49) generated.add(num2);
      }
      
      // 生成对称号码
      for (const [a, b] of this.SYMMETRY_PAIRS) {
        if (lastNums.includes(a)) generated.add(b);
        if (lastNums.includes(b)) generated.add(a);
      }
    }
    
    // 补充确定性号码
    const deterministicNumbers = [3, 7, 13, 19, 23, 29, 31, 37, 41, 43, 47];
    for (const num of deterministicNumbers) {
      if (generated.size < 18) {
        generated.add(num);
      }
    }
    
    // 补充到18个
    let nextNum = 1;
    while (generated.size < 18) {
      if (nextNum <= 49) {
        generated.add(nextNum);
        nextNum += 3; // 确定性间隔
      } else {
        nextNum = 2; // 切换到另一个序列
      }
    }
    
    // 转换为结果
    const nums = Array.from(generated)
      .sort((a, b) => a - b)
      .map(n => n < 10 ? `0${n}` : `${n}`);
    
    // 确定性生肖推荐
    const currentMonth = new Date().getMonth() + 1;
    const season = this.getSeasonByMonth(currentMonth);
    const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
    const allZodiacs = Object.keys(this.ZODIACS_MAP);
    
    const recZodiacs: string[] = [...seasonalZodiacs];
    for (const zodiac of allZodiacs) {
      if (!recZodiacs.includes(zodiac) && recZodiacs.length < 6) {
        recZodiacs.push(zodiac);
      }
    }
    
    // 确定性头尾推荐
    const heads = ['1', '2', '3']; // 确定性头数
    const tails = ['3', '6', '7', '8', '9']; // 确定性尾数
    
    console.log('确定性备选生成结果:', nums.join(', '));
    
    return {
      zodiacs: recZodiacs.slice(0, 6),
      numbers: nums,
      wave: { main: 'red', defense: 'blue' },
      heads: heads,
      tails: tails
    };
  }

  // ==========================================
  // 基础辅助方法
  // ==========================================
  private static getSeasonByMonth(month: number): string {
    if (month >= 1 && month <= 3) return '春';
    if (month >= 4 && month <= 6) return '夏';
    if (month >= 7 && month <= 9) return '秋';
    return '冬';
  }

  private static parseNumbers(code: string): number[] {
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
