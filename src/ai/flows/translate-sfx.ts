'use server';

/**
 * @fileOverview An AI agent that translates onomatopoeia and sound effects (SFX) from a block of text.
 *
 * - translateSfx - A function that handles the SFX translation process for multiple SFX in a text.
 * - TranslateSfxInput - The input type for the translateSfx function.
 * - TranslateSfxOutput - The return type for the translateSfx function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSfxInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The full original text containing one or more sound effects to be translated.'
    ),
  language: z
    .string()
    .describe('The target language for the translation, e.g., "Spanish".'),
});
export type TranslateSfxInput = z.infer<typeof TranslateSfxInputSchema>;

const SfxTranslationSuggestionSchema = z.object({
  originalSfx: z
    .string()
    .describe('The original sound effect found in the text (without asterisks).'),
  suggestions: z
    .array(z.string())
    .describe(
      'A list of 3-5 creative and contextually appropriate translations for this specific SFX.'
    ),
});

const TranslateSfxOutputSchema = z.object({
  sfxTranslations: z
    .array(SfxTranslationSuggestionSchema)
    .describe(
      'A list of translation suggestions for each sound effect found in the text.'
    ),
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
Your task is to analyze the provided text, identify all the sound effects (which are formatted as '* SFX_TEXT' on their own line), and for each one, provide a list of 3-5 creative and impactful translations into {{language}}.
The response should only include translations for the SFX, not for the rest of the dialogue.
Consider the full context of the text to provide the most fitting suggestions for each SFX.

Original Text:
{{{text}}}
`,
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
