import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { getApiErrorBody } from '@/lib/apiErrors';
import { generateWithOutputRetry } from '@/lib/llmRetry';
import { GenerateIdeasInput } from '@/lib/promptBuilder';
import { ProjectIdeaSchema } from '@/lib/ideaOutput';
import {
  REFINE_ACTION_LABELS,
  RefineAction,
  RefineActionSchema,
  parseRefineIdeaOutput,
} from '@/lib/ideaRefinement';

const LLM_REQUEST_TIMEOUT_MS = 60_000;
const LLM_OUTPUT_MAX_RETRIES = 2;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: LLM_REQUEST_TIMEOUT_MS,
  maxRetries: 0,
});

const GenerateIdeasInputSchema = z.object({
  project_context: z.string().min(1, 'Project context is required'),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
  experience_level: z.string().min(1, 'Experience level is required'),
  focus_skills: z.array(z.string()).min(1, 'At least one focus skill is required'),
  preferred_tech: z.array(z.string()).optional(),
  avoid_topics: z.array(z.string()).optional(),
  target_users: z.string().optional(),
  data_sources: z.array(z.string()).optional(),
  success_criteria: z.array(z.string()).optional(),
  preferred_output: z.string().optional(),
  course_requirements: z.array(z.string()).optional(),
  time_scope: z.object({
    duration_weeks: z.number().min(1),
    hours_per_week: z.number().min(1),
  }),
  constraints: z.array(z.string()).optional(),
  goal: z.string().min(1, 'Goal is required'),
  user_notes: z.string().optional(),
});

const RefineIdeaInputSchema = z.object({
  original_input: GenerateIdeasInputSchema,
  project: ProjectIdeaSchema,
  action: RefineActionSchema,
});

function buildRefinePrompt(input: {
  original_input: GenerateIdeasInput;
  project: z.infer<typeof ProjectIdeaSchema>;
  action: RefineAction;
}) {
  const actionLabel = REFINE_ACTION_LABELS[input.action];

  const systemPrompt = `
你是一位軟體專案發想教練，正在協助使用者針對單一專案提案做深入發想。

【任務】
根據使用者原始條件、目前選中的專案，以及指定的深入操作，產生一份可直接幫助使用者下一步決策與實作的 refinement。
所有使用者可見的文字內容都必須使用繁體中文；除非是特定術語、技術名詞、套件名稱、API 名稱、欄位名稱或程式碼識別字，才可以保留英文。

【操作意圖】
- 深入這個點子：補足產品情境、核心功能與實作重點。
- 降低難度：保留核心亮點，但縮小技術範圍與 MVP。
- 讓它更有創意：增加更有記憶點的互動或展示角度，但不可犧牲可行性。
- 加強資料結構 / 演算法：自然補強課程關聯，不能硬塞不必要的演算法。
- 產生開發計畫：輸出更具體的開發順序與可驗收里程碑。
- 產生報告大綱：協助使用者準備課程報告與 Demo 敘事。

【Output Schema】
請嚴格回傳 JSON Object，欄位如下：
{
  "action_label": "string",
  "refined_summary": "string",
  "recommended_changes": ["string"],
  "next_steps": ["string"],
  "report_outline": ["string"],
  "tradeoffs": ["string"]
}

陣列長度限制：
- recommended_changes: 2-5 項
- next_steps: 3-6 項
- report_outline: 3-6 項
- tradeoffs: 1-4 項

請直接輸出合法 JSON，不要包含 Markdown code block。JSON 欄位名稱維持英文 schema，但欄位值中的使用者可見文字必須使用繁體中文；只有特定術語可保留英文。
`.trim();

  const userPrompt = `
請針對以下專案執行「${actionLabel}」。

【使用者原始條件】
${JSON.stringify(input.original_input, null, 2)}

【目前選中的專案】
${JSON.stringify(input.project, null, 2)}

請讓回覆符合這次操作的意圖，並保留專案的使用者條件、時間限制與課程要求。所有使用者可見文字請使用繁體中文。
`.trim();

  return { systemPrompt, userPrompt };
}

function getServerErrorResponse(error: unknown) {
  return NextResponse.json(getApiErrorBody(error), { status: 500 });
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON body',
          code: 'INVALID_JSON_BODY',
        },
        { status: 400 }
      );
    }

    const validatedData = RefineIdeaInputSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: 'Invalid input format',
          code: 'INVALID_INPUT',
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildRefinePrompt(validatedData.data);

    const parsedData = await generateWithOutputRetry(async () => {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.65,
      }, {
        timeout: LLM_REQUEST_TIMEOUT_MS,
        maxRetries: 0,
      });

      return completion.choices[0]?.message.content;
    }, parseRefineIdeaOutput, {
      maxRetries: LLM_OUTPUT_MAX_RETRIES,
    });

    return NextResponse.json(
      {
        message: 'Success',
        data: parsedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refine Idea API Error:', error);
    return getServerErrorResponse(error);
  }
}
