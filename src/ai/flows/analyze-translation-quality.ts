'use server';

/**
 * @fileOverview An AI agent that analyzes the quality of a translation.
 *
 * - analyzeTranslationQuality - A function that handles the translation quality analysis.
 * - AnalyzeTranslationQualityInput - The input type for the analyzeTranslationQuality function.
 * - AnalyzeTranslationQualityOutput - The return type for the analyzeTranslationQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTranslationQualityInputSchema = z.object({
  originalText: z.string().describe('The original source text.'),
  translatedText: z.string().describe('The translated text to be evaluated.'),
  language: z.string().describe('The target language of the translation, e.g., "Spanish".'),
});
export type AnalyzeTranslationQualityInput = z.infer<typeof AnalyzeTranslationQualityInputSchema>;

const QualityMetricSchema = z.object({
    score: z.number().min(0).max(10).describe('A score from 0 to 10 for the metric.'),
    explanation: z.string().describe('A detailed explanation for the score, highlighting strengths and weaknesses.'),
});

const AnalyzeTranslationQualityOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('An overall quality score from 0 to 100.'),
  summary: z.string().describe('A concise summary of the translation quality.'),
  readability: QualityMetricSchema.describe('Assessment of how easy the translation is to read.'),
  accuracy: QualityMetricSchema.describe('Assessment of how well the translation preserves the original meaning.'),
  toneConsistency: QualityMetricSchema.describe('Assessment of how well the translation maintains the original tone.'),
  culturalAdaptation: z.string().describe('Notes on how well cultural nuances, idioms, or specific references were handled.'),
});
export type AnalyzeTranslationQualityOutput = z.infer<typeof AnalyzeTranslationQualityOutputSchema>;

export async function analyzeTranslationQuality(
  input: AnalyzeTranslationQualityInput
): Promise<AnalyzeTranslationQualityOutput> {
  return analyzeTranslationQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTranslationQualityPrompt',
  input: {schema: AnalyzeTranslationQualityInputSchema},
  output: {schema: AnalyzeTranslationQualityOutputSchema},
  prompt: `You are a professional translation quality reviewer. Your task is to provide a comprehensive analysis of a translation. Your response must be in {{language}}.

Evaluate the translated text based on the original text across several key metrics: readability, accuracy, and tone consistency. For each metric, provide a score from 0 (very poor) to 10 (perfect) and a detailed explanation for your rating.

Also, provide specific notes on cultural adaptation, an overall quality score from 0 to 100, and a final summary of your findings.

Original Text:
{{{originalText}}}

Translated Text:
{{{translatedText}}}
`,
});

const analyzeTranslationQualityFlow = ai.defineFlow(
  {
    name: 'analyzeTranslationQualityFlow',
    inputSchema: AnalyzeTranslationQualityInputSchema,
    outputSchema: AnalyzeTranslationQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
