'use server';

/**
 * @fileOverview An AI agent that analyzes the formality level of a given text.
 *
 * - analyzeFormality - A function that handles the formality analysis process.
 * - AnalyzeFormalityInput - The input type for the analyzeFormality function.
 * - AnalyzeFormalityOutput - The return type for the analyzeFormality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFormalityInputSchema = z.object({
  text: z.string().describe('The text to be analyzed.'),
  language: z.string().describe('The language the analysis should be in, e.g., "Spanish".'),
});
export type AnalyzeFormalityInput = z.infer<typeof AnalyzeFormalityInputSchema>;

const AnalyzeFormalityOutputSchema = z.object({
  formality: z.string().describe('A single word describing the formality of the text (e.g., Formal, Informal, Neutral, Casual).'),
  explanation: z.string().describe('A brief explanation for the identified formality level, mentioning specific words or phrases.'),
});
export type AnalyzeFormalityOutput = z.infer<typeof AnalyzeFormalityOutputSchema>;

export async function analyzeFormality(
  input: AnalyzeFormalityInput
): Promise<AnalyzeFormalityOutput> {
  return analyzeFormalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFormalityPrompt',
  input: {schema: AnalyzeFormalityInputSchema},
  output: {schema: AnalyzeFormalityOutputSchema},
  prompt: `You are an expert in linguistics and cultural nuances, specializing in dialogue. Analyze the formality level of the following text.
Your response must be in {{language}}.

Text to analyze:
{{{text}}}

Identify the primary formality level (e.g., Formal, Informal, Neutral, Casual, etc.) and provide a brief explanation for your analysis, pointing out specific words or grammar that indicate this level.`,
});

const analyzeFormalityFlow = ai.defineFlow(
  {
    name: 'analyzeFormalityFlow',
    inputSchema: AnalyzeFormalityInputSchema,
    outputSchema: AnalyzeFormalityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
