
// File: functions/api/data.ts
import { Env, LotteryType } from '../types';

type PagesFunction<T = unknown> = (context: {
  request: Request;
  env: T;
  params: any;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get('type') as LotteryType;

  if (!type || !Object.values(LotteryType).includes(type)) {
    return new Response('Invalid type', { status: 400 });
  }

  try {
    const latestRecord = await env.DB.prepare(
      `SELECT * FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 1`
    ).bind(type).first();

    const latestPrediction = await env.DB.prepare(
      `SELECT * FROM predictions WHERE lottery_type = ? ORDER BY target_expect DESC LIMIT 1`
    ).bind(type).first();

    // 保留 logic 以兼容旧前端代码，但也查询详细的历史列表
    let lastPrediction = null;
    if (latestRecord) {
      lastPrediction = await env.DB.prepare(
        `SELECT * FROM predictions WHERE lottery_type = ? AND target_expect = ?`
      ).bind(type, latestRecord.expect).first();
    }

    const history = await env.DB.prepare(
      `SELECT * FROM lottery_records WHERE lottery_type = ? ORDER BY expect DESC LIMIT 50`
    ).bind(type).all();

    // 新增：获取最近 20 期预测记录，用于前端复盘
    const predictionHistory = await env.DB.prepare(
      `SELECT * FROM predictions WHERE lottery_type = ? ORDER BY target_expect DESC LIMIT 20`
    ).bind(type).all();

    return new Response(JSON.stringify({
      latestRecord,
      latestPrediction,
      lastPrediction,
      history: history.results,
      predictionHistory: predictionHistory.results // 返回预测列表
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
