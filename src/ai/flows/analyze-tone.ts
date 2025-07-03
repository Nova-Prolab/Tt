'use server';

/**
 * @fileOverview An AI agent that analyzes the tone of a given text.
 *
 * - analyzeTone - A function that handles the tone analysis process.
 * - AnalyzeToneInput - The input type for the analyzeTone function.
 * - AnalyzeToneOutput - The return type for the analyzeTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeToneInputSchema = z.object({
  text: z.string().describe('The text to be analyzed.'),
  language: z.string().describe('The language the analysis should be in, e.g., "Spanish".'),
});
export type AnalyzeToneInput = z.infer<typeof AnalyzeToneInputSchema>;

const AnalyzeToneOutputSchema = z.object({
  tone: z.string().describe('A single word describing the tone of the text (e.g., Sarcastic, Joyful, Angry).'),
  explanation: z.string().describe('A brief explanation for the identified tone.'),
});
export type AnalyzeToneOutput = z.infer<typeof AnalyzeToneOutputSchema>;

export async function analyzeTone(
  input: AnalyzeToneInput
): Promise<AnalyzeToneOutput> {
  return analyzeToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTonePrompt',
  input: {schema: AnalyzeToneInputSchema},
  output: {schema: AnalyzeToneOutputSchema},
  prompt: `You are a literary analyst specializing in dialogue. Analyze the tone of the following text.
Your response must be in {{language}}.

Text to analyze:
{{{text}}}

Identify the primary tone (e.g., Sarcastic, Joyful, Angry, Neutral) and provide a brief explanation for your analysis.`,
});

const analyzeToneFlow = ai.defineFlow(
  {
    name: 'analyzeToneFlow',
    inputSchema: AnalyzeToneInputSchema,
    outputSchema: AnalyzeToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
