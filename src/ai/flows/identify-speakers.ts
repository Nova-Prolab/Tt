'use server';

/**
 * @fileOverview An AI agent that identifies speakers in a block of dialogue.
 *
 * - identifySpeakers - A function that handles speaker identification.
 * - IdentifySpeakersInput - The input type for the identifySpeakers function.
 * - IdentifySpeakersOutput - The return type for the identifySpeakers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySpeakersInputSchema = z.object({
  dialogue: z.string().describe('A block of dialogue text where speakers need to be identified.'),
  language: z.string().describe('The language the analysis should be in, e.g., "Spanish".'),
});
export type IdentifySpeakersInput = z.infer<typeof IdentifySpeakersInputSchema>;

const SpeakerSchema = z.object({
    speaker: z.string().describe('The identified speaker (e.g., "Character A", "Narrator", "Unknown").'),
    line: z.string().describe('The line of dialogue spoken by this speaker.'),
});

const IdentifySpeakersOutputSchema = z.object({
  identifiedLines: z.array(SpeakerSchema).describe('A list of dialogue lines, each attributed to a speaker.'),
  analysis: z.string().describe('A brief analysis of how the speakers were identified, or notes on ambiguity.'),
});
export type IdentifySpeakersOutput = z.infer<typeof IdentifySpeakersOutputSchema>;

export async function identifySpeakers(
  input: IdentifySpeakersInput
): Promise<IdentifySpeakersOutput> {
  return identifySpeakersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifySpeakersPrompt',
  input: {schema: IdentifySpeakersInputSchema},
  output: {schema: IdentifySpeakersOutputSchema},
  prompt: `You are a script analyst. Your task is to read the following block of text from a Manhwa and identify who is speaking each line.
The text may not have explicit speaker tags. Use context clues, quotation marks, and formatting to make your best guess.
Label speakers as "Character A", "Character B", "Narrador", or "Desconocido" if you cannot determine the speaker.
Provide your response in {{language}}.

Dialogue to analyze:
{{{dialogue}}}
`,
});

const identifySpeakersFlow = ai.defineFlow(
  {
    name: 'identifySpeakersFlow',
    inputSchema: IdentifySpeakersInputSchema,
    outputSchema: IdentifySpeakersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
