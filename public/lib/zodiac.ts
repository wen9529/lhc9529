// @ts-nocheck
const CNY_DATES = {
  2024: '2024-02-10',
  2025: '2025-01-29', 
  2026: '2026-02-17', // 马年起始日
  2027: '2027-02-06'
};

const ZODIAC_BASE_INDEX = {
  2024: 4, // 龙
  2025: 5, // 蛇
  2026: 6, // 马
  2027: 7  // 羊
};

window.getZodiacRefIndex = (expect, openTime) => {
  const str = String(expect || '');
  let year = 2026;
  if (str.length >= 4) year = parseInt(str.substring(0, 4));

  const cnyDate = CNY_DATES[year];
  // 默认使用当年的新排位 (马)
  const nextBase = ZODIAC_BASE_INDEX[year] !== undefined ? ZODIAC_BASE_INDEX[year] : 6;
  const prevBase = (nextBase - 1) < 0 ? 11 : (nextBase - 1);

  if (openTime && cnyDate) {
    const datePart = openTime.substring(0, 10);
    // 字符串直接比较日期: "2026-02-16" < "2026-02-17" -> 旧排位
    if (datePart < cnyDate) return prevBase; 
    return nextBase;
  }

  // 无时间（预测），默认为新排位
  return nextBase;
};

window.getZodiac = (num, expectOrRefIndex, openTime) => {
  const n = parseInt(String(num));
  const zOrder = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  let refIndex;
  
  // 兼容调用：如果第二个参数是数字，直接作为 refIndex 使用
  if (typeof expectOrRefIndex === 'number') {
    refIndex = expectOrRefIndex;
  } else {
    refIndex = window.getZodiacRefIndex(expectOrRefIndex, openTime);
  }
  
  let idx = (refIndex - (n - 1)) % 12;
  if (idx < 0) idx += 12;
  
  return zOrder[idx];
};

// 导出 mode 计算供 App 使用
window.getZodiacMode = window.getZodiacRefIndex;
