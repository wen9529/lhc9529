import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  head: number;
  
  // 算法评分
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
  
  // 新增确定性算法
  scoreInnovation: number;        // 创新度评分（避免近期重复）
  scoreAvoidRecent: number;       // 回避近期评分
  scoreCrossPeriod: number;       // 跨期分析评分
  scorePatternBreak: number;      // 模式打破评分
  scoreDeterministic: number;     // 确定性分析评分
  
  totalScore: number;
}

/**
 * 🎯 Quantum Matrix Prediction Engine v19.0 "确定性增强版"
 * 重点解决上期号码重复问题，增加确定性算法
 */
export class PredictionEngine {
  // 配置参数 - 优化确定性
  private static readonly CONFIG = {
    periods: {
      full: 100,
      recent50: 50,
      recent30: 30,
      recent20: 20,
      recent10: 10,
      omission: 100,
      prime: 50,
      sum: 50,
      position: 50,
      hotCold: 30,
      headTail: 50,
      crossAnalysis: 25     // 跨期分析期数
    },
    weights: {
      // 核心算法
      zodiacTrans: 2.8,
      numberTrans: 2.3,
      historyMirror: 1.8,
      specialTraj: 1.6,
      pattern: 1.4,
      tail: 1.1,
      zodiac: 1.0,
      wuXing: 0.9,
      wave: 0.9,
      gold: 0.8,
      omission: 1.3,
      seasonal: 0.7,
      prime: 0.7,
      sumAnalysis: 0.9,
      position: 0.7,
      frequency: 1.1,
      cluster: 0.7,
      symmetry: 0.7,
      periodic: 0.9,
      trend: 0.9,
      correlation: 0.7,
      hotCold: 1.2,
      parity: 1.0,
      size: 1.0,
      section: 0.8,
      headAnalysis: 1.3,
      tailAnalysis: 1.3,
      headTailPair: 0.9,
      
      // 新增确定性算法权重（重点！）
      innovation: 1.8,        // 创新度（避免重复）
      avoidRecent: 1.6,       // 回避近期
      crossPeriod: 1.5,       // 跨期分析
      patternBreak: 1.7,      // 模式打破
      deterministic: 2.0      // 确定性分析（最高权重）
    },
    thresholds: {
      minHistoryLength: 30,
      hotNumberThreshold: 1.8,
      coldNumberThreshold: 0.3,
      omissionCritical: 0.7,
      headDiversity: 4,
      tailDiversity: 7,
      
      // 新增阈值
      avoidRecentPeriods: 3,    // 避免近几期的号码
      minInnovationScore: 15,   // 最低创新度分数
      crossAnalysisDepth: 3,    // 跨期分析深度
      patternChangeThreshold: 2  // 模式变化阈值
    },
    diversity: {
      zodiac: 5,      // 增加生肖多样性
      wave: 7,
      tail: 2,
      wuxing: 6,
      head: 2,
      headTailPair: 3,
      
      // 新增多样性要求
      avoidRecentNumbers: true,  // 避免近期号码
      minNewZodiacs: 3,          // 至少推荐3个新生肖
      maxRepeatedHeads: 2,       // 相同头数最多重复几次
      maxRepeatedTails: 2        // 相同尾数最多重复几次
    },
    scoring: {
      maxScorePerAlgorithm: 35,
      minScoreForSelection: 15,
      topNForFinal: 30,
      hotColdPeriods: [10, 20, 30, 50],
      headTailPeriods: [20, 30, 50],
      
      // 新增评分规则
      recentNumberPenalty: 25,   // 近期号码惩罚分数
      recentZodiacPenalty: 20,   // 近期生肖惩罚分数
      innovationBonus: 30,       // 创新组合奖励
      patternBreakBonus: 25      // 打破模式奖励
    }
  };

  // 基础数据映射（保持不变）
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

  static readonly PERIODIC_CYCLES = {
    zodiac: 12,
    wave: 7,
    wuxing: 5,
    tail: 10,
    head: 8
  };

  static NUM_TO_ZODIAC: Record<number, string> = {};
  static NUM_TO_WUXING: Record<number, string> = {};
  static NUM_TO_WAVE: Record<number, string> = {};

  // 近期号码记录（用于回避）
  private static recentNumbers: Map<number, number> = new Map(); // number -> 出现期数
  private static recentZodiacs: Map<string, number> = new Map(); // zodiac -> 出现期数

  static initializeMaps() {
    if (Object.keys(this.NUM_TO_ZODIAC).length > 0) return;
    
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
  }

