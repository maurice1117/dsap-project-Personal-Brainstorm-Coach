import { z } from 'zod';

export const RefineActionSchema = z.enum([
  'deep_dive',
  'make_easier',
  'make_creative',
  'strengthen_ds_algo',
  'development_plan',
  'report_outline',
]);

export type RefineAction = z.infer<typeof RefineActionSchema>;

export const REFINE_ACTION_LABELS: Record<RefineAction, string> = {
  deep_dive: '深入這個點子',
  make_easier: '降低難度',
  make_creative: '讓它更有創意',
  strengthen_ds_algo: '加強資料結構 / 演算法',
  development_plan: '產生開發計畫',
  report_outline: '產生報告大綱',
};

export const RefineIdeaOutputSchema = z.object({
  action_label: z.string().min(1),
  refined_summary: z.string().min(1),
  recommended_changes: z.array(z.string().min(1)).min(2).max(5),
  next_steps: z.array(z.string().min(1)).min(3).max(6),
  report_outline: z.array(z.string().min(1)).min(3).max(6),
  tradeoffs: z.array(z.string().min(1)).min(1).max(4),
});

export type RefineIdeaOutput = z.infer<typeof RefineIdeaOutputSchema>;

export function parseRefineIdeaOutput(rawOutput: string): RefineIdeaOutput {
  const parsedOutput: unknown = JSON.parse(rawOutput);
  return RefineIdeaOutputSchema.parse(parsedOutput);
}
