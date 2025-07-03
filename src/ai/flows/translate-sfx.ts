'use server';

/**
 * @fileOverview An AI agent that translates onomatopoeia and sound effects (SFX).
 *
 * - translateSfx - A function that handles the SFX translation process.
 * - TranslateSfxInput - The input type for the translateSfx function.
 * - TranslateSfxOutput - The return type for the translateSfx function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSfxInputSchema = z.object({
  sfx: z.string().describe('The sound effect to be translated (e.g., 쿵,쾅).'),
  context: z.string().optional().describe('The context of the scene where the SFX appears.'),
  language: z.string().describe('The target language for the translation, e.g., "Spanish".'),
});
export type TranslateSfxInput = z.infer<typeof TranslateSfxInputSchema>;

const TranslateSfxOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of creative and contextually appropriate SFX translations.'),
});
export type TranslateSfxOutput = z.infer<typeof TranslateSfxOutputSchema>;

export async function translateSfx(
  input: TranslateSfxInput
): Promise<TranslateSfxOutput> {
  return translateSfxFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateSfxPrompt',
  input: {schema: TranslateSfxInputSchema},
  output: {schema: TranslateSfxOutputSchema},
  prompt: `You are a professional Manhwa translator specializing in onomatopoeia and sound effects (SFX).
Your task is to provide a list of creative and impactful translations for the given SFX into {{language}}.
Consider the context of the scene to provide the most fitting suggestions.

Original SFX: {{{sfx}}}
{{#if context}}
Scene Context: {{{context}}}
{{/if}}

Provide a list of 3-5 diverse and creative translation suggestions.`,
});

const translateSfxFlow = ai.defineFlow(
  {
    name: 'translateSfxFlow',
    inputSchema: TranslateSfxInputSchema,
    outputSchema: TranslateSfxOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
