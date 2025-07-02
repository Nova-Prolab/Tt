'use server';

/**
 * @fileOverview An AI agent that provides contextual understanding of phrases or panels in Manhwa.
 *
 * - provideContextualUnderstanding - A function that handles the contextual understanding process.
 * - ProvideContextualUnderstandingInput - The input type for the provideContextualUnderstanding function.
 * - ProvideContextualUnderstandingOutput - The return type for the provideContextualUnderstanding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideContextualUnderstandingInputSchema = z.object({
  text: z.string().describe('The text from a Manhwa panel to provide context for.'),
  image: z
    .string()
    .optional()
    .describe(
      "An optional photo of the Manhwa panel, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  previousContext: z
    .string()
    .optional()
    .describe('The previous panels text, if it exists'),
});
export type ProvideContextualUnderstandingInput = z.infer<
  typeof ProvideContextualUnderstandingInputSchema
>;

const ProvideContextualUnderstandingOutputSchema = z.object({
  contextualUnderstanding: z
    .string()
    .describe('The contextual understanding of the text.'),
});
export type ProvideContextualUnderstandingOutput = z.infer<
  typeof ProvideContextualUnderstandingOutputSchema
>;

export async function provideContextualUnderstanding(
  input: ProvideContextualUnderstandingInput
): Promise<ProvideContextualUnderstandingOutput> {
  return provideContextualUnderstandingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideContextualUnderstandingPrompt',
  input: {schema: ProvideContextualUnderstandingInputSchema},
  output: {schema: ProvideContextualUnderstandingOutputSchema},
  prompt: `You are an expert in Manhwa and will provide contextual understanding of panels.

    Here is the text from the panel: {{{text}}}

    {{#if image}}
    Here is the image of the panel: {{media url=image}}
    {{/if}}

    {{#if previousContext}}
    Here is the text from the previous panel: {{{previousContext}}}
    {{/if}}

    Provide a contextual understanding of the panel. The response must be in Spanish.
    `,
});

const provideContextualUnderstandingFlow = ai.defineFlow(
  {
    name: 'provideContextualUnderstandingFlow',
    inputSchema: ProvideContextualUnderstandingInputSchema,
    outputSchema: ProvideContextualUnderstandingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
