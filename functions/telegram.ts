
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
  persistent_keyboard: true
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const status = {
     status: "Active",
     message: "Telegram Bot Function is running.",
     version: "v14.0 Singularity (15-Strategy Matrix)",
     timestamp: new Date().toISOString()
  };
  return new Response(JSON.stringify(status, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    if (!env.TELEGRAM_TOKEN) return new Response("Configuration Error", { status: 500 });

    const body: any = await request.json();
    if (!body.message) return new Response('OK');

    const chatId = body.message.chat.id;
    let text = (body.message.text || '').trim();

    // 简单的命令别名处理
    if (text.includes('同步')) text = text.replace('🔄 ', '').replace('同步 ', '/sync ');
    else if (text.includes('预测')) text = text.replace('🔮 ', '').replace('预测 ', '/predict ');
    else if (text.includes('列表')) text = text.replace('📂 ', '').replace('列表 ', '/list ');
    else if (text.includes('删除记录')) text = '/del_help';
    
    text = text.replace(' 2230', ' MO_OLD_2230'); 
    text = text.replace(' 香港', ' HK');
    text = text.replace(' 新澳', ' MO_NEW');
    text = text.replace(' 老澳', ' MO_OLD');
    
    const args = text.split(/\s+/);
    const command = args[0];
    const rawType = args[1]?.toUpperCase();

    // --- Start / ID ---
    if (command === '/start' || command === '/id') {
      const isAdmin = String(chatId) === String(env.ADMIN_CHAT_ID);
      let msg = `👋 <b>彩票助手 v14.0 (Singularity)</b>\n\n`;
      msg += `🆔 您的ID: <code>${chatId}</code>\n`;
      msg += `⚙️ 状态: ${isAdmin ? '✅ 管理员' : '⚠️ 访客 (只读)'}`;
      
      if (isAdmin) {
        msg += `\n\n奇点引擎已就绪 (15大确定性策略矩阵 | 智能权重)，请使用下方菜单操作 👇`;
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      } else {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML' });
      }
      return new Response('OK');
    }

    if (String(chatId) !== String(env.ADMIN_CHAT_ID)) {
      return new Response('OK'); 
    }

    const resolveType = (t: string): LotteryType | null => {
      if (!t) return null;
      if (['HK', '香港'].includes(t)) return LotteryType.HK;
      if (['NEW', 'MO_NEW', '新澳'].includes(t)) return LotteryType.MO_NEW;
      if (['OLD', 'MO_OLD', '老澳'].includes(t)) return LotteryType.MO_OLD;
      if (['2230', 'MO_OLD_2230'].includes(t)) return LotteryType.MO_OLD_2230;
      return null;
    };

    const targetType = resolveType(rawType);

    if (command === '/menu' || command === '/help') {
      await sendMessage(env.TELEGRAM_TOKEN, chatId, "🎮 <b>控制面板</b>", { 
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
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `✅ <b>${targetType} 同步成功</b>\n更新: ${count} 条记录`, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      } catch (e: any) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 同步失败: ${e.message}`, { reply_markup: MENU_KEYBOARD });
      }
    }

    else if (command === '/predict') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 请选择彩种", { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }
      
      // 获取 300 条记录以支持统计学算法 (马尔可夫链、k-NN等)
      const { results } = await env.DB.prepare(
        "SELECT * FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 300"
      ).bind(targetType).all();

      if (!results || results.length < 80) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 历史数据不足 (当前${results?.length || 0}条，需>80条)。请先多次同步。`, { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }

      // 启动 v14.0 引擎
      const predictionData = PredictionEngine.generate(results as any[], targetType);
      
      const lastExpect = (results[0] as any).expect;
      const nextExpect = String(BigInt(lastExpect) + 1n);
      
      await env.DB.prepare(
        `INSERT OR REPLACE INTO predictions (lottery_type, target_expect, prediction_numbers, created_at) VALUES (?, ?, ?, ?)`
      ).bind(targetType, nextExpect, JSON.stringify(predictionData), Date.now()).run();

      const waveName = (w: string) => w === 'red' ? '🟥红' : w === 'blue' ? '🟦蓝' : '🟩绿';
      
      const strategyInfo = predictionData.strategy_analysis 
        ? `\n🧠 <b>AI 决策 (加权回测):</b>\n${predictionData.strategy_analysis}` 
        : '';

      const msg = `✅ <b>${targetType} 第 ${nextExpect} 期预测</b>\n` +
                  `------------------------------\n` +
                  `🐹 <b>六肖:</b> ${predictionData.zodiacs.join(' ')}\n` +
                  `🌊 <b>波色:</b> 主${waveName(predictionData.wave.main)} / 防${waveName(predictionData.wave.defense)}\n` +
                  `🔢 <b>18码:</b> ${predictionData.numbers.join(',')}\n` +
                  `------------------------------` +
                  `${strategyInfo}`;

      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }

    else if (command === '/list') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 请选择彩种", { reply_markup: MENU_KEYBOARD });
        return new Response('OK');
      }
      const { results } = await env.DB.prepare(
        "SELECT expect, open_code FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 10"
      ).bind(targetType).all();

      if (!results.length) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `📂 ${targetType} 暂无记录`, { reply_markup: MENU_KEYBOARD });
      } else {
        let msg = `📂 <b>${targetType} 近10期记录:</b>\n\n`;
        results.forEach((r: any) => {
           msg += `<b>#${r.expect}</b>: <code>${r.open_code}</code>\n`;
        });
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
      }
    }

    else if (command === '/del') {
      if (!args[2]) { await sendMessage(env.TELEGRAM_TOKEN, chatId, "❌ 格式: /del [彩种] [期号]", { reply_markup: MENU_KEYBOARD }); return new Response('OK'); }
      await env.DB.prepare("DELETE FROM lottery_records WHERE lottery_type = ? AND expect = ?").bind(targetType, args[2]).run();
      await sendMessage(env.TELEGRAM_TOKEN, chatId, `🗑 已删除 ${targetType} #${args[2]}`, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }

    else if (command === '/del_help') {
      const msg = `🗑 <b>删除指南</b>\n<code>/del HK 100</code>`;
      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: MENU_KEYBOARD });
    }
    
    else {
      await sendMessage(env.TELEGRAM_TOKEN, chatId, "❓ 未知命令", { reply_markup: MENU_KEYBOARD });
    }

    return new Response('OK');

  } catch (err: any) {
    console.error("Worker Error:", err);
    return new Response(`Error: ${err.message}`, { status: 200 }); 
  }
};

