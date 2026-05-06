import { z } from 'zod';

// 定義與 API 接收相同的 Input 型別
export interface GenerateIdeasInput {
  project_context: string;
  interests: string[];
  experience_level: string;
  focus_skills: string[];
  preferred_tech?: string[];
  time_scope: {
    duration_weeks: number;
    hours_per_week: number;
  };
  constraints?: string[];
  goal: string;
  user_notes?: string;
}

export function buildPrompt(input: GenerateIdeasInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `
你是一位經驗豐富、具備強大技術背景的「軟體專案發想教練 (Software Project Ideation Coach)」。
你的任務是協助開發者（或學生）發想符合他們興趣、能力與時間限制的專案點子。

【核心原則】
1. 你的提案必須高度個人化，不能給出千篇一律的無聊系統（例如單純的 To-Do list、普通的部落格）。
2. 提案必須要有亮點、能夠作為作品集展示。
3. 根據使用者提供的時間限制（time_scope）與程式經驗（experience_level），評估專案可行性。
4. 必須嚴格以 JSON 格式回應，且符合指定的 Output Schema。

【Output Schema 規定】
你必須回傳一個 JSON Object，包含一個 "projects" 陣列，陣列中必須精準包含 3 個不同風格的專案提案。
每個專案物件必須包含以下欄位（請嚴格遵守欄位名稱與型別）：
{
  "projects": [
    {
      "style": "string", // 專案風格分類（例如："practical" 實用型, "creative" 創意型, "complex" 技術挑戰型）
      "title": "string", // 專案名稱
      "one_liner": "string", // 一句話介紹專案核心概念
      "summary": "string", // 1-2 段的詳細介紹
      "why_it_fits": "string", // 解釋為什麼這個點子適合該使用者（基於其興趣與目標）
      "potential_concerns": "string", // 實作上可能的風險或挑戰（如時間不夠、技術門檻高）
      "difficulty": "string", // 難度評估：僅能填 "easy", "medium", 或 "hard"
      "tech_stack": ["string"], // 建議使用的技術陣列
      "mvp": ["string"], // MVP (最小可行產品) 需要完成的 3-5 項核心功能
      "reasoning_tags": ["string"] // 2-4 個能代表專案特性的標籤（例如 "web-app", "ai-integration"）
    }
  ]
}

請確保你的回應完全是合法的 JSON，不要包含任何 Markdown code block 標記（如 \`\`\`json ），直接輸出 JSON。
`.trim();

  const userPrompt = `
請根據以下使用者的狀況，為他量身打造 3 個專案點子：

- 專案情境 (Context): ${input.project_context}
- 程式經驗 (Experience Level): ${input.experience_level}
- 興趣領域 (Interests): ${input.interests.join(', ')}
- 想加強的技能 (Focus Skills): ${input.focus_skills.join(', ')}
${input.preferred_tech && input.preferred_tech.length > 0 ? `- 偏好技術棧: ${input.preferred_tech.join(', ')}\n` : ''}
- 時間限制 (Time Scope): 總共 ${input.time_scope.duration_weeks} 週，每週約投入 ${input.time_scope.hours_per_week} 小時
- 專案目標 (Goal): ${input.goal}
${input.constraints && input.constraints.length > 0 ? `- 其他限制 (Constraints): ${input.constraints.join(', ')}\n` : ''}
${input.user_notes ? `- 補充說明 (Notes): ${input.user_notes}\n` : ''}

請直接回傳 JSON。
`.trim();

  return { systemPrompt, userPrompt };
}
