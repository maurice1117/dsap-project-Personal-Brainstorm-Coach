import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { buildPrompt, GenerateIdeasInput } from '@/lib/promptBuilder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    hours_per_week: z.number().min(1)
  }),
  constraints: z.array(z.string()).optional(),
  goal: z.string().min(1, "Goal is required"),
  user_notes: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 驗證 Input
    const validatedData = GenerateIdeasInputSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: "Invalid input format", 
          details: validatedData.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Phase 2: 組裝 Prompt
    const { systemPrompt, userPrompt } = buildPrompt(validatedData.data as GenerateIdeasInput);

    // Phase 3 & 4: 呼叫 LLM API 並確保回傳 JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const llmOutput = completion.choices[0].message.content;

    if (!llmOutput) {
      throw new Error("LLM 回傳內容為空");
    }

    // 解析 JSON
    const parsedData = JSON.parse(llmOutput);

    return NextResponse.json(
      { 
        message: "Success", 
        data: parsedData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
