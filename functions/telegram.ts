
// File: functions/telegram.ts
import { Env, LotteryType } from './types';
import { PredictionEngine } from './lib/prediction';
import { getZodiac, getZodiacMode } from './lib/zodiac';

type PagesFunction<T = unknown> = (context: {
  request: Request;
  env: T;
  params: any;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const status = {
     status: "Active",
     message: "Telegram Bot Function is running.",
     version: "v20.7 NoAI (CNY)",
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

    // 兼容旧版中文命令
    if (text.includes('同步') && text.includes('香港')) text = '/sync_HK';
    else if (text.includes('预测') && text.includes('香港')) text = '/predict_HK';
    else if (text.includes('列表') && text.includes('香港')) text = '/list_HK';
    
    else if (text.includes('同步') && text.includes('新澳')) text = '/sync_NEW';
    else if (text.includes('预测') && text.includes('新澳')) text = '/predict_NEW';
    else if (text.includes('列表') && text.includes('新澳')) text = '/list_NEW';
    
    else if (text.includes('同步') && text.includes('老澳')) text = '/sync_OLD';
    else if (text.includes('预测') && text.includes('老澳')) text = '/predict_OLD';
    else if (text.includes('列表') && text.includes('老澳')) text = '/list_OLD';
    
    else if (text.includes('删除记录')) text = '/del_help';

    // 解析命令
    let command = '';
    let targetTypeStr = '';
    
    if (text.startsWith('/')) {
        const raw = text.substring(1); 
        const parts = raw.split('_');
        command = '/' + parts[0];
        if (parts.length > 1) {
            targetTypeStr = raw.substring(parts[0].length + 1);
        } else {
            const spaceParts = raw.split(/\s+/);
            command = '/' + spaceParts[0];
            targetTypeStr = spaceParts[1] || '';
        }
    } else {
        return new Response('OK');
    }
    
    const resolveType = (t: string): LotteryType | null => {
      if (!t) return null;
      t = t.toUpperCase();
      if (['HK', '香港'].includes(t)) return LotteryType.HK;
      if (['NEW', 'MO_NEW', '新澳'].includes(t)) return LotteryType.MO_NEW;
      if (['OLD', 'MO_OLD', '老澳'].includes(t)) return LotteryType.MO_OLD;
      // 移除 22:30 支持
      return null;
    };

    const targetType = resolveType(targetTypeStr);

    // --- Start / ID ---
    if (command === '/start' || command === '/id' || command === '/menu' || command === '/help') {
      const isAdmin = String(chatId) === String(env.ADMIN_CHAT_ID);
      
      let msg = `🌌 <b>双子觉醒 v20.7 (NoAI CNY)</b>\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n`;
      
      if (isAdmin) {
        msg += `纯数学概率与混沌算法引擎。\n请点击下方命令进行操作：\n\n`;
        
        msg += `🇭🇰 <b>香港 (HK)</b>\n`;
        msg += `/sync_HK  🔄 同步\n`;
        msg += `/predict_HK  🔮 预测\n`;
        msg += `/list_HK  📂 记录\n\n`;
        
        msg += `🇲🇴 <b>新澳 (MO_NEW)</b>\n`;
        msg += `/sync_NEW  🔄 同步\n`;
        msg += `/predict_NEW  🔮 预测\n`;
        msg += `/list_NEW  📂 记录\n\n`;
        
        msg += `👴 <b>老澳 (MO_OLD)</b>\n`;
        msg += `/sync_OLD  🔄 同步\n`;
        msg += `/predict_OLD  🔮 预测\n`;
        msg += `/list_OLD  📂 记录\n\n`;
        
        msg += `⚙️ <b>系统</b>\n`;
        msg += `/del_help  🗑 删除指南\n`;
        
      } else {
        msg += `⚠️ 访客模式 (只读)\nID: <code>${chatId}</code>`;
      }
      
      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } });
      return new Response('OK');
    }

    if (String(chatId) !== String(env.ADMIN_CHAT_ID)) {
      return new Response('OK'); 
    }

    if (command === '/sync') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 命令格式错误，请点击菜单重试");
        return new Response('OK');
      }
      await sendMessage(env.TELEGRAM_TOKEN, chatId, `🔄 正在同步 ${targetType}...`);
      try {
        const count = await syncData(env, targetType);
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `✅ <b>${targetType} 同步完成</b>\n新增/更新: ${count} 条记录`, { parse_mode: 'HTML' });
      } catch (e: any) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 同步失败: ${e.message}`);
      }
    }

    else if (command === '/predict') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 命令格式错误，请点击菜单重试");
        return new Response('OK');
      }
      
      const { results } = await env.DB.prepare(
        "SELECT * FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 300"
      ).bind(targetType).all();

      if (!results || results.length < 50) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `❌ 数据不足 (当前${results?.length || 0}条)。请先执行 /sync_${targetTypeStr} 同步。`);
        return new Response('OK');
      }

      await sendMessage(env.TELEGRAM_TOKEN, chatId, `🤖 正在深度分析 ${targetType} 历史数据 (马年排位)...`);

      // 异步调用预测引擎 (纯算法)
      const predictionData = await PredictionEngine.generate(results as any[], targetType);
      
      const lastExpect = (results[0] as any).expect;
      const nextExpect = String(BigInt(lastExpect) + 1n);
      
      await env.DB.prepare(
        `INSERT OR REPLACE INTO predictions (lottery_type, target_expect, prediction_numbers, created_at) VALUES (?, ?, ?, ?)`
      ).bind(targetType, nextExpect, JSON.stringify(predictionData), Date.now()).run();

      const waveName = (w: string) => w === 'red' ? '🟥红' : w === 'blue' ? '🟦蓝' : '🟩绿';
      
      const msg = `🔮 <b>${targetType} 第 ${nextExpect} 期 (马年)</b>\n` +
                  `━━━━━━━━━━━━━━━━━━\n` +
                  `🤖 <b>精选 8码:</b>\n` + 
                  `<code>${predictionData.ai_eight_codes?.join(' ') || '计算中...'}</code>\n\n` +
                  `🔢 <b>18码推荐:</b>\n` +
                  `<code>${predictionData.numbers.join(' ')}</code>\n\n` +
                  `🐹 <b>六肖:</b> ${predictionData.zodiacs.join(' ')}\n` +
                  `🌊 <b>波色:</b> 主${waveName(predictionData.wave.main)} / 防${waveName(predictionData.wave.defense)}\n` +
                  `🧢 <b>头数:</b> ${predictionData.heads.join(' ')}\n` +
                  `🐾 <b>尾数:</b> ${predictionData.tails.join(' ')}\n` +
                  `━━━━━━━━━━━━━━━━━━\n` +
                  `<i>仅供参考，理性购彩</i>`;

      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML' });
    }

    else if (command === '/list') {
      if (!targetType) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, "⚠️ 格式错误");
        return new Response('OK');
      }
      const { results } = await env.DB.prepare(
        "SELECT expect, open_code, open_time FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 10"
      ).bind(targetType).all();

      if (!results.length) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, `📂 ${targetType} 暂无记录`);
      } else {
        let msg = `📂 <b>${targetType} 近10期:</b>\n\n`;
        results.forEach((r: any) => {
           const nums = r.open_code.split(',');
           const special = nums[nums.length - 1];
           // 动态判断生肖模式：传入 open_time 进行精确判定 (CNY Logic)
           const z = getZodiac(special, r.expect, r.open_time);
           msg += `<code>${r.expect}: ${r.open_code} + [${z}]</code>\n`;
        });
        await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML' });
      }
    }

    else if (command === '/del') {
      const args = text.split(/\s+/);
      if (!args[1] || !args[2]) { 
          await sendMessage(env.TELEGRAM_TOKEN, chatId, "❌ 格式: /del [彩种] [期号]"); 
          return new Response('OK'); 
      }
      const delType = resolveType(args[1]);
      if(!delType) return new Response('OK');
      
      await env.DB.prepare("DELETE FROM lottery_records WHERE lottery_type = ? AND expect = ?").bind(delType, args[2]).run();
      await sendMessage(env.TELEGRAM_TOKEN, chatId, `🗑 已删除 ${delType} #${args[2]}`);
    }

    else if (command === '/del_help') {
      const msg = `🗑 <b>删除指南</b>\n发送: <code>/del HK 2024001</code>`;
      await sendMessage(env.TELEGRAM_TOKEN, chatId, msg, { parse_mode: 'HTML' });
    }
    
    else {
      await sendMessage(env.TELEGRAM_TOKEN, chatId, "❓ 未知命令，发送 /menu 查看菜单");
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
