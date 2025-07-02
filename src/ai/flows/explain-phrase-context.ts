'use server';

/**
 * @fileOverview An AI agent that provides contextual explanations for specific phrases or panels in Manhwa.
 *
 * - explainPhraseContext - A function that handles the contextual explanation process.
 * - ExplainPhraseContextInput - The input type for the explainPhraseContext function.
 * - ExplainPhraseContextOutput - The return type for the explainPhraseContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainPhraseContextInputSchema = z.object({
  phrase: z.string().describe('The specific phrase from the Manhwa panel to explain.'),
  context: z
    .string()
    .optional()
    .describe('The surrounding context of the phrase in the panel.'),
  image: z
    .string()
    .optional()
    .describe(
      "An optional photo of the Manhwa panel, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  culturalNotes: z
    .string()
    .optional()
    .describe('Any relevant cultural notes or references related to the phrase.'),
});
export type ExplainPhraseContextInput = z.infer<
  typeof ExplainPhraseContextInputSchema
>;

const ExplainPhraseContextOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed explanation of the phrase within its context.'),
});
export type ExplainPhraseContextOutput = z.infer<
  typeof ExplainPhraseContextOutputSchema
>;

export async function explainPhraseContext(
  input: ExplainPhraseContextInput
): Promise<ExplainPhraseContextOutput> {
  return explainPhraseContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainPhraseContextPrompt',
  input: {schema: ExplainPhraseContextInputSchema},
  output: {schema: ExplainPhraseContextOutputSchema},
  prompt: `You are an expert in Manhwa culture and language. You will provide a detailed explanation of a specific phrase from a Manhwa panel, taking into account its context, cultural notes, and any visual cues from the image. The explanation must be in Spanish.

Phrase: {{{phrase}}}
Context: {{{context}}}
{{#if image}}
Image: {{media url=image}}
{{/if}}
Cultural Notes: {{{culturalNotes}}}

Explanation:`,
});

const explainPhraseContextFlow = ai.defineFlow(
  {
    name: 'explainPhraseContextFlow',
    inputSchema: ExplainPhraseContextInputSchema,
    outputSchema: ExplainPhraseContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
