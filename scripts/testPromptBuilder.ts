import { buildPrompt } from '../src/lib/promptBuilder';

const mockInput = {
  project_context: "course_final",
  interests: ["web_development", "ai_tools"],
  experience_level: "intermediate",
  focus_skills: ["frontend", "api_integration"],
  preferred_tech: ["React", "Node.js"],
  time_scope: {
    duration_weeks: 4,
    hours_per_week: 8
  },
  constraints: [
    "prefer_web_app",
    "must_be_demoable"
  ],
  goal: "build something technically challenging but still feasible for a final project",
  user_notes: "希望有互動感，最好可以在線上 demo"
};

const result = buildPrompt(mockInput);

console.log("========== SYSTEM PROMPT ==========\n");
console.log(result.systemPrompt);
console.log("\n========== USER PROMPT ==========\n");
console.log(result.userPrompt);
