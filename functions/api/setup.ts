
import { Env } from '../types';

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
  
  // 改用 batch 替代 exec，避免某些环境下 exec 返回值处理导致的 duration 读取错误
  // 将 SQL 拆分为独立的语句数组
  const statements = [
    "DROP TABLE IF EXISTS lottery_records",
    `CREATE TABLE lottery_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lottery_type TEXT NOT NULL,
      expect TEXT NOT NULL,
      open_code TEXT NOT NULL,
      open_time TEXT,
      wave TEXT,
      zodiac TEXT,
      UNIQUE(lottery_type, expect)
    )`,
    "DROP TABLE IF EXISTS predictions",
    `CREATE TABLE predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lottery_type TEXT NOT NULL,
      target_expect TEXT NOT NULL,
      prediction_numbers TEXT,
      created_at INTEGER,
      UNIQUE(lottery_type, target_expect)
    )`
  ];

  try {
    // 准备所有语句
    const prepared = statements.map(sql => env.DB.prepare(sql));
    
    // 批量执行 (在一个事务中运行)
    await env.DB.batch(prepared);
    
    return new Response("✅ 数据库初始化成功 (Batch模式)！表结构已创建。", {
      headers: { "content-type": "text/plain;charset=UTF-8" }
    });
  } catch (e: any) {
    return new Response(`❌ 初始化失败: ${e.message}`, {
      status: 500,
      headers: { "content-type": "text/plain;charset=UTF-8" }
    });
  }
};
