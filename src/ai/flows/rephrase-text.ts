'use server';

/**
 * @fileOverview An AI agent that rephrases text based on a specified style.
 *
 * - rephraseText - A function that handles the rephrasing process.
 * - RephraseTextInput - The input type for the rephraseText function.
 * - RephraseTextOutput - The return type for the rephraseText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RephraseTextInputSchema = z.object({
  text: z.string().describe('The text to be rephrased.'),
  style: z.string().describe('The target style for the rephrasing (e.g., "more formal", "more casual", "simpler for a younger audience", "more poetic").'),
  language: z.string().describe('The language of the text, e.g., "Spanish".'),
});
export type RephraseTextInput = z.infer<typeof RephraseTextInputSchema>;

const RephraseTextOutputSchema = z.object({
  rephrasedText: z.string().describe('The rephrased text in the requested style.'),
  explanation: z.string().describe('A brief explanation of the changes made to achieve the target style.'),
});
export type RephraseTextOutput = z.infer<typeof RephraseTextOutputSchema>;

export async function rephraseText(
  input: RephraseTextInput
): Promise<RephraseTextOutput> {
  return rephraseTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rephraseTextPrompt',
  input: {schema: RephraseTextInputSchema},
  output: {schema: RephraseTextOutputSchema},
  prompt: `You are an expert editor and writer. Your task is to rephrase the given text to match a specific style, while preserving the core meaning.
Your response must be in {{language}}.

Target Style: {{style}}

Text to rephrase:
{{{text}}}
`,
});

const rephraseTextFlow = ai.defineFlow(
  {
    name: 'rephraseTextFlow',
    inputSchema: RephraseTextInputSchema,
    outputSchema: RephraseTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
