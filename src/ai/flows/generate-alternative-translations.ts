'use server';

/**
 * @fileOverview An AI agent that generates alternative translations for a given text.
 *
 * - generateAlternativeTranslations - A function that provides multiple translation options.
 * - GenerateAlternativeTranslationsInput - The input type for the function.
 * - GenerateAlternativeTranslationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlternativeTranslationsInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for the translations, e.g., "Spanish".'),
});
export type GenerateAlternativeTranslationsInput = z.infer<typeof GenerateAlternativeTranslationsInputSchema>;

const GenerateAlternativeTranslationsOutputSchema = z.object({
  translations: z.array(z.string()).describe('A list of 3-5 alternative translations for the text.'),
});
export type GenerateAlternativeTranslationsOutput = z.infer<typeof GenerateAlternativeTranslationsOutputSchema>;

export async function generateAlternativeTranslations(
  input: GenerateAlternativeTranslationsInput
): Promise<GenerateAlternativeTranslationsOutput> {
  return generateAlternativeTranslationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlternativeTranslationsPrompt',
  input: {schema: GenerateAlternativeTranslationsInputSchema},
  output: {schema: GenerateAlternativeTranslationsOutputSchema},
  prompt: `You are a professional translator. Provide 3 to 5 distinct alternative translations for the following text into {{targetLanguage}}.
Each translation should offer a slightly different nuance, style, or phrasing, but all must be accurate.

Text to translate:
{{{text}}}
`,
});

const generateAlternativeTranslationsFlow = ai.defineFlow(
  {
    name: 'generateAlternativeTranslationsFlow',
    inputSchema: GenerateAlternativeTranslationsInputSchema,
    outputSchema: GenerateAlternativeTranslationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
