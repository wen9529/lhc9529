
// @ts-nocheck
// 定义全局变量，供前端无构建环境使用
window.LotteryType = {
  HK: 'HK',
  MO_NEW: 'MO_NEW',
  MO_OLD: 'MO_OLD',
  MO_OLD_2230: 'MO_OLD_2230'
};

// 接口定义在 TypeScript 编译时会被移除，所以保留即可供 IDE 提示
// 实际运行时不起作用
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
  predictionHistory: DbPrediction[]; // 新增字段
}
