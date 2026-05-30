import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI, {
  APIConnectionTimeoutError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from 'openai';
import { parseGenerateIdeasOutput } from '@/lib/ideaOutput';
import { buildPrompt, GenerateIdeasInput } from '@/lib/promptBuilder';

const LLM_REQUEST_TIMEOUT_MS = 10_000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: LLM_REQUEST_TIMEOUT_MS,
  maxRetries: 0,
});

// 定義符合 PROJECT_SPEC.md 的 Input Schema
const GenerateIdeasInputSchema = z.object({
  project_context: z.string().min(1, "Project context is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  experience_level: z.string().min(1, "Experience level is required"),
  focus_skills: z.array(z.string()).min(1, "At least one focus skill is required"),
  preferred_tech: z.array(z.string()).optional(),
  time_scope: z.object({
    duration_weeks: z.number().min(1),
    hours_per_week: z.number().min(1),
  }),
  constraints: z.array(z.string()).optional(),
  goal: z.string().min(1, "Goal is required"),
  user_notes: z.string().optional(),
});

type ErrorResponse = {
  error: string;
  code: string;
  details?: unknown;
};

function errorResponse(body: ErrorResponse, status = 500) {
  return NextResponse.json(body, { status });
}

function getServerErrorResponse(error: unknown) {
  if (error instanceof APIConnectionTimeoutError) {
    return errorResponse({
      error: "LLM 回應逾時，請稍後再試。",
      code: "LLM_TIMEOUT",
    });
  }

  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    return errorResponse({
      error: "LLM 服務驗證失敗，請確認 API Key 設定。",
      code: "LLM_AUTH_ERROR",
    });
  }

  if (error instanceof RateLimitError) {
    return errorResponse({
      error: "LLM 服務暫時無法使用，可能是額度不足或請求過多。",
      code: "LLM_QUOTA_OR_RATE_LIMIT",
    });
  }

  if (error instanceof SyntaxError) {
    return errorResponse({
      error: "LLM 回傳格式錯誤，請重新生成。",
      code: "LLM_INVALID_JSON",
    });
  }

  if (error instanceof z.ZodError) {
    return errorResponse({
      error: "LLM 回傳資料不符合預期格式，請重新生成。",
      code: "LLM_INVALID_OUTPUT",
      details: error.flatten().fieldErrors,
    });
  }

  return errorResponse({
    error: "伺服器發生未知錯誤，請稍後再試。",
    code: "INTERNAL_SERVER_ERROR",
  });
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
          code: "INVALID_JSON_BODY",
        },
        { status: 400 }
      );
    }

    // 驗證 Input
    const validatedData = GenerateIdeasInputSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid input format",
          code: "INVALID_INPUT",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Phase 2: 組裝 Prompt
    const { systemPrompt, userPrompt } = buildPrompt(validatedData.data as GenerateIdeasInput);

    // Phase 3: 呼叫 LLM API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }, {
      timeout: LLM_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });

    const llmOutput = completion.choices[0]?.message.content;

    if (!llmOutput) {
      throw new SyntaxError("LLM 回傳內容為空");
    }

    // Phase 4: 解析並驗證 LLM 回傳格式，避免不完整資料流向前端。
    const parsedData = parseGenerateIdeasOutput(llmOutput);

    return NextResponse.json(
      {
        message: "Success",
        data: parsedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return getServerErrorResponse(error);
  }
}
