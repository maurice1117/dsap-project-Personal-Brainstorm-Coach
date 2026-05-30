import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { getApiErrorBody } from '@/lib/apiErrors';
import { parseGenerateIdeasOutput } from '@/lib/ideaOutput';
import { generateWithOutputRetry } from '@/lib/llmRetry';
import { buildPrompt, GenerateIdeasInput } from '@/lib/promptBuilder';

const LLM_REQUEST_TIMEOUT_MS = 60_000;
const LLM_OUTPUT_MAX_RETRIES = 2;

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
  goal: z.string().min(1, "Goal is required"),
  user_notes: z.string().optional(),
});

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

    const parsedData = await generateWithOutputRetry(async () => {
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

      return completion.choices[0]?.message.content;
    }, parseGenerateIdeasOutput, {
      maxRetries: LLM_OUTPUT_MAX_RETRIES,
    });

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
