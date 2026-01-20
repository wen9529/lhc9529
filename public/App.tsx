
// @ts-nocheck
const { useState, useEffect, useRef } = React;
// 从全局对象获取依赖
const { LotteryType, getZodiac, getWaveColor } = window;

// --- 工具函数 ---
// 解析 JSON 预测数据
const parsePrediction = (predStr) => {
  try {
    return JSON.parse(predStr);
  } catch (e) {
    if (predStr.includes(',')) {
      return {
        zodiacs: [],
        numbers: predStr.split(','),
        wave: { main: 'red', defense: 'blue' },
        heads: [],
        tails: []
      };
    }
    return null;
  }
};

const waveToZh = (w) => w === 'red' ? '红波' : w === 'blue' ? '蓝波' : '绿波';
const waveToBg = (w) => w === 'red' ? 'bg-red-500' : w === 'blue' ? 'bg-blue-500' : 'bg-green-500';

const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      active 
      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}
  >
    {label}
  </button>
);

const NumberBall = ({ num, size = 'md', showZodiac = false, highlight = false, dim = false }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  const zodiac = getZodiac(num);
  let colorClass = getWaveColor(num);
  
  const extraClass = highlight 
    ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-110 z-10' 
    : dim 
      ? 'opacity-30 grayscale' 
      : 'ring-2 ring-white';

  return (
    <div className="flex flex-col items-center gap-1 transition-all duration-300">
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-md ${colorClass} ${extraClass}`}>
        {num}
      </div>
      {showZodiac && (
        <span className={`text-slate-500 font-medium ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {zodiac}
        </span>
      )}
    </div>
  );
};

// --- 通用验证函数 ---
const verifyResult = (record, pred) => {
    if (!record || !pred) return null;
    const nums = record.open_code.split(',');
    const specialCode = nums[nums.length - 1];
    const specialZodiac = getZodiac(specialCode);
    const specialWave = (() => {
      const c = getWaveColor(specialCode);
      if (c.includes('red')) return 'red';
      if (c.includes('blue')) return 'blue';
      return 'green';
    })();
    const specialHead = specialCode.length === 2 ? specialCode[0] : '0';
    const specialTail = specialCode[specialCode.length - 1];

    const hits = pred.numbers.filter(n => nums.includes(n));
    const isSpecialHit = pred.numbers.includes(specialCode);
    
    return {
      specialCode,
      specialZodiac,
      zodiacHit: pred.zodiacs.includes(specialZodiac),
      waveHit: pred.wave.main === specialWave || pred.wave.defense === specialWave,
      headHit: pred.heads.includes(specialHead),
      tailHit: pred.tails.includes(specialTail),
      numbersHits: hits,
      isSpecialHit
    };
};

