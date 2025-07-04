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
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://manhwa-scribe.com",
    "X-Title": "Manhwa Scribe",
  },
});

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language to translate to.'),
  sourceLanguage: z
    .string()
    .optional()
    .describe('The source language of the text.'),
  translator: z.string().optional().describe('The translator engine to use, e.g. "gemini" or "deepseek".'),
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
  async (input): Promise<TranslateTextOutput> => {
    if (input.translator === 'deepseek') {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
              {
                "role": "system",
                "content": `You are a professional translator. Translate the following text into ${input.targetLanguage}. ${input.sourceLanguage ? `The source language is ${input.sourceLanguage}.` : ''} Only return the translated text without any extra comments, explanations, or introductions.`
              },
              {
                "role": "user",
                "content": input.text
              }
            ],
        });
        const translation = completion.choices[0].message?.content?.trim() || "";
        return { translation };
    }
    
    // Default to Gemini
    let persona = "You are a professional translator using an advanced AI model.";
    
    const model = googleAI.model('gemini-2.0-flash');
    
    const promptInput = { ...input, persona };

    const {output} = await prompt(promptInput, {model});
    return output!;
  }
);
