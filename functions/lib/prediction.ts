
import { LotteryType, PredictionData, DbRecord } from '../types';

interface NumberStat {
  num: number;
  zodiac: string;
  wave: string;
  wuxing: string;
  tail: number;
  
  // v10.0 十大确定性维度
  scoreHistoryMirror: number;  // 1. 历史镜像
  scoreZodiacTrans: number;    // 2. 生肖转移矩阵
  scoreNumberTrans: number;    // 3. 特码转移矩阵
  scoreOffsetTraj: number;     // 4. [NEW] 偏移轨迹 (确定性数学距离)
  scoreOmission: number;       // 5. [NEW] 遗漏回补 (冷热确定性)
  scoreModulo: number;         // 6. [NEW] 时空模数 (Mod 3/4 分区)
  scoreTail: number;           // 7. 尾数力场
  scoreZodiac: number;         // 8. 三合局势
  scoreWuXing: number;         // 9. 五行平衡
  scoreGold: number;           // 10. 黄金密钥
  
  totalScore: number;
  
  // 辅助字段
  temp_omission?: number;
}

/**
 * 🔮 Cosmic Calculator v10.0 (宇宙算力)
 * 核心升级：引入确定性数学算法（偏移、遗漏、模数），大幅降低随机因子权重。
 */
export class PredictionEngine {

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

    const recent20 = history.slice(0, 20);
    const lastDrawNums = this.parseNumbers(history[0].open_code);
    const lastSpecial = lastDrawNums[lastDrawNums.length - 1]; 
    const lastSpecialZodiac = this.NUM_TO_ZODIAC[lastSpecial];
    const lastDrawSum = lastDrawNums.reduce((a, b) => a + b, 0);

    // 初始化 1-49 号码池
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
        scoreOffsetTraj: 0,
        scoreOmission: 0,
        scoreModulo: 0,
        scoreTail: 0,
        scoreZodiac: 0,
        scoreWuXing: 0,
        scoreGold: 0,
        
