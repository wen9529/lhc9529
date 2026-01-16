// @ts-nocheck
window.getZodiac = (num) => {
  const n = parseInt(String(num));
  if ([6, 18, 30, 42].includes(n)) return '鼠';
  if ([5, 17, 29, 41].includes(n)) return '牛';
  if ([4, 16, 28, 40].includes(n)) return '虎';
  if ([3, 15, 27, 39].includes(n)) return '兔';
  if ([2, 14, 26, 38].includes(n)) return '龙';
  if ([1, 13, 25, 37, 49].includes(n)) return '蛇';
  if ([12, 24, 36, 48].includes(n)) return '马';
  if ([11, 23, 35, 47].includes(n)) return '羊';
  if ([10, 22, 34, 46].includes(n)) return '猴';
  if ([9, 21, 33, 45].includes(n)) return '鸡';
  if ([8, 20, 32, 44].includes(n)) return '狗';
  if ([7, 19, 31, 43].includes(n)) return '猪';
  return '';
};