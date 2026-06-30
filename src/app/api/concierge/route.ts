import { NextResponse } from 'next/server';
import {
  buildConciergePlan,
  buildDeterministicReply,
  defaultConciergeProfile,
  type ConciergeMessage,
  type ConciergePlan,
  type ConciergeProfile,
} from '@/lib/conciergeEngine';
import type { AddonSku } from '@/lib/types';
import type { LanguageCode } from '@/lib/appPreferences';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ConciergeRequest {
  message?: string;
  history?: ConciergeMessage[];
  profile?: Partial<ConciergeProfile>;
  selectedAddons?: AddonSku[];
  locale?: LanguageCode;
}

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen3.7-max';

const stopoverKnowledge = [
  '产品定位：以休息室为信任锚 + 行李全托管 + 模块化城市服务，把 6-48 小时机场等待升级为轻量级目的地体验。',
  '核心痛点：时间焦虑、行李焦虑、决策焦虑、体验焦虑。',
  'MVP 必须覆盖三档套餐：轻享包、微游包、过夜包。',
  '轻享包：6-8 小时中转，休息室 3h + 行李寄存 + 快速安检，¥260-320。',
  '微游包：10-18 小时白天中转，休息室 2h + 行李全托管 + 城市 4h 游 + 接送 + 误机保障，¥680-880。',
  '过夜包：12-36 小时跨夜中转，休息室 1h + 行李托管 + 酒店/钟点房 + 接送，¥780-1200。',
  '行李全托管：中转柜台收件，RFID + 拍照登记 + 用户签字，15 分钟内转运至合作贵宾厅/酒店，每件最高 ¥5000 行李险。',
  '城市微游：固定时段、固定路线、专车 + 中文/英文向导 + 误时保护，原则是景点集中、避开高峰、确保 60 分钟前回到安检口。',
  '增值项：eSIM、接送机、酒店钟点房、淋浴/睡眠舱、机场餐饮券、私人包车。',
  'AI 团餐匹配：订票/选套餐时基于停留时段、E/I 社交偏好、能量水平、同行人数和返场缓冲，推荐机场内或城市内团餐；夜间优先安全近距，白天优先本地特色，低能量优先少步行低打扰，高能量可推荐拼团和城市餐食。',
  '误机保障：如我方城市游/酒店/接送导致登机前 60 分钟未到安检口，自动启动改签协助、酒店餐食赔付，客服 5 分钟内介入。',
  '竞品差异：不绑定单一航司，机场内外全链路，行李全托管，3 档套餐 + 增值项，按多枢纽复制。',
  '首个 PoC 枢纽建议新加坡樟宜，中文友好、机场生态成熟、城市路线集中。',
].join('\n');

function sanitizeHistory(history: ConciergeMessage[] | undefined) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-10)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1200),
    }));
}

function buildMessages(
  body: ConciergeRequest,
  profile: ConciergeProfile,
  plan: ConciergePlan,
) {
  const history = sanitizeHistory(body.history);
  const message = body.message?.trim() || '请根据我的中转情况推荐方案';
  const locale = body.locale === 'en-US' ? 'en-US' : 'zh-CN';

  return [
    {
      role: 'system',
      content: [
        '你是 Stopover 中转游 App 的后台 LLM 礼宾大脑，不是营销文案生成器。',
        locale === 'en-US'
          ? 'You must answer in concise, business-specific English, like an airport concierge: concrete, short and action-oriented.'
          : '你必须用简体中文回答，像机场现场礼宾：具体、短句、有业务动作。',
        '你具备三类能力：多轮对话槽位追踪、PRD 知识问答、机场中转权益产品礼宾推荐。',
        '不要声称真实出票或真实扣款；这是 demo，但业务规则要按真实产品解释。',
        '回答必须围绕：中转时长、行李托管、套餐权益、城市路线、增值项、履约保障。',
        '当用户问知识类问题，直接依据产品知识回答；当用户问预订类问题，推动下一步确认。',
        '不要输出 Markdown 表格。每次最多 4 句，除非用户要求详细说明。',
        '',
        'Stopover 产品知识：',
        stopoverKnowledge,
      ].join('\n'),
    },
    {
      role: 'system',
      content: JSON.stringify(
        {
          current_profile: profile,
          deterministic_plan: plan,
          response_rules: [
            '如果用户补充了新约束，优先承认并调整口径。',
            '如果 deterministic_plan 已给出 packageName 和 routeName，应使用它，不要编造其他 SKU。',
            '若信息不足，最多问 1 个关键问题，并给出默认推荐。',
            '涉及行李和误机保障时要给出 RFID、60/90 分钟、最高 ¥5000/件等硬规则。',
          ],
        },
        null,
        2,
      ),
    },
    ...history,
    {
      role: 'user',
      content: message,
    },
  ];
}

async function callModel(body: ConciergeRequest, profile: ConciergeProfile, plan: ConciergePlan) {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.COMPATIBLE_API_KEY;
  const locale = body.locale === 'en-US' ? 'en-US' : 'zh-CN';
  const fallback = buildDeterministicReply(plan, locale);

  if (!apiKey) {
    return { reply: fallback, source: 'fallback:no-key' };
  }

  const baseUrl = process.env.COMPATIBLE_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.DEFAULT_MODEL || DEFAULT_MODEL;
  const temperature = Number(process.env.MODEL_TEMPERATURE ?? 0.2);
  const timeoutMs = Math.max(1000, Number(process.env.LLM_CALL_TIMEOUT ?? 10) * 1000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(body, profile, plan),
        temperature,
        max_tokens: 360,
        stream: false,
        enable_thinking: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      console.warn('DashScope concierge call failed', response.status, detail.slice(0, 240));
      return { reply: fallback, source: `fallback:http-${response.status}` };
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    return {
      reply: reply || fallback,
      source: reply ? `dashscope:${model}` : 'fallback:empty',
    };
  } catch (error) {
    console.warn('DashScope concierge call errored', error);
    return { reply: fallback, source: 'fallback:error' };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ConciergeRequest;
  const message = body.message?.trim() || '';
  const { profile, plan } = buildConciergePlan(
    message,
    body.profile ?? defaultConciergeProfile,
    body.selectedAddons ?? [],
  );
  const result = await callModel(body, profile, plan);

  return NextResponse.json({
    ...result,
    profile,
    plan,
    recommendations: {
      packageSku: plan.packageSku,
      packageName: plan.packageName,
      airportCode: plan.airportCode,
      addons: plan.recommendedAddons,
      routeId: plan.routeId,
    },
  });
}