const HistoryModal = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-2xl">
          <h3 className="font-bold text-slate-700">历史开奖记录</h3>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 flex-1 no-scrollbar">
          {history.map((rec) => (
            <div key={rec.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-800 font-mono font-bold">第 {rec.expect} 期</span>
                <span className="text-xs text-slate-400">{rec.open_time}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {rec.open_code.split(',').map((n, i) => (
                  <NumberBall key={i} num={n} size="sm" />
                ))}
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-slate-400 py-10">暂无记录</p>}
        </div>
      </div>
    </div>
  );
};

// --- 新增：预测历史弹窗 ---
const PredictionHistoryModal = ({ isOpen, onClose, predHistory, resultHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-2xl">
          <h3 className="font-bold text-slate-700">历史预测复盘</h3>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1 no-scrollbar">
          {predHistory && predHistory.map((predRecord) => {
             const predData = parsePrediction(predRecord.prediction_numbers);
             // 查找对应的开奖结果
             const resultRecord = resultHistory.find(r => r.expect === predRecord.target_expect);
             const verify = resultRecord ? verifyResult(resultRecord, predData) : null;

             return (
              <div key={predRecord.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <div className="flex flex-col">
                     <span className="font-bold text-slate-700 text-sm">目标: 第 {predRecord.target_expect} 期</span>
                     {/* 显示当时使用的策略 */}
                     {predData?.strategy_analysis && (
                       <span className="text-[9px] text-slate-400 mt-0.5">策略: {predData.strategy_analysis.split('(')[0]}</span>
                     )}
                   </div>
                   {verify ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${verify.isSpecialHit ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-500'}`}>
                        {verify.isSpecialHit ? '特码命中' : `18码中${verify.numbersHits.length}`}
                      </span>
                   ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-500">待开奖</span>
                   )}
                </div>
                <div className="p-3">
                   {verify ? (
                      <div className="flex gap-2 text-xs mb-2 justify-center">
                         <span className={verify.zodiacHit ? 'text-red-500 font-bold' : 'text-slate-400'}>
                           六肖{verify.zodiacHit?'中':'挂'}
                         </span>
                         <span className="text-slate-300">|</span>
                         <span className={verify.waveHit ? 'text-blue-500 font-bold' : 'text-slate-400'}>
                           波色{verify.waveHit?'中':'挂'}
                         </span>
                         <span className="text-slate-300">|</span>
                         <span className="text-slate-500">
                           特: {verify.specialCode}
                         </span>
                      </div>
                   ) : (
                      <div className="text-center text-xs text-slate-400 mb-2">等待开奖结果...</div>
                   )}
                   
                   <div className="flex flex-wrap gap-1 justify-center opacity-70">
                      {predData?.numbers.map((n, i) => (
                         <span key={i} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${verify?.isSpecialHit && n === verify.specialCode ? 'bg-yellow-400 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                           {n}
                         </span>
                      ))}
                   </div>
                </div>
              </div>
             );
          })}
          {(!predHistory || predHistory.length === 0) && <p className="text-center text-slate-400 py-10">暂无预测记录</p>}
        </div>
      </div>
    </div>
  );
};

// 挂载到全局
window.App = function App() {
  const [activeTab, setActiveTab] = useState(LotteryType.HK);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPredHistory, setShowPredHistory] = useState(false);
  
  // PWA 安装状态
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }
    const handler = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
      console.log("PWA install event captured in React");
    };
    window.addEventListener('beforeinstallprompt', handler);

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(iOS);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator).standalone;
    setIsStandalone(standalone);

    if (iOS && !standalone) {
      setTimeout(() => setShowIosGuide(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  const fetchLotteryData = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data?type=${type}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteryData(activeTab);
  }, [activeTab]);

  const nextPred = data?.latestPrediction ? parsePrediction(data.latestPrediction.prediction_numbers) : null;
  const lastPred = data?.lastPrediction ? parsePrediction(data.lastPrediction.prediction_numbers) : null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-20 relative font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
      `}</style>
      
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={data?.history || []} 
      />

      <PredictionHistoryModal
        isOpen={showPredHistory}
        onClose={() => setShowPredHistory(false)}
        predHistory={data?.predictionHistory || []}
        resultHistory={data?.history || []}
      />

      <header className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-16">
        <div className="flex items-center gap-2 overflow-hidden">
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
             彩
           </div>
           <h1 className={`font-bold text-slate-800 text-lg tracking-tight whitespace-nowrap ${(deferredPrompt && !isStandalone) ? 'hidden sm:block' : 'block'}`}>
             Lottery Prophet
           </h1>
        </div>
        
        {!isStandalone && deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 animate-[bounce-slow_2s_infinite]"
          >
            <span className="text-base">📲</span>
            <span>安装 APP</span>
          </button>
        )}
      </header>

      <div className="mx-4 mt-4 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <div className="flex gap-1">
          <TabButton active={activeTab === LotteryType.HK} label="香港" onClick={() => setActiveTab(LotteryType.HK)} />
          <TabButton active={activeTab === LotteryType.MO_NEW} label="新澳" onClick={() => setActiveTab(LotteryType.MO_NEW)} />
          <TabButton active={activeTab === LotteryType.MO_OLD} label="老澳" onClick={() => setActiveTab(LotteryType.MO_OLD)} />
          <TabButton active={activeTab === LotteryType.MO_OLD_2230} label="22:30" onClick={() => setActiveTab(LotteryType.MO_OLD_2230)} />
        </div>
      </div>

      <main className="p-4 space-y-6">
        {showIosGuide && !isStandalone && (
           <div className="bg-slate-800 text-white p-4 rounded-xl mb-4 text-sm relative animate-[fadeIn_0.5s]">
            <button onClick={() => setShowIosGuide(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📲</span>
              <div>
                <p className="font-bold mb-1">安装到 iPhone/iPad</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  1. 点击底部浏览器的 <span className="font-bold text-blue-300">分享</span> 按钮<br/>
                  2. 选择 <span className="font-bold text-blue-300">添加到主屏幕</span>
                </p>
              </div>
            </div>
           </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
             <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-slate-400 text-sm">正在分析数据...</p>
          </div>
        ) : (
          <>
            {/* 最新开奖卡片 */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
               
               <div className="flex justify-between items-end mb-5 relative z-10">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                     <h2 className="text-slate-500 text-xs font-bold uppercase tracking-wider">最新开奖</h2>
                   </div>
                   <p className="text-2xl font-bold text-slate-800 tracking-tight">
                     第 {data?.latestRecord?.expect || '---'} 期
                   </p>
                 </div>
                 <div className="text-right">
                   <button 
                     onClick={() => setShowHistory(true)}
                     className="text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors flex items-center gap-1 group/btn"
                   >
                     <span>查看记录</span>
                     <svg className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </button>
                 </div>
               </div>
               
               <div className="flex flex-wrap gap-2 justify-center relative z-10 py-2">
                 {data?.latestRecord ? (
                   data.latestRecord.open_code.split(',').map((num, i) => (
                     <NumberBall key={i} num={num} showZodiac={true} />
                   ))
                 ) : (
                   <div className="py-8 text-center w-full bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">暂无开奖数据</p>
                   </div>
                 )}
               </div>
            </div>

            {/* 下期智能预测 (详细版) */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <div className="flex items-center gap-2">
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                     <h2 className="text-slate-700 text-sm font-bold uppercase tracking-wider">下期智能预测</h2>
                   </div>
                   <span className="px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-semibold text-indigo-600 border border-indigo-100">
                     目标: 第 {data?.latestPrediction?.target_expect || '---'} 期
                   </span>
                </div>

                {nextPred ? (
                  <div className="p-4 space-y-4">
                    {/* 显示当前优胜策略 */}
                    {nextPred.strategy_analysis && (
                      <div className="bg-indigo-50/50 rounded-lg p-2 text-center border border-indigo-100">
                         <p className="text-[10px] text-indigo-600 font-medium">
                           AI 决策: <span className="font-bold">{nextPred.strategy_analysis}</span>
                         </p>
                      </div>
                    )}

                    {/* 第一行：六肖 + 波色 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">推荐六肖</h4>
                        <div className="flex flex-wrap gap-1">
                          {nextPred.zodiacs.map(z => (
                            <span key={z} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-600 text-sm font-bold border border-orange-100 shadow-sm">
                              {z}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">波色策略</h4>
                        <div className="flex gap-2">
                          <div className={`flex-1 rounded-lg p-2 text-center text-white text-xs font-bold shadow-sm ${waveToBg(nextPred.wave.main)}`}>
                            <span className="opacity-75 text-[10px] block">主攻</span>
                            {waveToZh(nextPred.wave.main)}
                          </div>
                          <div className={`flex-1 rounded-lg p-2 text-center text-white text-xs font-bold shadow-sm ${waveToBg(nextPred.wave.defense)} opacity-80`}>
                            <span className="opacity-75 text-[10px] block">防守</span>
                            {waveToZh(nextPred.wave.defense)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 第二行：头尾数 */}
                    <div className="flex gap-4 text-xs">
                      <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                         <span className="font-bold text-slate-500">头数</span>
                         <div className="flex gap-1">
                           {nextPred.heads.map(h => <span key={h} className="font-mono font-bold text-slate-700">{h}</span>)}
                         </div>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                         <span className="font-bold text-slate-500">尾数</span>
                         <div className="flex gap-1">
                           {nextPred.tails.map(t => <span key={t} className="font-mono font-bold text-slate-700">{t}</span>)}
                         </div>
                      </div>
                    </div>

                    {/* 第三行：18码 */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider text-center">精选 18 码</h4>
                      <div className="flex flex-wrap gap-2 justify-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        {nextPred.numbers.map((num, i) => (
                           <NumberBall key={i} num={num} size="md" showZodiac={true} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 w-full">
                     <p className="text-slate-400 text-sm mb-3">等待 Bot 指令生成...</p>
                     <div className="h-1.5 w-24 bg-slate-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-indigo-500 w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div>
                     </div>
                  </div>
                )}
                
                <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">仅供娱乐参考，理性购彩</p>
                </div>
              </div>
            </div>

            {/* 上期成绩验证 (详细版) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                  <h3 className="text-slate-400 text-xs font-bold uppercase ml-1 flex items-center gap-2">
                    <span>上期成绩单</span>
                    <span className="h-px w-10 bg-slate-200"></span>
                  </h3>
                  <button 
                     onClick={() => setShowPredHistory(true)}
                     className="text-xs text-indigo-500 font-bold hover:text-indigo-600 transition-colors flex items-center gap-1"
                   >
                     查看记录 &rarr;
                   </button>
              </div>
              
              {data?.latestRecord && lastPred ? (
                 (() => {
                   const result = verifyResult(data.latestRecord, lastPred);
                   return (
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                         <span className="font-bold text-slate-700 text-sm">第 {data.latestRecord.expect} 期</span>
                         <div className="flex gap-2">
                           {result.isSpecialHit && (
                             <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold border border-yellow-200">特码命中</span>
                           )}
                           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                             18码中 {result.numbersHits.length}
                           </span>
                         </div>
                       </div>

                       <div className="p-4 space-y-4">
                         <div className="grid grid-cols-4 gap-2 text-center text-xs">
                           <div className={`p-2 rounded-lg border ${result.zodiacHit ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             <div className="font-bold mb-1">六肖</div>
                             <div>{result.zodiacHit ? '命中' : '未中'}</div>
                           </div>
                           <div className={`p-2 rounded-lg border ${result.waveHit ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             <div className="font-bold mb-1">波色</div>
                             <div>{result.waveHit ? '命中' : '未中'}</div>
                           </div>
                           <div className={`p-2 rounded-lg border ${result.headHit ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             <div className="font-bold mb-1">头数</div>
                             <div>{result.headHit ? '命中' : '未中'}</div>
                           </div>
                           <div className={`p-2 rounded-lg border ${result.tailHit ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             <div className="font-bold mb-1">尾数</div>
                             <div>{result.tailHit ? '命中' : '未中'}</div>
                           </div>
                         </div>
                         
                         <div>
                           <p className="text-xs text-slate-400 mb-2 ml-1">特码结果: <span className="font-bold text-slate-700">{result.specialCode} ({result.specialZodiac})</span></p>
                           <div className="flex flex-wrap gap-2">
                             {lastPred.numbers.map((n, i) => {
                               const isHit = result.numbersHits.includes(n);
                               const isSpecial = n === result.specialCode;
                               return (
                                 <NumberBall 
                                    key={`pred-${i}`} 
                                    num={n} 
                                    size="sm" 
                                    highlight={isSpecial} 
                                    dim={!isHit} 
                                  />
                               );
                             })}
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })()
              ) : (
                <div className="text-center text-slate-400 text-sm py-8 bg-white rounded-xl border border-dashed border-slate-200">
                  <p>暂无上期验证数据</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="absolute bottom-0 w-full text-center py-6 text-xs text-slate-400">
        <p>© 2024 AI Lottery Prophet</p>
      </footer>
    </div>
  );
}