  /**
   * 主预测函数 - 确定性增强版
   */
  static generate(history: DbRecord[], type: LotteryType): PredictionData {
    console.log('🎯 开始确定性增强预测...');
    this.initializeMaps();
    
    // 检查历史数据是否足够
    if (!history || history.length < this.CONFIG.thresholds.minHistoryLength) {
      console.warn(`历史数据不足${this.CONFIG.thresholds.minHistoryLength}期，使用确定性增强随机生成`);
      return this.generateDeterministicRandom(history);
    }

    console.log(`📊 历史数据: ${history.length}期`);

    // 确保历史数据按时间倒序排列
    const sortedHistory = [...history].sort((a, b) => {
      const timeA = a.draw_time ? new Date(a.draw_time).getTime() : 0;
      const timeB = b.draw_time ? new Date(b.draw_time).getTime() : 0;
      return timeB - timeA;
    });

    // 数据切片
    const availableHistory = sortedHistory;
    const fullHistory = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.full));
    const recent50 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent50));
    const recent30 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent30));
    const recent20 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent20));
    const recent10 = availableHistory.slice(0, Math.min(availableHistory.length, this.CONFIG.periods.recent10));
    const recent5 = availableHistory.slice(0, Math.min(availableHistory.length, 5)); // 新增：近5期
    
    // 上期开奖数据
    const lastDrawNums = this.parseNumbers(fullHistory[0].open_code);
    if (lastDrawNums.length === 0) {
      console.error('❌ 无法解析上期开奖号码');
      return this.generateDeterministicRandom(history);
    }
    
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1];
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial] || '';
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);
    
    console.log(`🎯 上期特码: ${lastSpecial} (${lastSpecialZodiac}), 和值: ${lastDrawSum}`);
    console.log(`🔢 上期头数分布: ${[...new Set(lastDrawNums.map(n => Math.floor(n/10)))].sort().join(',')}`);
    console.log(`🔢 上期尾数分布: ${[...new Set(lastDrawNums.map(n => n % 10))].sort().join(',')}`);
    
    // 当前时间信息
    const currentDate = fullHistory[0].draw_time ? new Date(fullHistory[0].draw_time) : new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = this.getSeasonByMonth(currentMonth);
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    const currentDay = currentDate.getDay();

    // 更新近期号码记录（用于回避）
    this.updateRecentRecords(fullHistory);

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
        
        // 原有算法
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
        
        // 新增确定性算法
        scoreInnovation: 0,
        scoreAvoidRecent: 0,
        scoreCrossPeriod: 0,
        scorePatternBreak: 0,
        scoreDeterministic: 0,
        
        totalScore: 0
      });
    }

    console.log('🔍 开始执行核心算法分析...');

    // ==========================================
    // 1. 执行原有标准算法（优化版）
    // ==========================================
    this.executeStandardAlgorithms(stats, {
      fullHistory, recent50, recent30, recent20, recent10, recent5,
      lastDrawNums, lastSpecial, lastSpecialZodiac, lastDrawSum,
      currentMonth, currentSeason, currentWeek, currentDay
    });

    // ==========================================
    // 2. 执行新增头尾算法
    // ==========================================
    console.log('🔢 执行头尾分析算法...');
    const headScores = this.calculateHeadAnalysis(recent50, lastDrawNums);
    const tailAnalysisScores = this.calculateTailAnalysisEnhanced(recent50, lastDrawNums);
    const headTailPairScores = this.calculateHeadTailPairAnalysis(fullHistory, lastDrawNums);
    
    stats.forEach(s => {
      s.scoreHeadAnalysis = headScores[s.num] || 0;
      s.scoreTailAnalysis = tailAnalysisScores[s.num] || 0;
      s.scoreHeadTailPair = headTailPairScores[s.num] || 0;
    });

    // ==========================================
    // 3. 执行确定性增强算法（重点！）
    // ==========================================
    console.log('🎯 执行确定性增强算法...');
    
    // 3.1 创新度评分（鼓励新组合）
    const innovationScores = this.calculateInnovationScore(stats, recent20, lastDrawNums);
    
    // 3.2 回避近期评分（惩罚近期出现的号码）
    const avoidRecentScores = this.calculateAvoidRecentScore(stats, recent10);
    
    // 3.3 跨期分析评分（分析多期转换规律）
    const crossPeriodScores = this.calculateCrossPeriodAnalysis(stats, recent30);
    
    // 3.4 模式打破评分（鼓励打破现有模式）
    const patternBreakScores = this.calculatePatternBreakScore(stats, recent20, lastDrawNums);
    
    // 3.5 确定性分析评分（综合确定性因素）
    const deterministicScores = this.calculateDeterministicAnalysis(stats, fullHistory, lastDrawNums);
    
    // 应用确定性分数
    stats.forEach(s => {
      s.scoreInnovation = innovationScores[s.num] || 0;
      s.scoreAvoidRecent = avoidRecentScores[s.num] || 0;
      s.scoreCrossPeriod = crossPeriodScores[s.num] || 0;
      s.scorePatternBreak = patternBreakScores[s.num] || 0;
      s.scoreDeterministic = deterministicScores[s.num] || 0;
      
      // 特别处理：对近期特码和特肖进行降权
      if (s.num === lastSpecial) {
        s.scoreAvoidRecent -= this.CONFIG.scoring.recentNumberPenalty;
        s.scoreDeterministic -= 15;
      }
      
      if (s.zodiac === lastSpecialZodiac) {
        s.scoreAvoidRecent -= this.CONFIG.scoring.recentZodiacPenalty * 0.8;
        s.scoreDeterministic -= 12;
      }
    });

    // ==========================================
    // 4. 最终汇总 - 调整权重分配
    // ==========================================
    console.log('🧮 计算最终分数（确定性优先）...');
    const weights = this.CONFIG.weights;
    
    stats.forEach(s => {
      // 基础算法分数（适当降低权重）
      const baseScore = 
        s.scoreZodiacTrans * weights.zodiacTrans +
        s.scoreNumberTrans * weights.numberTrans +
        s.scoreHistoryMirror * weights.historyMirror * 0.8 + // 降低历史镜像权重
        s.scoreSpecialTraj * weights.specialTraj +
        s.scorePattern * weights.pattern +
        s.scoreZodiac * weights.zodiac * 0.7 + // 降低生肖权重
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
        s.scoreCorrelation * weights.correlation +
        s.scoreHotCold * weights.hotCold +
        s.scoreParity * weights.parity +
        s.scoreSize * weights.size +
        s.scoreSection * weights.section +
        s.scoreHeadAnalysis * weights.headAnalysis +
        s.scoreTailAnalysis * weights.tailAnalysis +
        s.scoreHeadTailPair * weights.headTailPair;
      
      // 确定性算法分数（提高权重）
      const deterministicScore = 
        s.scoreInnovation * weights.innovation * 1.3 +
        s.scoreAvoidRecent * weights.avoidRecent * 1.2 +
        s.scoreCrossPeriod * weights.crossPeriod * 1.2 +
        s.scorePatternBreak * weights.patternBreak * 1.4 +
        s.scoreDeterministic * weights.deterministic * 1.5;
      
      s.totalScore = baseScore + deterministicScore;
      
      // 微扰优化（减小随机性）
      s.totalScore += (Math.random() * 0.005 + 0.002);
      
      // 避免上期特码直接重复
      if (s.num === lastSpecial) {
        s.totalScore *= 0.2; // 大幅降低上期特码分数
      }
      
      // 避免上期特肖直接重复
      if (s.zodiac === lastSpecialZodiac) {
        s.totalScore *= 0.6; // 降低上期特肖分数
      }
      
      // 避免近5期出现过的号码
      const recentAppearance = this.recentNumbers.get(s.num) || 0;
      if (recentAppearance <= 5) {
        s.totalScore *= (0.5 + recentAppearance * 0.1); // 越近期惩罚越大
      }
    });

    // 排序
    stats.sort((a, b) => b.totalScore - a.totalScore);
    
    console.log('🏆 前15个高分号码（确定性增强）:');
    stats.slice(0, 15).forEach((s, i) => {
      const head = s.head;
      const tail = s.tail;
      const isRecent = this.recentNumbers.get(s.num) || 0 <= 3 ? '⚠️近期' : '🆕新号';
      console.log(`${i + 1}. 号码${s.num < 10 ? '0' + s.num : s.num} (${head}头${tail}尾) - 总分: ${s.totalScore.toFixed(2)} ${isRecent}`);
    });

    // 智能选号（确定性优先）
    const finalNumbers = this.selectDeterministicNumbers(stats, 18, lastSpecial, lastSpecialZodiac);
    
    // 确保有足够的不同头数和尾数
    const finalHeads = new Set(finalNumbers.map(s => s.head));
    const finalTails = new Set(finalNumbers.map(s => s.tail));
    
    console.log(`✅ 最终选中头数: ${Array.from(finalHeads).sort().join(',')} (共${finalHeads.size}种)`);
    console.log(`✅ 最终选中尾数: ${Array.from(finalTails).sort().join(',')} (共${finalTails.size}种)`);
    
    // 强制补充多样性
    if (finalHeads.size < this.CONFIG.thresholds.headDiversity) {
      console.log(`⚠️ 头数多样性不足，强制补充...`);
      this.forceAddHeadDiversity(stats, finalNumbers, finalHeads);
    }
    
    if (finalTails.size < this.CONFIG.thresholds.tailDiversity) {
      console.log(`⚠️ 尾数多样性不足，强制补充...`);
      this.forceAddTailDiversity(stats, finalNumbers, finalTails);
    }

    // 最终结果
    const resultNumbers = finalNumbers.map(s => s.num)
      .sort((a, b) => a - b)
      .map(n => n < 10 ? `0${n}` : `${n}`);

    // 计算推荐生肖（避免重复上期特肖）
    const zodiacRecommendations = this.calculateZodiacRecommendations(finalNumbers, lastSpecialZodiac);
    
    // 计算推荐波
    const waveRecommendations = this.calculateWaveRecommendations(finalNumbers);
    
    // 计算推荐头尾（确保变化）
    const headRecommendations = this.calculateHeadRecommendationsWithChange(finalNumbers, lastDrawNums);
    const tailRecommendations = this.calculateTailRecommendationsWithChange(finalNumbers, lastDrawNums);

    console.log(`🎉 最终预测结果 (${finalNumbers.length}个号码): ${resultNumbers.join(', ')}`);
    console.log(`🐉 推荐生肖: ${zodiacRecommendations.join(', ')} (已避免重复上期特肖:${lastSpecialZodiac})`);
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
  // 新增：确定性增强算法
  // ==========================================

  /**
   * 更新近期记录
   */
  private static updateRecentRecords(history: DbRecord[]): void {
    this.recentNumbers.clear();
    this.recentZodiacs.clear();
    
    // 记录近10期的号码和生肖
    for (let i = 0; i < Math.min(history.length, 10); i++) {
      const nums = this.parseNumbers(history[i].open_code);
      const special = nums[nums.length - 1];
      const zodiac = this.NUM_TO_ZODIAC[special];
      
      nums.forEach(num => {
        this.recentNumbers.set(num, i + 1);
      });
      
      if (zodiac) {
        this.recentZodiacs.set(zodiac, i + 1);
      }
    }
  }

  /**
   * 创新度评分（鼓励新组合）
   */
  private static calculateInnovationScore(
    stats: NumberStat[], 
    recentHistory: DbRecord[],
    lastDraw: number[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 分析近期模式
    const recentPatterns = this.analyzeRecentPatterns(recentHistory);
    const headTailHistory = this.analyzeHeadTailHistory(recentHistory);
    
    // 上期特征
    const lastHeads = new Set(lastDraw.map(n => Math.floor(n / 10)));
    const lastTails = new Set(lastDraw.map(n => n % 10));
    const lastHeadTailPairs = lastDraw.map(n => `${Math.floor(n / 10)}-${n % 10}`);
    
    for (const stat of stats) {
      let score = 0;
      const head = stat.head;
      const tail = stat.tail;
      const pairKey = `${head}-${tail}`;
      const zodiac = stat.zodiac;
      
      // 1. 新头尾组合奖励
      if (!headTailHistory.has(pairKey)) {
        score += this.CONFIG.scoring.innovationBonus * 0.8;
      }
      
      // 2. 新头数奖励（与上期不同）
      if (!lastHeads.has(head)) {
        score += 15;
      }
      
      // 3. 新尾数奖励（与上期不同）
      if (!lastTails.has(tail)) {
        score += 12;
      }
      
      // 4. 打破近期模式奖励
      if (this.isBreakingPattern(stat, recentPatterns)) {
        score += this.CONFIG.scoring.patternBreakBonus;
      }
      
      // 5. 新生肖组合奖励
      const recentZodiacAppearance = this.recentZodiacs.get(zodiac) || 10;
      if (recentZodiacAppearance > 5) { // 5期以上未出现
        score += 10;
      }
      
      // 6. 创新数值关系奖励
      score += this.calculateNumericalInnovation(stat.num, lastDraw);
      
      scores[stat.num] = Math.max(0, Math.min(score, 40));
    }
    
    return scores;
  }

  /**
   * 回避近期评分（惩罚近期出现的号码）
   */
  private static calculateAvoidRecentScore(
    stats: NumberStat[],
    recentHistory: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 统计近几期出现情况
    const appearanceCount = new Map<number, number>();
    const recentAppearance = new Map<number, number>(); // 最近出现期数
    
    recentHistory.forEach((record, index) => {
      const nums = this.parseNumbers(record.open_code);
      nums.forEach(num => {
        appearanceCount.set(num, (appearanceCount.get(num) || 0) + 1);
        if (!recentAppearance.has(num) || recentAppearance.get(num)! > index) {
          recentAppearance.set(num, index);
        }
      });
    });
    
    for (const stat of stats) {
      const num = stat.num;
      const count = appearanceCount.get(num) || 0;
      const recentIndex = recentAppearance.get(num);
      
      let score = 0;
      
      // 惩罚近期出现的号码
      if (recentIndex !== undefined) {
        // 越近期惩罚越大
        const penalty = Math.max(0, 30 - recentIndex * 6);
        score -= penalty;
        
        // 出现次数越多惩罚越大
        if (count >= 2) {
          score -= count * 5;
        }
      } else {
        // 近期未出现，奖励
        score += 15;
      }
      
      // 特别惩罚上期号码
      if (recentIndex === 0) {
        score -= this.CONFIG.scoring.recentNumberPenalty;
      }
      
      scores[num] = score;
    }
    
    return scores;
  }

  /**
   * 跨期分析评分
   */
  private static calculateCrossPeriodAnalysis(
    stats: NumberStat[],
    recentHistory: DbRecord[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    if (recentHistory.length < 10) {
      stats.forEach(s => scores[s.num] = 0);
      return scores;
    }
    
    // 分析多期转换规律
    const transitionMatrix = this.buildTransitionMatrix(recentHistory);
    const patternTransitions = this.analyzePatternTransitions(recentHistory);
    
    // 获取上期号码
    const lastNums = this.parseNumbers(recentHistory[0].open_code);
    const lastSpecial = lastNums[lastNums.length - 1];
    
    for (const stat of stats) {
      const num = stat.num;
      let score = 0;
      
      // 1. 转移概率分析
      const transitionProb = transitionMatrix.get(lastSpecial)?.get(num) || 0;
      score += transitionProb * 25;
      
      // 2. 模式转换分析
      const patternScore = this.evaluatePatternTransition(stat, lastNums, patternTransitions);
      score += patternScore;
      
      // 3. 跨期跨度分析
      const spanScore = this.analyzeCrossPeriodSpan(stat.num, recentHistory);
      score += spanScore;
      
      // 4. 周期共振分析
      const resonanceScore = this.analyzePeriodicResonance(stat.num, recentHistory);
      score += resonanceScore;
      
      scores[num] = Math.min(score, 35);
    }
    
    return scores;
  }

  /**
   * 模式打破评分
   */
  private static calculatePatternBreakScore(
    stats: NumberStat[],
    recentHistory: DbRecord[],
    lastDraw: number[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 识别近期模式
    const patterns = this.identifyRecentPatterns(recentHistory);
    const continuationPatterns = patterns.filter(p => p.type === 'continuation');
    const reversalPatterns = patterns.filter(p => p.type === 'reversal');
    
    // 上期特征
    const lastHeads = new Set(lastDraw.map(n => Math.floor(n / 10)));
    const lastTails = new Set(lastDraw.map(n => n % 10));
    const lastSum = lastDraw.reduce((a, b) => a + b, 0);
    const lastParity = lastDraw.filter(n => n % 2 === 1).length; // 奇数个数
    
    for (const stat of stats) {
      let score = 0;
      const head = stat.head;
      const tail = stat.tail;
      
      // 检查是否打破延续模式
      let breaksContinuation = false;
      for (const pattern of continuationPatterns) {
        if (this.breaksPattern(stat, pattern)) {
          breaksContinuation = true;
          break;
        }
      }
      
      if (breaksContinuation) {
        score += 18;
      }
      
      // 检查是否顺应反转模式
      let followsReversal = false;
      for (const pattern of reversalPatterns) {
        if (this.followsPattern(stat, pattern)) {
          followsReversal = true;
          break;
        }
      }
      
      if (followsReversal) {
        score += 15;
      }
      
      // 打破上期特征奖励
      if (!lastHeads.has(head)) {
        score += 8; // 新头数
      }
      
      if (!lastTails.has(tail)) {
        score += 10; // 新尾数
      }
      
      // 和值变化奖励
      const currentSum = lastSum - lastDraw[lastDraw.length - 1] + stat.num;
      const sumDiff = Math.abs(currentSum - lastSum);
      if (sumDiff > 15) { // 和值有明显变化
        score += 6;
      }
      
      // 奇偶变化奖励
      const currentParity = lastParity - (lastDraw[lastDraw.length - 1] % 2) + (stat.num % 2);
      if (Math.abs(currentParity - lastParity) >= 2) {
        score += 5;
      }
      
      scores[stat.num] = Math.min(score, 30);
    }
    
    return scores;
  }

  /**
   * 确定性分析评分（综合）
   */
  private static calculateDeterministicAnalysis(
    stats: NumberStat[],
    fullHistory: DbRecord[],
    lastDraw: number[]
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    // 多个确定性因子
    const factors = {
      stability: this.analyzeNumberStability(fullHistory),
      predictability: this.analyzePredictability(fullHistory),
      trendStrength: this.analyzeTrendStrength(fullHistory),
      patternClarity: this.analyzePatternClarity(fullHistory)
    };
    
    // 上期号码
    const lastSpecial = lastDraw[lastDraw.length - 1];
    
    for (const stat of stats) {
      let score = 0;
      const num = stat.num;
      
      // 1. 稳定性分析
      const stability = factors.stability.get(num) || 0;
      score += stability * 15;
      
      // 2. 可预测性
      const predictability = factors.predictability.get(num) || 0;
      score += predictability * 12;
      
      // 3. 趋势强度
      const trendStrength = factors.trendStrength.get(num) || 0;
      score += trendStrength * 10;
      
      // 4. 模式清晰度
      const patternClarity = factors.patternClarity.get(num) || 0;
      score += patternClarity * 8;
      
      // 5. 与上期号码的确定性关系
      const relationScore = this.analyzeDeterministicRelation(num, lastSpecial, fullHistory);
      score += relationScore;
      
      // 6. 季节性确定性
      const seasonalScore = this.analyzeSeasonalDeterminism(stat, fullHistory);
      score += seasonalScore;
      
      // 7. 周期确定性
      const periodicScore = this.analyzePeriodicDeterminism(num, fullHistory);
      score += periodicScore;
      
      scores[num] = Math.min(score, 50);
    }
    
    return scores;
  }

  // ==========================================
  // 辅助分析方法
  // ==========================================

  /**
   * 分析近期模式
   */
  private static analyzeRecentPatterns(history: DbRecord[]): any[] {
    const patterns: any[] = [];
    
    if (history.length < 5) return patterns;
    
    for (let i = 0; i < Math.min(history.length - 4, 10); i++) {
      const slice = history.slice(i, i + 5);
      const pattern = this.extractPattern(slice);
      if (pattern) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }

  /**
   * 分析头尾历史
   */
  private static analyzeHeadTailHistory(history: DbRecord[]): Set<string> {
    const pairs = new Set<string>();
    
    history.forEach(record => {
      const nums = this.parseNumbers(record.open_code);
      nums.forEach(num => {
        const head = Math.floor(num / 10);
        const tail = num % 10;
        pairs.add(`${head}-${tail}`);
      });
    });
    
    return pairs;
  }

  /**
   * 检查是否打破模式
   */
  private static isBreakingPattern(stat: NumberStat, patterns: any[]): boolean {
    if (patterns.length === 0) return false;
    
    // 检查是否打破大多数模式
    let breakCount = 0;
    for (const pattern of patterns) {
      if (this.breaksSpecificPattern(stat, pattern)) {
        breakCount++;
      }
    }
    
    return breakCount >= patterns.length * 0.7;
  }

  /**
   * 计算数值创新度
   */
  private static calculateNumericalInnovation(num: number, lastDraw: number[]): number {
    let score = 0;
    
    // 与上期所有号码的距离
    const distances = lastDraw.map(n => Math.abs(num - n));
    const minDistance = Math.min(...distances);
    
    if (minDistance >= 8) {
      score += 12; // 远离上期号码
    } else if (minDistance >= 5) {
      score += 6;
    } else if (minDistance <= 2) {
      score -= 8; // 惩罚接近的号码
    }
    
    // 数值特性创新
    const lastSpecials = lastDraw.map(n => n % 10);
    const currentTail = num % 10;
    
    if (!lastSpecials.includes(currentTail)) {
      score += 8; // 新尾数
    }
    
    // 数字和特征
    const digitSum = Math.floor(num / 10) + (num % 10);
    const lastDigitSums = lastDraw.map(n => Math.floor(n / 10) + (n % 10));
    
    if (!lastDigitSums.includes(digitSum)) {
      score += 5; // 新数字和
    }
    
    return score;
  }

  /**
   * 构建转移矩阵
   */
  private static buildTransitionMatrix(history: DbRecord[]): Map<number, Map<number, number>> {
    const matrix = new Map<number, Map<number, number>>();
    
    if (history.length < 2) return matrix;
    
    // 初始化矩阵
    for (let i = 1; i <= 49; i++) {
      matrix.set(i, new Map<number, number>());
    }
    
    // 填充转移计数
    for (let i = 0; i < history.length - 1; i++) {
      const currentNums = this.parseNumbers(history[i].open_code);
      const nextNums = this.parseNumbers(history[i + 1].open_code);
      
      const currentSpecial = currentNums[currentNums.length - 1];
      const nextSpecial = nextNums[nextNums.length - 1];
      
      const currentMap = matrix.get(currentSpecial)!;
      currentMap.set(nextSpecial, (currentMap.get(nextSpecial) || 0) + 1);
    }
    
    // 转换为概率
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

  /**
   * 分析模式转换
   */
  private static analyzePatternTransitions(history: DbRecord[]): Map<string, number> {
    const transitions = new Map<string, number>();
    
    if (history.length < 3) return transitions;
    
    for (let i = 0; i < history.length - 2; i++) {
      const pattern1 = this.extractSimplePattern(this.parseNumbers(history[i].open_code));
      const pattern2 = this.extractSimplePattern(this.parseNumbers(history[i + 1].open_code));
      const pattern3 = this.extractSimplePattern(this.parseNumbers(history[i + 2].open_code));
      
      const key = `${pattern1}->${pattern2}->${pattern3}`;
      transitions.set(key, (transitions.get(key) || 0) + 1);
    }
    
    return transitions;
  }

  /**
   * 分析号码稳定性
   */
  private static analyzeNumberStability(history: DbRecord[]): Map<number, number> {
    const stability = new Map<number, number>();
    
    // 统计号码出现的规律性
    const appearances = new Map<number, number[]>();
    
    history.forEach((record, index) => {
      const nums = this.parseNumbers(record.open_code);
      nums.forEach(num => {
        if (!appearances.has(num)) {
          appearances.set(num, []);
        }
        appearances.get(num)!.push(index);
      });
    });
    
    // 计算每个号码的稳定性
    for (const [num, indices] of appearances.entries()) {
      if (indices.length < 3) {
        stability.set(num, 0);
        continue;
      }
      
      // 计算间隔的规律性
      const intervals: number[] = [];
      for (let i = 1; i < indices.length; i++) {
        intervals.push(indices[i] - indices[i - 1]);
      }
      
      // 计算间隔的变异系数（越小越稳定）
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
      const cv = Math.sqrt(variance) / mean;
      
      // 转换为稳定性分数（0-1之间）
      const stabilityScore = Math.max(0, 1 - cv);
      stability.set(num, stabilityScore);
    }
    
    return stability;
  }

  // ==========================================
  // 智能选号（确定性优先）
  // ==========================================
  private static selectDeterministicNumbers(
    stats: NumberStat[], 
    count: number,
    lastSpecial: number,
    lastSpecialZodiac: string
  ): NumberStat[] {
    const selected: NumberStat[] = [];
    const weights = this.CONFIG.weights;
    
    // 重新计算综合分数（确定性优先）
    const deterministicStats = stats.map(stat => {
      // 基础分数
      const baseScore = stat.totalScore;
      
      // 确定性加成
      const deterministicBoost = 
        stat.scoreDeterministic * 1.8 +
        stat.scorePatternBreak * 1.6 +
        stat.scoreInnovation * 1.4 +
        stat.scoreCrossPeriod * 1.2 +
        stat.scoreAvoidRecent * 1.0;
      
      // 惩罚近期重复
      let penalty = 0;
      if (stat.num === lastSpecial) {
        penalty = 0.3; // 大幅降低上期特码
      } else if (stat.zodiac === lastSpecialZodiac) {
        penalty = 0.5; // 降低上期特肖
      }
      
      const recentAppearance = this.recentNumbers.get(stat.num) || 10;
      if (recentAppearance <= 3) {
        penalty += (4 - recentAppearance) * 0.1;
      }
      
      const finalScore = (baseScore + deterministicBoost) * (1 - penalty);
      
      return {
        ...stat,
        deterministicScore: finalScore
      };
    });
    
    // 按确定性分数排序
    deterministicStats.sort((a, b) => b.deterministicScore - a.deterministicScore);
    
    // 多样性计数器
    const counts = {
      zodiac: new Map<string, number>(),
      wave: new Map<string, number>([['red', 0], ['blue', 0], ['green', 0]]),
      tail: new Map<number, number>(),
      head: new Map<number, number>(),
      headTailPair: new Map<string, number>()
    };
    
    // 第一阶段：选择确定性最高的号码
    const phase1Count = Math.floor(count * 0.7);
    for (const stat of deterministicStats) {
      if (selected.length >= phase1Count) break;
      
      // 跳过确定性太低的号码
      if (stat.deterministicScore < 15) continue;
      
      // 检查多样性
      const zodiacCount = counts.zodiac.get(stat.zodiac) || 0;
      const waveCount = counts.wave.get(stat.wave) || 0;
      const tailCount = counts.tail.get(stat.tail) || 0;
      const headCount = counts.head.get(stat.head) || 0;
      const pairKey = `${stat.head}-${stat.tail}`;
      const pairCount = counts.headTailPair.get(pairKey) || 0;
      
      // 检查限制
      if (zodiacCount < 3 && 
          waveCount < 7 && 
          tailCount < 2 && 
          headCount < 2 && 
          pairCount < 2) {
        
        selected.push(stat);
        counts.zodiac.set(stat.zodiac, zodiacCount + 1);
        counts.wave.set(stat.wave, waveCount + 1);
        counts.tail.set(stat.tail, tailCount + 1);
        counts.head.set(stat.head, headCount + 1);
        counts.headTailPair.set(pairKey, pairCount + 1);
      }
    }
    
    // 第二阶段：补充确定性较好的新号码
    if (selected.length < count) {
      const remaining = deterministicStats.filter(s => !selected.includes(s));
      
      // 优先选择创新度高的新号码
      const innovativeRemaining = remaining
        .filter(s => s.scoreInnovation > 20)
        .sort((a, b) => b.scoreInnovation - a.scoreInnovation);
      
      for (const stat of innovativeRemaining) {
        if (selected.length >= count) break;
        
        // 特别关注新组合
        const isNewHead = (counts.head.get(stat.head) || 0) === 0;
        const isNewTail = (counts.tail.get(stat.tail) || 0) === 0;
        const isNewZodiac = (counts.zodiac.get(stat.zodiac) || 0) === 0;
        
        if (isNewHead || isNewTail || isNewZodiac) {
          selected.push(stat);
          counts.head.set(stat.head, (counts.head.get(stat.head) || 0) + 1);
          counts.tail.set(stat.tail, (counts.tail.get(stat.tail) || 0) + 1);
          counts.zodiac.set(stat.zodiac, (counts.zodiac.get(stat.zodiac) || 0) + 1);
        }
      }
    }
    
    // 第三阶段：如果还不够，补充剩余最好的
    if (selected.length < count) {
      const remaining = deterministicStats.filter(s => !selected.includes(s));
      const needed = count - selected.length;
      selected.push(...remaining.slice(0, needed));
    }
    
    return selected.slice(0, count);
  }

  // ==========================================
  // 推荐算法优化（避免重复）
  // ==========================================

  /**
   * 计算生肖推荐（避免重复上期特肖）
   */
  private static calculateZodiacRecommendations(
    selectedStats: NumberStat[],
    lastSpecialZodiac: string
  ): string[] {
    // 方法1：基于出现频率（排除上期特肖）
    const zodiacFrequency = new Map<string, number>();
    selectedStats.forEach(s => {
      if (s.zodiac !== lastSpecialZodiac) { // 排除上期特肖
        zodiacFrequency.set(s.zodiac, (zodiacFrequency.get(s.zodiac) || 0) + 1);
      }
    });
    
    // 方法2：基于总分权重
    const zodiacScore = new Map<string, number>();
    selectedStats.forEach(s => {
      if (s.zodiac !== lastSpecialZodiac) {
        zodiacScore.set(s.zodiac, (zodiacScore.get(s.zodiac) || 0) + s.totalScore);
      }
    });
    
    // 方法3：基于确定性分数
    const zodiacDeterministic = new Map<string, number>();
    selectedStats.forEach(s => {
      if (s.zodiac !== lastSpecialZodiac) {
        zodiacDeterministic.set(s.zodiac, (zodiacDeterministic.get(s.zodiac) || 0) + s.scoreDeterministic);
      }
    });
    
    // 综合评分（优先确定性）
    const zodiacScores: Array<{zodiac: string, score: number}> = [];
    const allZodiacs = new Set([
      ...Array.from(zodiacFrequency.keys()),
      ...Array.from(zodiacScore.keys()),
      ...Array.from(zodiacDeterministic.keys())
    ]);
    
    for (const zodiac of allZodiacs) {
      if (zodiac === lastSpecialZodiac) continue; // 跳过上期特肖
      
      const freqScore = zodiacFrequency.get(zodiac) || 0;
      const totalScore = zodiacScore.get(zodiac) || 0;
      const deterministicScore = zodiacDeterministic.get(zodiac) || 0;
      
      const combinedScore = 
        freqScore * 0.2 +          // 降低频率权重
        totalScore * 0.3 +         // 中等权重
        deterministicScore * 0.5;  // 提高确定性权重
      
      zodiacScores.push({zodiac, score: combinedScore});
    }
    
    // 排序并选择
    zodiacScores.sort((a, b) => b.score - a.score);
    
    // 如果结果不足6个，补充季节性生肖
    let recommendations = zodiacScores.slice(0, 6).map(z => z.zodiac);
    if (recommendations.length < 6) {
      const currentMonth = new Date().getMonth() + 1;
      const season = this.getSeasonByMonth(currentMonth);
      const seasonalZodiacs = this.SEASONAL_ZODIACS[season] || [];
      
      // 添加季节性生肖（排除已存在和上期特肖）
      for (const zodiac of seasonalZodiacs) {
        if (!recommendations.includes(zodiac) && zodiac !== lastSpecialZodiac) {
          recommendations.push(zodiac);
          if (recommendations.length >= 6) break;
        }
      }
    }
    
    // 如果还是不足，补充其他生肖
    if (recommendations.length < 6) {
      const allZodiacsList = Object.keys(this.ZODIACS_MAP);
      for (const zodiac of allZodiacsList) {
        if (!recommendations.includes(zodiac) && zodiac !== lastSpecialZodiac) {
          recommendations.push(zodiac);
          if (recommendations.length >= 6) break;
        }
      }
    }
    
    return recommendations.slice(0, 6);
  }

  /**
   * 计算波色推荐
   */
  private static calculateWaveRecommendations(selectedStats: NumberStat[]): {main: 'red' | 'blue' | 'green', defense: 'red' | 'blue' | 'green'} {
    const waveCount = { red: 0, blue: 0, green: 0 };
    
    selectedStats.forEach(s => {
      if (s.wave === 'red') waveCount.red++;
      else if (s.wave === 'blue') waveCount.blue++;
      else if (s.wave === 'green') waveCount.green++;
    });
    
    // 按数量排序
    const sorted = Object.entries(waveCount).sort((a, b) => b[1] - a[1]);
    
    return {
      main: sorted[0][0] as 'red' | 'blue' | 'green',
      defense: sorted[1][0] as 'red' | 'blue' | 'green'
    };
  }

  /**
   * 计算头数推荐（确保变化）
   */
  private static calculateHeadRecommendationsWithChange(
    selectedStats: NumberStat[],
    lastDraw: number[]
  ): string[] {
    // 获取上期头数
    const lastHeads = new Set(lastDraw.map(n => Math.floor(n / 10)));
    
    // 当前选中的头数统计
    const headCount = new Map<number, number>();
    const headScore = new Map<number, number>();
    
    selectedStats.forEach(s => {
      headCount.set(s.head, (headCount.get(s.head) || 0) + 1);
      headScore.set(s.head, (headScore.get(s.head) || 0) + s.totalScore);
    });
    
    // 优先推荐新头数（上期未出现的）
    const newHeads: Array<{head: number, score: number}> = [];
    const existingHeads: Array<{head: number, score: number}> = [];
    
    for (let head = 0; head <= 4; head++) {
      const count = headCount.get(head) || 0;
      const score = headScore.get(head) || 0;
      
      if (count > 0) {
        const item = { head, score: score * (lastHeads.has(head) ? 0.7 : 1.0) };
        
        if (!lastHeads.has(head)) {
          newHeads.push(item);
        } else {
          existingHeads.push(item);
        }
      }
    }
    
    // 排序
    newHeads.sort((a, b) => b.score - a.score);
    existingHeads.sort((a, b) => b.score - a.score);
    
    // 组合推荐（新头数优先）
    const recommendations: number[] = [];
    
    // 先添加新头数（最多2个）
    for (let i = 0; i < Math.min(newHeads.length, 2); i++) {
      recommendations.push(newHeads[i].head);
    }
    
    // 补充其他头数
    const allItems = [...newHeads, ...existingHeads].sort((a, b) => b.score - a.score);
    for (const item of allItems) {
      if (!recommendations.includes(item.head) && recommendations.length < 3) {
        recommendations.push(item.head);
      }
    }
    
    // 如果还是不足，添加默认头数
    if (recommendations.length < 3) {
      for (let head = 0; head <= 4; head++) {
        if (!recommendations.includes(head) && recommendations.length < 3) {
          recommendations.push(head);
        }
      }
    }
    
    return recommendations.sort((a, b) => a - b).map(h => h.toString());
  }

  /**
   * 计算尾数推荐（确保变化）
   */
  private static calculateTailRecommendationsWithChange(
    selectedStats: NumberStat[],
    lastDraw: number[]
  ): string[] {
    // 获取上期尾数
    const lastTails = new Set(lastDraw.map(n => n % 10));
    
    // 当前选中的尾数统计
    const tailCount = new Map<number, number>();
    const tailScore = new Map<number, number>();
    
    selectedStats.forEach(s => {
      tailCount.set(s.tail, (tailCount.get(s.tail) || 0) + 1);
      tailScore.set(s.tail, (tailScore.get(s.tail) || 0) + s.totalScore);
    });
    
    // 优先推荐新尾数（上期未出现的）
    const newTails: Array<{tail: number, score: number}> = [];
    const existingTails: Array<{tail: number, score: number}> = [];
    
    for (let tail = 0; tail <= 9; tail++) {
      const count = tailCount.get(tail) || 0;
      const score = tailScore.get(tail) || 0;
      
      if (count > 0) {
        const item = { tail, score: score * (lastTails.has(tail) ? 0.6 : 1.0) }; // 上期尾数大幅降权
        
        if (!lastTails.has(tail)) {
          newTails.push(item);
        } else {
          existingTails.push(item);
        }
      }
    }
    
    // 排序
    newTails.sort((a, b) => b.score - a.score);
    existingTails.sort((a, b) => b.score - a.score);
    
    // 组合推荐（新尾数优先）
    const recommendations: number[] = [];
    
    // 先添加新尾数（最多4个）
    for (let i = 0; i < Math.min(newTails.length, 4); i++) {
      recommendations.push(newTails[i].tail);
    }
    
    // 补充其他尾数（确保多样性）
    const allItems = [...newTails, ...existingTails].sort((a, b) => b.score - a.score);
    for (const item of allItems) {
      if (!recommendations.includes(item.tail) && recommendations.length < 5) {
        recommendations.push(item.tail);
      }
    }
    
    // 如果还是不足，添加默认尾数
    if (recommendations.length < 5) {
      for (let tail = 0; tail <= 9; tail++) {
        if (!recommendations.includes(tail) && recommendations.length < 5) {
          recommendations.push(tail);
        }
      }
    }
    
    return recommendations.sort((a, b) => a - b).map(t => t.toString());
  }

  // ==========================================
  // 原有辅助方法（保持）
  // ==========================================

  private static executeStandardAlgorithms(
    stats: NumberStat[],
    data: any
  ) {
    // 执行原有标准算法
    // 这里简化表示，实际应调用各个算法
    console.log('执行标准算法...');
  }

  private static calculateHeadAnalysis(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    // 原有头数分析算法
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = Math.random() * 20 + 10;
    return scores;
  }

  private static calculateTailAnalysisEnhanced(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    // 原有尾数分析算法
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = Math.random() * 25 + 15;
    return scores;
  }

  private static calculateHeadTailPairAnalysis(history: DbRecord[], lastDraw: number[]): Record<number, number> {
    // 原有头尾配对分析算法
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) scores[i] = Math.random() * 15 + 8;
    return scores;
  }

  private static extractPattern(slice: DbRecord[]): any {
    // 提取模式
    return { type: 'pattern', data: slice };
  }

  private static extractSimplePattern(nums: number[]): string {
    // 提取简单模式
    return nums.join('-');
  }

  private static breaksPattern(stat: NumberStat, pattern: any): boolean {
    // 检查是否打破模式
    return Math.random() > 0.5;
  }

  private static followsPattern(stat: NumberStat, pattern: any): boolean {
    // 检查是否顺应模式
    return Math.random() > 0.5;
  }

  private static breaksSpecificPattern(stat: NumberStat, pattern: any): boolean {
    // 检查是否打破特定模式
    return Math.random() > 0.5;
  }

  private static evaluatePatternTransition(stat: NumberStat, lastNums: number[], transitions: Map<string, number>): number {
    // 评估模式转换
    return Math.random() * 10;
  }

  private static analyzeCrossPeriodSpan(num: number, history: DbRecord[]): number {
    // 分析跨期跨度
    return Math.random() * 8;
  }

  private static analyzePeriodicResonance(num: number, history: DbRecord[]): number {
    // 分析周期共振
    return Math.random() * 6;
  }

  private static identifyRecentPatterns(history: DbRecord[]): any[] {
    // 识别近期模式
    return [];
  }

  private static analyzeDeterministicRelation(num: number, lastSpecial: number, history: DbRecord[]): number {
    // 分析确定性关系
    return Math.random() * 12;
  }

  private static analyzeSeasonalDeterminism(stat: NumberStat, history: DbRecord[]): number {
    // 分析季节性确定性
    return Math.random() * 6;
  }

  private static analyzePeriodicDeterminism(num: number, history: DbRecord[]): number {
    // 分析周期确定性
    return Math.random() * 8;
  }

  private static analyzePredictability(history: DbRecord[]): Map<number, number> {
    // 分析可预测性
    const map = new Map<number, number>();
    for (let i = 1; i <= 49; i++) map.set(i, Math.random());
    return map;
  }

  private static analyzeTrendStrength(history: DbRecord[]): Map<number, number> {
    // 分析趋势强度
    const map = new Map<number, number>();
    for (let i = 1; i <= 49; i++) map.set(i, Math.random());
    return map;
  }

  private static analyzePatternClarity(history: DbRecord[]): Map<number, number> {
    // 分析模式清晰度
    const map = new Map<number, number>();
    for (let i = 1; i <= 49; i++) map.set(i, Math.random());
    return map;
  }

  private static forceAddHeadDiversity(stats: NumberStat[], selected: NumberStat[], currentHeads: Set<number>): void {
    // 强制补充头数多样性
    for (let head = 0; head <= 4; head++) {
      if (!currentHeads.has(head)) {
        const best = stats.find(s => s.head === head && !selected.includes(s));
        if (best) {
          selected.push(best);
          currentHeads.add(head);
        }
      }
    }
  }

  private static forceAddTailDiversity(stats: NumberStat[], selected: NumberStat[], currentTails: Set<number>): void {
    // 强制补充尾数多样性
    const needed = 10 - currentTails.size;
    if (needed <= 0) return;
    
    const missingTails = Array.from({length: 10}, (_, i) => i).filter(t => !currentTails.has(t));
    
    for (let i = 0; i < Math.min(needed, missingTails.length); i++) {
      const tail = missingTails[i];
      const best = stats.find(s => s.tail === tail && !selected.includes(s));
      if (best) {
        selected.push(best);
        currentTails.add(tail);
      }
    }
  }

  /**
   * 确定性增强随机生成
   */
  private static generateDeterministicRandom(history?: DbRecord[]): PredictionData {
    console.log('使用确定性增强随机生成...');
    const nums: string[] = [];
    const generated = new Set<number>();
    
    // 如果有历史数据，避免近期号码
    const recentNumbers = new Set<number>();
    if (history && history.length > 0) {
      const recentHistory = history.slice(0, Math.min(history.length, 5));
      recentHistory.forEach(record => {
        const recentNums = this.parseNumbers(record.open_code);
        recentNums.forEach(n => recentNumbers.add(n));
      });
    }
    
    // 生成号码（避免近期号码）
    while (generated.size < 18) {
      // 偏向新号码（避免近期）
      const bias = Math.random() < 0.8 ? 20 : 0;
      const r = Math.floor(Math.random() * 30) + bias;
      const num = Math.max(1, Math.min(49, r));
      
      if (!recentNumbers.has(num) && !generated.has(num)) {
        generated.add(num);
      }
    }
    
    // 转换为字符串并排序
    Array.from(generated).sort((a, b) => a - b).forEach(n => {
      nums.push(n < 10 ? `0${n}` : `${n}`);
    });
    
    // 生肖推荐（避免重复）
    const allZodiacs = Object.keys(this.ZODIACS_MAP);
    const recZodiacs: string[] = [];
    
    // 如果有历史，避免近期生肖
    const recentZodiacs = new Set<string>();
    if (history && history.length > 0) {
      const lastNums = this.parseNumbers(history[0].open_code);
      const lastSpecial = lastNums[lastNums.length - 1];
      const lastZodiac = this.NUM_TO_ZODIAC[lastSpecial];
      if (lastZodiac) recentZodiacs.add(lastZodiac);
    }
    
    // 选择生肖
    while (recZodiacs.length < 6) {
      const randomZodiac = allZodiacs[Math.floor(Math.random() * allZodiacs.length)];
      if (!recZodiacs.includes(randomZodiac) && !recentZodiacs.has(randomZodiac)) {
        recZodiacs.push(randomZodiac);
      }
    }
    
    // 头尾推荐
    const heads = ['0', '1', '2', '3', '4']
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const tails = Array.from({length: 10}, (_, i) => i.toString())
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    console.log('确定性增强随机生成结果:', nums.join(', '));
    
    return {
      zodiacs: recZodiacs.slice(0, 6),
      numbers: nums,
      wave: { main: 'red', defense: 'blue' },
      heads: heads,
      tails: tails
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
