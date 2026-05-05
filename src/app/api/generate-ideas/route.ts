import { NextResponse } from 'next/server';
import { z } from 'zod';

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

    // TODO: Phase 2 - Prompt Builder
    // TODO: Phase 3 - Call LLM API
    
    // 暫時回傳 200 與 Mock Data 確認 API 暢通
    return NextResponse.json(
      { 
        message: "Input validated successfully", 
        data: validatedData.data 
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
