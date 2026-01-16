
// File: functions/telegram.ts
import { Env, LotteryType } from './types';
import { PredictionEngine } from './lib/prediction';

type PagesFunction<T = unknown> = (context: {
  request: Request;
  env: T;
  params: any;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

// --- 配置：中文菜单键盘布局 ---
const MENU_KEYBOARD = {
  keyboard: [
    [
      { text: "🔄 同步 香港" }, { text: "🔮 预测 香港" }, { text: "📂 列表 香港" }
    ],
    [
      { text: "🔄 同步 新澳" }, { text: "🔮 预测 新澳" }, { text: "📂 列表 新澳" }
    ],
    [
      { text: "🔄 同步 老澳" }, { text: "🔮 预测 老澳" }, { text: "📂 列表 老澳" }
    ],
    [
      { text: "🔄 同步 2230" }, { text: "🔮 预测 2230" }, { text: "📂 列表 2230" }
    ],
    [
      { text: "🗑 删除记录" }
    ]
  ],
  resize_keyboard: true,
  persistent_keyboard: true // 保持键盘始终显示
};

// --- 辅助逻辑：映射表 ---
const ZODIACS_MAP: Record<number, string> = {};
const WAVES_MAP: Record<number, string> = {};

const initMaps = () => {
  const zodiacs = {
    '蛇': [1, 13, 25, 37, 49], '马': [12, 24, 36, 48], '羊': [11, 23, 35, 47],
    '猴': [10, 22, 34, 46], '鸡': [9, 21, 33, 45], '狗': [8, 20, 32, 44],
    '猪': [7, 19, 31, 43], '鼠': [6, 18, 30, 42], '牛': [5, 17, 29, 41],
    '虎': [4, 16, 28, 40], '兔': [3, 15, 27, 39], '龙': [2, 14, 26, 38]
  };
  for (const [z, nums] of Object.entries(zodiacs)) {
    nums.forEach(n => ZODIACS_MAP[n] = z);
  }
  const waves = {
    'red': [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
    'blue': [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
    'green': [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
  };
  for (const [w, nums] of Object.entries(waves)) {
    nums.forEach(n => WAVES_MAP[n] = w);
  }
};
initMaps();

const getZodiac = (n: number) => ZODIACS_MAP[n] || '';
const getWave = (n: number) => WAVES_MAP[n] || 'red';

// --- GET 请求: 用于浏览器诊断 ---
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const status = {
     status: "Active",
     message: "Telegram Bot Function is running.",
     env_check: {
        TELEGRAM_TOKEN: env.TELEGRAM_TOKEN ? "✅ Configured" : "❌ Missing",
        ADMIN_CHAT_ID: env.ADMIN_CHAT_ID ? "✅ Configured" : "❌ Missing",
        DB: env.DB ? "✅ Connected" : "❌ Missing",
     },
     timestamp: new Date().toISOString()
  };
  return new Response(JSON.stringify(status, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
};

// --- POST 请求: 处理 Telegram Webhook ---
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    if (!env.TELEGRAM_TOKEN) return new Response("Configuration Error", { status: 500 });

    const body: any = await request.json();
    if (!body.message) return new Response('OK');

    const chatId = body.message.chat.id;
    let text = (body.message.text || '').trim();

    // --- 0. 按钮文本转换逻辑 (Router) ---
    // 将中文按钮点击转换为内部指令
    if (text.includes('同步')) text = text.replace('🔄 ', '').replace('同步 ', '/sync ');
    else if (text.includes('预测')) text = text.replace('🔮 ', '').replace('预测 ', '/predict ');
    else if (text.includes('列表')) text = text.replace('📂 ', '').replace('列表 ', '/list ');
    else if (text.includes('删除记录')) text = '/del_help';
    
    // 兼容 "2230" 的特殊空格处理
    text = text.replace(' 2230', ' MO_OLD_2230'); // 将 "同步 2230" 转为 "/sync MO_OLD_2230"
    text = text.replace(' 香港', ' HK');
    text = text.replace(' 新澳', ' MO_NEW');
    text = text.replace(' 老澳', ' MO_OLD'); // 注意：需放在 2230 之后处理，避免误伤
    
    // 再次清理可能的多余空格
    const args = text.split(/\s+/);
    const command = args[0];
    const rawType = args[1]?.toUpperCase();

    // --- 1. 优先处理 /start 和 /id (无需权限) ---
    if (command === '/start' || command === '/id') {
      const isAdmin = String(chatId) === String(env.ADMIN_CHAT_ID);
      let msg = `👋 <b>彩票助手已就绪</b>\n\n`;
      msg += `🆔 您的ID: <code>${chatId}</code>\n`;
      msg += `⚙️ 状态: ${isAdmin ? '✅ 管理员' : '⚠️ 访客 (只读)'}`;
      
      if (isAdmin) {
        msg += `\n\n请使用下方键盘操作 👇`;
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      } else {
        msg += `\n\n请在 Cloudflare 后台配置 ADMIN_CHAT_ID 以获取操作权限。`;
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML' });
      }
      return new Response('OK');
    }

    // --- 2. 权限校验 ---
    if (String(chatId) !== String(env.ADMIN_CHAT_ID)) {
      return new Response('OK'); 
    }

    // --- 3. 解析彩种 ---
    const resolveType = (t: string): LotteryType | null => {
      if (!t) return null;
      if (['HK', '香港'].includes(t)) return LotteryType.HK;
      if (['NEW', 'MO_NEW', '新澳'].includes(t)) return LotteryType.MO_NEW;
      if (['OLD', 'MO_OLD', '老澳'].includes(t)) return LotteryType.MO_OLD;
      if (['2230', 'MO_OLD_2230'].includes(t)) return LotteryType.MO_OLD_2230;
      return null;
    };

    const targetType = resolveType(rawType);

    // --- 4. 业务逻辑 ---
    if (command === '/menu' || command === '/help') {
      await sendMessage(env.TELEGRAM_TOKEN, chatId, "🎮 <b>控制面板</b>\n点击下方按钮进行操作：", { 
        parse_mode: 'HTML', 
        reply_markup: MENU_KEYBOARD 
      });
    }

    else if (command === '/sync') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 请选择彩种", { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }
      const statusMsg = await sendMessage(env.TELEGRAM_TOKEN, chatId, `🔄 正在同步 ${targetType}...`);
      try {
        const count = await syncData(env, targetType);
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `✅ <b>${targetType} 同步成功</b>\n新增/更新: ${count} 条记录`, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      } catch (e: any) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 同步失败: ${e.message}`, { reply_markup: MENU_KEYBOARD });
      }
    }

    else if (command === '/predict') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 请选择彩种", { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }
      
      // 修改：大幅增加查询限制，由 1000 改为 2000，确保"生肖转移概率"和"历史跟随"有足够的数据进行全量分析
      // 深度统计需要大量历史样本
      const { results } = await env.DB.prepare(
        "SELECT * FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 2000"
      ).bind(targetType).all();

      if (!results || results.length === 0) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 数据库无 ${targetType} 记录，请先点击【同步】`, { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }

      // 生成复杂预测数据结构
      const predictionData = PredictionEngine.generate(results as any[], targetType);
      
      const lastExpect = (results[0] as any).expect;
      const nextExpect = String(BigInt(lastExpect) + 1n);
      
      // 存入数据库 (JSON stringify)
      await env.DB.prepare(
        `INSERT OR REPLACE INTO predictions (lottery_type, target_expect, prediction_numbers, created_at) VALUES (?, ?, ?, ?)`
      ).bind(targetType, nextExpect, JSON.stringify(predictionData), Date.now()).run();

      const waveName = (w: string) => w === 'red' ? '🟥红' : w === 'blue' ? '🟦蓝' : '🟩绿';
      
      // 构建 Telegram 消息
      const msg = `✅ <b>${targetType} 第 ${nextExpect} 期预测</b>\n` +
                  `------------------------------\n` +
                  `🐹 <b>统计生肖:</b> ${predictionData.zodiacs.join(' ')}\n` +
                  `🌊 <b>波色:</b> 主${waveName(predictionData.wave.main)} / 防${waveName(predictionData.wave.defense)}\n` +
                  `🔢 <b>18码:</b> ${predictionData.numbers.join(',')}\n` +
                  `------------------------------\n` +
                  `💡 <i>基于全量历史转移概率分析</i>`;

      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }

    else if (command === '/list') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 请选择彩种", { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }
      const { results } = await env.DB.prepare(
        "SELECT expect, open_code, open_time FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 10"
      ).bind(targetType).all();

      if (!results.length) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `📂 ${targetType} 暂无记录`, { reply_markup: MENU_KEYBOARD });
      } else {
        let msg = `📂 <b>${targetType} 近10期记录:</b>\n\n`;
        results.forEach((r: any) => {
           // 简单格式化
           msg += `<b>#${r.expect}</b>: <code>${r.open_code}</code>\n`;
        });
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      }
    }

    else if (command === '/del') {
      if (!args[2]) { await sendMessage(env.TELEGRAM_TOKEN, chatId, "❌ 格式错误，需要期号", { reply_markup: MENU_KEYBOARD }); return new Response('OK'); }
      await env.DB.prepare("DELETE FROM lottery_records WHERE lottery_type = ? AND expect = ?").bind(targetType, args[2]).run();
      await sendMessage(env.TELEGRAM_TOKEN, chatId, `🗑 已删除 <b>${targetType} #${args[2]}</b>`, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }

    else if (command === '/del_help') {
      const msg = `🗑 <b>删除记录指南</b>\n\n` +
                  `如需删除错误数据，请发送指令：\n` +
                  `<code>/del [彩种] [期号]</code>\n\n` +
                  `<b>示例：</b>\n` +
                  `删除香港第100期：\n<code>/del HK 100</code>\n` +
                  `删除新澳第2024001期：\n<code>/del MO_NEW 2024001</code>`;
      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }
    
    else {
      await sendMessage(env.TELEGRAM_TOKEN, chatId, "❓ 未知命令，请使用下方菜单。", { reply_markup: MENU_KEYBOARD });
    }

    return new Response('OK');

  } catch (err: any) {
    console.error("Worker Error:", err);
    return new Response(`Error handled: ${err.message}`, { status: 200 }); 
  }
};

// --- 通用发送消息函数 ---
async function sendMessage(token: string, chatId: number, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = { chat_id: chatId, text, ...options };
  
  try {
    const resp = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    
    if (!resp.ok) {
      console.error('Telegram API Failed:', await resp.text());
    }
    return resp;
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

async function syncData(env: Env, type: LotteryType): Promise<number> {
  // ... 同步逻辑 ...
  let apiUrl = '';
  switch (type) {
    case LotteryType.HK: apiUrl = env.URL_HK; break;
    case LotteryType.MO_NEW: apiUrl = env.URL_MO_NEW; break;
    case LotteryType.MO_OLD: apiUrl = env.URL_MO_OLD; break;
    case LotteryType.MO_OLD_2230: apiUrl = env.URL_MO_OLD_2230; break;
  }
  if (!apiUrl) throw new Error(`未配置 API 地址`);
  
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`API 请求错误 ${resp.status}`);
  const json: any = await resp.json();
  const list = json.data || json; 
  if (!Array.isArray(list)) return 0;
  
  // 修改：不再限制前10条，而是同步所有数据
  const records = list;
  
  const stmt = env.DB.prepare(`
    INSERT OR IGNORE INTO lottery_records (lottery_type, expect, open_code, open_time, wave, zodiac)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const batch = [];
  for (const item of records) {
    if(!item.expect) continue;
    batch.push(stmt.bind(type, item.expect, item.openCode, item.openTime||'', item.wave||'', item.zodiac||''));
  }
  
  if (batch.length > 0) {
    // 增加分批处理，防止单次 batch 超过 D1 限制 (通常建议 100 条左右)
    const CHUNK_SIZE = 100;
    let totalChanges = 0;
    
    for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
      const chunk = batch.slice(i, i + CHUNK_SIZE);
      try {
        const res = await env.DB.batch(chunk);
        if(Array.isArray(res)) {
          totalChanges += res.reduce((a, b: any) => a + (b.meta?.changes || 0), 0);
        } else {
          totalChanges += (res as any).meta?.changes || 0;
        }
      } catch (err) {
        console.error(`Batch sync failed at chunk ${i}:`, err);
        // 继续尝试下一个 chunk，不完全中断
      }
    }
    return totalChanges;
  }
  return 0;
}
