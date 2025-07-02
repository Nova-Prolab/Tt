'use server';

/**
 * @fileOverview An AI agent for suggesting translation improvements for Manhwa text.
 *
 * - suggestTranslationImprovements - A function that suggests improvements to a given translation.
 * - SuggestTranslationImprovementsInput - The input type for the suggestTranslationImprovements function.
 * - SuggestTranslationImprovementsOutput - The return type for the suggestTranslationImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTranslationImprovementsInputSchema = z.object({
  originalText: z
    .string()
    .describe('The original text from the Manhwa panel.'),
  translatedText: z
    .string()
    .describe('The current translated text to be improved.'),
  context: z
    .string()
    .optional()
    .describe('Additional context about the Manhwa panel or scene.'),
  previousContext: z
    .string()
    .optional()
    .describe('Text from the previous panel for better context.'),
});
export type SuggestTranslationImprovementsInput = z.infer<
  typeof SuggestTranslationImprovementsInputSchema
>;

const SuggestTranslationImprovementsOutputSchema = z.object({
  improvedTranslation: z
    .string()
    .describe('The improved translation suggestion.'),
  explanation: z
    .string()
    .describe('An explanation of why the translation was improved.'),
});
export type SuggestTranslationImprovementsOutput = z.infer<
  typeof SuggestTranslationImprovementsOutputSchema
>;

export async function suggestTranslationImprovements(
  input: SuggestTranslationImprovementsInput
): Promise<SuggestTranslationImprovementsOutput> {
  return suggestTranslationImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTranslationImprovementsPrompt',
  input: {schema: SuggestTranslationImprovementsInputSchema},
  output: {schema: SuggestTranslationImprovementsOutputSchema},
  prompt: `You are an expert Manhwa translator. You will be given the original text from a Manhwa panel, a current translation, and optional context.
Your task is to provide an improved translation and explain why the translation was improved. Respond in Spanish.

Original Text: {{{originalText}}}
Current Translation: {{{translatedText}}}
{{#if context}}
Context: {{{context}}}
{{/if}}
{{#if previousContext}}
Previous Panel Text: {{{previousContext}}}
{{/if}}

Improved Translation:`, 
});

const suggestTranslationImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestTranslationImprovementsFlow',
    inputSchema: SuggestTranslationImprovementsInputSchema,
    outputSchema: SuggestTranslationImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
