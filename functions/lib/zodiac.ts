/**
 * 农历春节日期表 (Gregorian Date string YYYY-MM-DD)
 * 当天及以后进入该生肖年
 */
const CNY_DATES: Record<number, string> = {
  2024: '2024-02-10', // 龙 (Index 4)
  2025: '2025-01-29', // 蛇 (Index 5)
  2026: '2026-02-17', // 马 (Index 6)
  2027: '2027-02-06', // 羊 (Index 7)
};

// 生肖基准索引：鼠=0, ... 蛇=5, 马=6, 羊=7
const ZODIAC_BASE_INDEX: Record<number, number> = {
  2024: 4, // 龙
  2025: 5, // 蛇
  2026: 6, // 马
  2027: 7, // 羊
};

/**
 * 获取生肖排位基准索引
 * @param expect 期号 (用于提取年份)
 * @param openTime 开奖时间 (用于精确比对春节)
 */
export const getZodiacRefIndex = (expect: string | number, openTime?: string): number => {
  const str = String(expect || '');
  let year = 2026; // 默认为当前马年上下文
  
  if (str.length >= 4) {
    year = parseInt(str.substring(0, 4));
  }

  // 获取该年份的春节日期
  const cnyDate = CNY_DATES[year];
  // 获取该年份的生肖索引 (马=6)
  const nextBase = ZODIAC_BASE_INDEX[year] !== undefined ? ZODIAC_BASE_INDEX[year] : 6;
  // 上一年索引
  const prevBase = (nextBase - 1) < 0 ? 11 : (nextBase - 1); 

  // 1. 如果有具体开奖时间，精确比对
  if (openTime && cnyDate) {
    // 截取 YYYY-MM-DD
    const datePart = openTime.substring(0, 10);
    if (datePart >= cnyDate) {
      return nextBase; // 过了春节，用新排位
    } else {
      return prevBase; // 没过春节，用旧排位
    }
  }

  // 2. 如果没有时间 (通常是预测数据，面向未来)，默认使用该年的新排位
  return nextBase;
};

/**
 * 获取生肖
 * @param num 号码
 * @param expect 期号
 * @param openTime 开奖时间
 */
export const getZodiac = (num: string | number, expect?: string | number, openTime?: string): string => {
  const n = parseInt(String(num));
  const zOrder = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  // 动态获取基准索引 (1号对应的生肖)
  const refIndex = getZodiacRefIndex(expect || '', openTime);
  
  // 倒序排列公式
  let idx = (refIndex - (n - 1)) % 12;
  if (idx < 0) idx += 12;
  
  return zOrder[idx];
};

/**
 * 兼容旧代码的辅助函数，直接返回基准索引作为 Mode 标识
 */
export const getZodiacMode = (expect: string | number, openTime?: string): number => {
  return getZodiacRefIndex(expect, openTime);
};
