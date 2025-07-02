'use server';

/**
 * @fileOverview An AI agent that corrects spelling and grammar.
 *
 * - correctSpelling - A function that handles the spelling and grammar correction process.
 * - CorrectSpellingInput - The input type for the correctSpelling function.
 * - CorrectSpellingOutput - The return type for the correctSpelling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectSpellingInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
  language: z.string().describe('The language of the text, e.g., "Spanish".'),
});
export type CorrectSpellingInput = z.infer<typeof CorrectSpellingInputSchema>;

const CorrectSpellingOutputSchema = z.object({
  correctedText: z.string().describe('The text with spelling and grammar corrections.'),
});
export type CorrectSpellingOutput = z.infer<typeof CorrectSpellingOutputSchema>;

export async function correctSpelling(
  input: CorrectSpellingInput
): Promise<CorrectSpellingOutput> {
  return correctSpellingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctSpellingPrompt',
  input: {schema: CorrectSpellingInputSchema},
  output: {schema: CorrectSpellingOutputSchema},
  prompt: `You are an expert in {{language}} spelling and grammar. Correct any spelling or grammatical errors in the following text.
Preserve the original meaning, tone, and formatting. Only return the fully corrected text without any extra comments, explanations, or introductions.

Text to correct:
{{{text}}}

Corrected text:`,
});

const correctSpellingFlow = ai.defineFlow(
  {
    name: 'correctSpellingFlow',
    inputSchema: CorrectSpellingInputSchema,
    outputSchema: CorrectSpellingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
