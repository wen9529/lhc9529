
// @ts-nocheck
// 定义全局变量，供前端无构建环境使用
window.LotteryType = {
  HK: 'HK',
  MO_NEW: 'MO_NEW',
  MO_OLD: 'MO_OLD',
  MO_OLD_2230: 'MO_OLD_2230'
};

export interface DbRecord {
  id: number;
  lottery_type: string;
  expect: string;
  open_code: string;
  open_time: string;
  wave: string;
  zodiac: string;
}

export interface PredictionData {
  zodiacs: string[];
  numbers: string[];
  wave: {
    main: string;
    defense: string;
  };
  heads: string[];
  tails: string[];
  ai_eight_codes?: string[]; // AI 推荐 8 码
  strategy_analysis?: string;
}

export interface DbPrediction {
  id: number;
  lottery_type: string;
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
