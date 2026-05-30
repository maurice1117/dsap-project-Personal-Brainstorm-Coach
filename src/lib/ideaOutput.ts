import { z } from 'zod';

export const ProjectIdeaSchema = z.object({
  style: z.string().min(1),
  title: z.string().min(1),
  one_liner: z.string().min(1),
  summary: z.string().min(1),
  why_it_fits: z.string().min(1),
  potential_concerns: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tech_stack: z.array(z.string().min(1)).min(1),
  mvp: z.array(z.string().min(1)).min(3).max(5),
  reasoning_tags: z.array(z.string().min(1)).min(2).max(4),
});

export const GenerateIdeasOutputSchema = z.object({
  projects: z.array(ProjectIdeaSchema).length(3),
});

export type GenerateIdeasOutput = z.infer<typeof GenerateIdeasOutputSchema>;

export function parseGenerateIdeasOutput(rawOutput: string): GenerateIdeasOutput {
  const parsedOutput: unknown = JSON.parse(rawOutput);
  return GenerateIdeasOutputSchema.parse(parsedOutput);
}
