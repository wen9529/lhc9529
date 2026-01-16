// @ts-nocheck
window.getWaveColor = (num) => {
  const n = parseInt(String(num));
  const reds = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
  const blues = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
  const greens = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];
  if (reds.includes(n)) return 'bg-red-500 shadow-red-500/50';
  if (blues.includes(n)) return 'bg-blue-500 shadow-blue-500/50';
  if (greens.includes(n)) return 'bg-green-500 shadow-green-500/50';
  return 'bg-slate-500 shadow-slate-500/50';
};