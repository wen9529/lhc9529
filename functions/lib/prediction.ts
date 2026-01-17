
import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  
  // v9.0 九大维度评分
  scoreHistoryMirror: number;  // 历史镜像 (整体盘面相似度)
  scoreZodiacTrans: number;    // [NEW] 生肖转移概率 (上期开A，下期大概率开B)
  scoreNumberTrans: number;    // [NEW] 特码转移概率 (上期特码X，下期大概率特码Y)
  scoreSpecialTraj: number;    // 轨迹惯性
  scorePattern: number;        // 形态几何
  scoreTail: number;           // 尾数力场
  scoreZodiac: number;         // 三合局势
  scoreWuXing: number;         // 五行平衡
  scoreWave: number;           // 波色惯性
  scoreGold: number;           // 黄金密钥
  scoreOmission: number;       // 遗漏回补
  
  totalScore: number;
}

/**
 * 🔮 Quantum Matrix Prediction Engine v9.0 "Galaxy Statistician" (银河统计师)
 * 核心升级：引入马尔可夫链思想，统计“状态转移概率”。
 * 优化：头尾数引入时间衰减权重，确保推荐结果随每期开奖动态变化。
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
    
    if (!history || history.length < 20) return this.generateRandom();

    // 0. 数据预处理
    const fullHistory = history;
    const recent20 = history.slice(0, 20);
    const recent10 = history.slice(0, 10);
    const lastDrawNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1]; // 上期特码
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial]; // 上期特肖
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);

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
        totalScore: 0
      };
    });

    // ==========================================
    // 算法 1: [NEW] 生肖转移概率 (Zodiac Transition)
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
            s.scoreZodiacTrans = (occurrences / zodiacTransTotal) * 40; 
        }
    });

    // ==========================================
    // 算法 2: [NEW] 特码转移概率 (Number Transition)
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
    stats.forEach(s => s.scoreNumberTrans = (numTransMap[s.num] || 0) * 5);

    // ==========================================
    // 算法 3: 历史镜像 (Historical Mirroring)
    // ==========================================
    const mirrorCounts: Record<number, number> = {};
    for (let i = 1; i < fullHistory.length - 1; i++) {
        const histNums = this.parseNumbers(fullHistory[i].open_code);
        const common = histNums.filter(n => lastDrawNums.includes(n));
        if (common.length >= 3) {
            const nextNums = this.parseNumbers(fullHistory[i-1].open_code);
            nextNums.forEach(n => {
                mirrorCounts[n] = (mirrorCounts[n] || 0) + common.length; 
            });
        }
    }
    stats.forEach(s => s.scoreHistoryMirror = (mirrorCounts[s.num] || 0) * 0.5);

    // ==========================================
    // 算法 4: 尾数力场 (引入时间衰减)
    // ==========================================
    const tailScores: Record<number, number> = {};
    recent10.forEach((rec, idx) => {
        // [动态优化] 越近的期数权重越高 (2.0 -> 1.85 -> ...)
        // idx=0 是最近一期。这确保了尾数推荐随每期结果迅速变化。
        const weight = 2.0 - (idx * 0.15); 
        this.parseNumbers(rec.open_code).forEach(n => {
            const t = n % 10;
            tailScores[t] = (tailScores[t] || 0) + Math.max(0.1, weight);
        });
    });
    
    // 按加权分数排序
    const sortedTails = Object.keys(tailScores).map(Number)
        .sort((a, b) => (tailScores[b] || 0) - (tailScores[a] || 0));
        
    const hotTails = sortedTails.slice(0, 3);
    
    stats.forEach(s => {
        if (hotTails.includes(s.tail)) s.scoreTail = 12;
        if (lastDrawNums.includes(s.num)) s.scorePattern += 5; 
        if (lastDrawNums.includes(s.num - 1) || lastDrawNums.includes(s.num + 1)) s.scorePattern += 8;
    });

    // ==========================================
    // 算法 5: 五行平衡 & 生肖三合
    // ==========================================
    const wxCounts: Record<string, number> = { '金':0, '木':0, '水':0, '火':0, '土':0 };
    history.slice(0, 5).forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => {
            const wx = this.NUM_TO_WUXING[n];
            if (wx) wxCounts[wx]++;
        });
    });
    const weakWX = Object.keys(wxCounts).sort((a, b) => wxCounts[a] - wxCounts[b])[0];
    
    const zodiacFreq: Record<string, number> = {};
    recent20.forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => {
            zodiacFreq[this.NUM_TO_ZODIAC[n]] = (zodiacFreq[this.NUM_TO_ZODIAC[n]] || 0) + 1;
        });
    });
    const kingZodiac = Object.keys(zodiacFreq).sort((a, b) => zodiacFreq[b] - zodiacFreq[a])[0];
    const allies = this.SAN_HE_MAP[kingZodiac] || [];

    stats.forEach(s => {
        if (s.wuxing === weakWX) s.scoreWuXing = 15;
        if (allies.includes(s.zodiac)) s.scoreZodiac += 10;
        if (s.zodiac === kingZodiac) s.scoreZodiac += 5;
    });

    // ==========================================
    // 算法 6: 黄金密钥
    // ==========================================
    const gold1 = Math.round(lastDrawSum * 0.618) % 49 || 49;
    const gold2 = (lastDrawSum + 7) % 49 || 49;
    stats.forEach(s => {
        if (s.num === gold1 || s.num === gold2) s.scoreGold = 20;
    });
    
    // ==========================================
    // 最终汇总
    // ==========================================
    stats.forEach(s => {
        s.totalScore = 
            s.scoreZodiacTrans * 2.0 + 
            s.scoreNumberTrans * 1.5 + 
            s.scoreHistoryMirror * 1.2 + 
            s.scorePattern * 0.8 +
            s.scoreTail * 0.8 +
            s.scoreZodiac * 0.8 +
            s.scoreWuXing * 0.8 +
            s.scoreGold * 0.6 +
            s.scoreOmission * 0.5;
            
        s.totalScore += Math.random() * 0.1;
    });

    stats.sort((a, b) => b.totalScore - a.totalScore);

    // 选码
    const final18 = stats.slice(0, 18);
    const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 计算推荐肖
    const zMap: Record<string, number> = {};
    final18.forEach(s => zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore);
    const recZodiacs = Object.keys(zMap).sort((a, b) => zMap[b] - zMap[a]).slice(0, 6);

    // 计算推荐波
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    final18.forEach(s => wMap[s.wave]++);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 计算推荐尾数 (直接使用上方加权排序后的结果)
    const recTails = sortedTails.slice(0, 5).map(String);

    // --- 🚨 修复头数计算逻辑 🚨 ---
    // [动态优化] 混合评分：主要依据18码分布，辅以历史加权热度
    // 这样如果18码分布平均，历史热度会打破僵局，防止结果一成不变
    const headScores: Record<number, number> = {};
    
    // 1. 预测池权重 (高权重)
    final18.forEach(s => {
        const h = Math.floor(s.num / 10);
        headScores[h] = (headScores[h] || 0) + 10;
    });

    // 2. 历史加权 (辅助权重，打破平局)
    recent10.forEach((rec, idx) => {
        const weight = 1.0 - (idx * 0.05);
        this.parseNumbers(rec.open_code).forEach(n => {
            const h = Math.floor(n / 10);
            headScores[h] = (headScores[h] || 0) + Math.max(0, weight);
        });
    });

    const recHeads = Object.keys(headScores)
        .sort((a, b) => headScores[parseInt(b)] - headScores[parseInt(a)])
        .slice(0, 3);

    return {
        zodiacs: recZodiacs,
        numbers: resultNumbers,
        wave: { main: recWaves[0], defense: recWaves[1] },
        heads: recHeads, 
        tails: recTails
    };
  }

  // --- 辅助方法 ---

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
      heads: ['0', '1', '2'],
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