        totalScore: 0
      };
    });

    // ==========================================
    // 算法 1: 历史最佳偏移 (Best Offset Trajectory) - 确定性
    // ==========================================
    // 计算公式: Next = (Prev + Offset) % 49
    // 寻找过去 50 期最准的"数学距离"
    const offsetCounts = new Map<number, number>();
    const offsetLimit = Math.min(history.length - 1, 60);
    
    for (let i = 0; i < offsetLimit; i++) {
        const curr = this.parseNumbers(history[i].open_code).pop();
        const prev = this.parseNumbers(history[i+1].open_code).pop();
        if (curr && prev) {
            // 计算偏移量 K. (48 + K) % 49 = 2  => K = 3
            // Diff = (curr - prev)
            const diff = (curr - prev + 49) % 49;
            if (diff !== 0) {
                 offsetCounts.set(diff, (offsetCounts.get(diff) || 0) + 1);
            }
        }
    }
    // 取前 5 个最强偏移
    const topOffsets = [...offsetCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // 将偏移应用到当前 LastSpecial
    topOffsets.forEach(([offset, hits]) => {
        const nextNum = (lastSpecial + offset - 1) % 49 + 1;
        const stat = stats.find(s => s.num === nextNum);
        if (stat) {
             // 权重: 命中次数 * 3
             stat.scoreOffsetTraj += hits * 3.5;
        }
    });

    // ==========================================
    // 算法 2: 遗漏回补 (Omission Analysis) - 确定性
    // ==========================================
    // 计算当前遗漏值
    history.forEach((rec, idx) => {
       const special = this.parseNumbers(rec.open_code).pop();
       if(special) {
           const stat = stats.find(s => s.num === special);
           if (stat && stat.temp_omission === undefined) {
               stat.temp_omission = idx;
           }
       }
    });
    
    stats.forEach(s => {
        if (s.temp_omission === undefined) s.temp_omission = history.length;
        const om = s.temp_omission;
        
        // 策略 A: 极度深冷 (遗漏 > 40) -> 爆发前兆
        if (om > 40) s.scoreOmission += 15;
        // 策略 B: 热门回补 (遗漏 1-5) -> 热度惯性
        else if (om <= 5) s.scoreOmission += (6 - om) * 2; // 遗漏越小分越高
        // 策略 C: 黄金周期 (遗漏 9-10, 19-20) -> 概率节点
        else if (Math.abs(om - 9) <= 1) s.scoreOmission += 8;
        else if (Math.abs(om - 19) <= 1) s.scoreOmission += 8;
    });

    // ==========================================
    // 算法 3: 时空模数 (Space-Time Modulo) - 确定性
    // ==========================================
    // 观察 LastSpecial 的 Mod 3 和 Mod 4 特征
    // 如果历史上 LastSpecial Mod 3 = 1 时，下期倾向于出 Mod 3 = 0，则加分
    const mod3Trans: Record<number, number> = {0:0, 1:0, 2:0};
    const lastMod3 = lastSpecial % 3;
    
    for(let i=0; i<offsetLimit; i++) {
        const curr = this.parseNumbers(history[i].open_code).pop();
        const prev = this.parseNumbers(history[i+1].open_code).pop();
        if (curr && prev && prev % 3 === lastMod3) {
            mod3Trans[curr % 3]++;
        }
    }
    const bestMod3 = Object.keys(mod3Trans).sort((a,b) => mod3Trans[Number(b)] - mod3Trans[Number(a)])[0];
    
    stats.forEach(s => {
        if (s.num % 3 === Number(bestMod3)) s.scoreModulo += 8;
    });

    // ==========================================
    // 算法 4: 生肖转移 (现有逻辑优化)
    // ==========================================
    const zodiacTransMap: Record<string, number> = {};
    for (let i = 1; i < history.length - 1; i++) {
        const histNums = this.parseNumbers(history[i].open_code);
        const histSpecial = histNums[histNums.length - 1];
        const histZodiac = this.NUM_TO_ZODIAC[histSpecial];

        if (histZodiac === lastSpecialZodiac) {
            const nextNums = this.parseNumbers(history[i-1].open_code);
            const nextSpecial = nextNums[nextNums.length - 1];
            zodiacTransMap[this.NUM_TO_ZODIAC[nextSpecial]] = (zodiacTransMap[this.NUM_TO_ZODIAC[nextSpecial]] || 0) + 1;
        }
    }
    stats.forEach(s => {
        s.scoreZodiacTrans = (zodiacTransMap[s.zodiac] || 0) * 3;
    });

    // ==========================================
    // 算法 5: 历史镜像 (现有逻辑)
    // ==========================================
    const mirrorCounts: Record<number, number> = {};
    for (let i = 1; i < history.length - 1; i++) {
        const histNums = this.parseNumbers(history[i].open_code);
        const common = histNums.filter(n => lastDrawNums.includes(n));
        if (common.length >= 3) {
            const nextNums = this.parseNumbers(history[i-1].open_code);
            nextNums.forEach(n => mirrorCounts[n] = (mirrorCounts[n] || 0) + 1);
        }
    }
    stats.forEach(s => s.scoreHistoryMirror = (mirrorCounts[s.num] || 0) * 2);

    // ==========================================
    // 算法 6: 尾数力场 (时间衰减)
    // ==========================================
    const tailScores: Record<number, number> = {};
    recent20.slice(0, 10).forEach((rec, idx) => {
        const weight = 2.0 - (idx * 0.15); 
        this.parseNumbers(rec.open_code).forEach(n => {
            tailScores[n % 10] = (tailScores[n % 10] || 0) + weight;
        });
    });
    const sortedTails = Object.keys(tailScores).map(Number).sort((a, b) => (tailScores[b] || 0) - (tailScores[a] || 0));
    const hotTails = sortedTails.slice(0, 3);
    stats.forEach(s => {
        if (hotTails.includes(s.tail)) s.scoreTail = 10;
    });

    // ==========================================
    // 算法 7-10: 基础五行与三合
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
        this.parseNumbers(rec.open_code).forEach(n => zodiacFreq[this.NUM_TO_ZODIAC[n]] = (zodiacFreq[this.NUM_TO_ZODIAC[n]] || 0) + 1);
    });
    const kingZodiac = Object.keys(zodiacFreq).sort((a, b) => zodiacFreq[b] - zodiacFreq[a])[0];
    const allies = this.SAN_HE_MAP[kingZodiac] || [];

    const gold1 = Math.round(lastDrawSum * 0.618) % 49 || 49;
    
    stats.forEach(s => {
        if (s.wuxing === weakWX) s.scoreWuXing = 8;
        if (allies.includes(s.zodiac)) s.scoreZodiac += 8;
        if (s.num === gold1) s.scoreGold = 15;
    });

    // ==========================================
    // 最终加权汇总
    // ==========================================
    stats.forEach(s => {
        s.totalScore = 
            s.scoreOffsetTraj * 2.0 +    // 偏移轨迹 (最高权)
            s.scoreOmission * 1.5 +      // 遗漏回补
            s.scoreZodiacTrans * 1.2 +   // 生肖转移
            s.scoreHistoryMirror * 1.0 + // 历史镜像
            s.scoreModulo * 1.0 +        // 时空模数
            s.scoreTail * 0.8 +
            s.scoreZodiac * 0.6 +
            s.scoreWuXing * 0.6 +
            s.scoreGold * 0.5;
            
        // 微量随机扰动，防止同分死锁
        s.totalScore += Math.random() * 0.1;
    });

    stats.sort((a, b) => b.totalScore - a.totalScore);

    // 1. 选出 18 码
    const final18 = stats.slice(0, 18);
    const resultNumbers = final18.map(s => s.num).sort((a, b) => a - b).map(n => n < 10 ? `0${n}` : `${n}`);

    // 2. 选出 6 肖 (基于前18码的生肖聚合分)
    const zMap: Record<string, number> = {};
    final18.forEach(s => zMap[s.zodiac] = (zMap[s.zodiac] || 0) + s.totalScore);
    const recZodiacs = Object.keys(zMap).sort((a, b) => zMap[b] - zMap[a]).slice(0, 6);

    // 3. 选出波色
    const wMap: Record<string, number> = { red: 0, blue: 0, green: 0 };
    final18.forEach(s => wMap[s.wave]++);
    const recWaves = Object.keys(wMap).sort((a, b) => wMap[b as any] - wMap[a as any]);

    // 4. 选出头数 (混合 18 码分布 + 历史分布)
    const headScores: Record<number, number> = {};
    final18.forEach(s => headScores[Math.floor(s.num / 10)] = (headScores[Math.floor(s.num / 10)] || 0) + 10);
    // 历史补正
    recent20.slice(0, 10).forEach(rec => {
        this.parseNumbers(rec.open_code).forEach(n => headScores[Math.floor(n/10)] = (headScores[Math.floor(n/10)] || 0) + 1);
    });
    const recHeads = Object.keys(headScores).sort((a, b) => headScores[parseInt(b)] - headScores[parseInt(a)]).slice(0, 3).map(String);

    return {
        zodiacs: recZodiacs,
        numbers: resultNumbers,
        wave: { main: recWaves[0], defense: recWaves[1] },
        heads: recHeads, 
        tails: sortedTails.slice(0, 5).map(String) // 尾数直接用尾数力场的结果
    };
  }

  // --- 辅助 ---
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
