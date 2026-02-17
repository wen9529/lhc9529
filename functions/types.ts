
export enum LotteryType {
  HK = 'HK',
  MO_NEW = 'MO_NEW',
  MO_OLD = 'MO_OLD',
  MO_OLD_2230 = 'MO_OLD_2230'
}

export interface LotteryRecord {
  expect: string;
  openCode: string;
  openTime: string;
  wave?: string;
  zodiac?: string;
  type?: string;
}

export interface DbRecord {
  id: number;
  lottery_type: LotteryType;
  expect: string;
  open_code: string;
  open_time: string;
  wave: string;
  zodiac: string;
}

export interface PredictionData {
  zodiacs: string[];     // 推荐六肖
  numbers: string[];     // 推荐18码
  wave: {                // 波色
    main: string;        // 主攻
    defense: string;     // 防守
  };
  heads: string[];       // 推荐三个头
  tails: string[];       // 推荐五个尾
  ai_eight_codes?: string[]; // 综合精选 8 码 (原 AI)
  strategy_analysis?: string; // 策略分析报告
}

export interface DbPrediction {
  id: number;
  lottery_type: LotteryType;
  target_expect: string;
  prediction_numbers: string; 
  created_at: number;
}

export interface ApiResponse {
  latestRecord: DbRecord | null;
  latestPrediction: DbPrediction | null;
  lastPrediction: DbPrediction | null;
  history: DbRecord[];
  predictionHistory: DbPrediction[];
}

export interface Env {
  DB: any;
  TELEGRAM_TOKEN: string;
  ADMIN_CHAT_ID: string;
  URL_HK: string;
  URL_MO_NEW: string;
  URL_MO_OLD: string;
  URL_MO_OLD_2230: string;
}