async function sendMessage(token: string, chatId: number, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ chat_id: chatId, text, ...options }) 
    });
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

async function syncData(env: Env, type: LotteryType): Promise<number> {
  let apiUrl = '';
  switch (type) {
    case LotteryType.HK: apiUrl = env.URL_HK; break;
    case LotteryType.MO_NEW: apiUrl = env.URL_MO_NEW; break;
    case LotteryType.MO_OLD: apiUrl = env.URL_MO_OLD; break;
    case LotteryType.MO_OLD_2230: apiUrl = env.URL_MO_OLD_2230; break;
  }
  if (!apiUrl) throw new Error(`未配置 API`);
  
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const json: any = await resp.json();
  const list = json.data || json; 
  if (!Array.isArray(list)) return 0;
  
  const stmt = env.DB.prepare(`
    INSERT OR IGNORE INTO lottery_records (lottery_type, expect, open_code, open_time, wave, zodiac)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const batch = [];
  for (const item of list) {
    if(!item.expect) continue;
    batch.push(stmt.bind(type, item.expect, item.openCode, item.openTime||'', item.wave||'', item.zodiac||''));
  }
  
  if (batch.length > 0) {
    let changes = 0;
    const size = 50;
    for(let i=0; i<batch.length; i+=size) {
        const res = await env.DB.batch(batch.slice(i, i+size));
        changes += res.length;
    }
    return changes;
  }
  return 0;
}
