// File: functions/types.ts
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
  zodiacs: string[];
  numbers: string[];
  wave: {
    main: string;
    defense: string;
  };
  heads: string[];
  tails: string[];
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