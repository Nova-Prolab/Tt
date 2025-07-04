'use server';

/**
 * @fileOverview An AI agent that summarizes the content of a Manhwa panel.
 *
 * - summarizePanel - A function that handles the panel summarization process.
 * - SummarizePanelInput - The input type for the summarizePanel function.
 * - SummarizePanelOutput - The return type for the summarizePanel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePanelInputSchema = z.object({
  text: z.string().describe('The text from the panel to be summarized.'),
  language: z.string().describe('The language the summary should be in, e.g., "Spanish".'),
});
export type SummarizePanelInput = z.infer<typeof SummarizePanelInputSchema>;

const SummarizePanelOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided text, capturing the main point or action.'),
});
export type SummarizePanelOutput = z.infer<typeof SummarizePanelOutputSchema>;

export async function summarizePanel(
  input: SummarizePanelInput
): Promise<SummarizePanelOutput> {
  return summarizePanelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePanelPrompt',
  input: {schema: SummarizePanelInputSchema},
  output: {schema: SummarizePanelOutputSchema},
  prompt: `You are an expert in narrative analysis. Read the following text from a Manhwa panel and provide a brief, one-sentence summary in {{language}}.
Focus on the key action, dialogue, or event.

Text to summarize:
{{{text}}}

Summary:`,
});

const summarizePanelFlow = ai.defineFlow(
  {
    name: 'summarizePanelFlow',
    inputSchema: SummarizePanelInputSchema,
    outputSchema: SummarizePanelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
