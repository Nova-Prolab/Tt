'use server';

/**
 * @fileOverview An AI agent that translates text.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language to translate to.'),
  sourceLanguage: z
    .string()
    .optional()
    .describe('The source language of the text.'),
  translator: z.string().optional().describe('The translator engine to use, e.g. "google-translate".'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const InternalTranslateInputSchema = TranslateTextInputSchema.extend({
  persona: z.string(),
});

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: InternalTranslateInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `{{{persona}}} Translate the following text into {{targetLanguage}}.
{{#if sourceLanguage}}The source language is {{sourceLanguage}}.{{/if}}

Text to translate:
{{{text}}}

Translation:`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    let persona = "You are a professional translator using an advanced AI model.";
    if (input.translator === 'google-translate') {
      persona = "You are simulating Google Translate. Provide a direct translation."
    }

    const model = googleAI.model('gemini-2.0-flash');
    
    const promptInput = { ...input, persona };

    const {output} = await prompt(promptInput, {model});
    return output!;
  }
);
