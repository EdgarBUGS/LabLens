'use server';
/**
 * @fileOverview An AI agent for identifying lab equipment from an image.
 *
 * - identifyEquipment - A function that handles the equipment identification process.
 * - IdentifyEquipmentInput - The input type for the identifyEquipment function.
 * - IdentifyEquipmentOutput - The return type for the identifyEquipment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyEquipmentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the lab equipment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyEquipmentInput = z.infer<typeof IdentifyEquipmentInputSchema>;

const IdentifyEquipmentOutputSchema = z.object({
  equipmentName: z.string().describe('The name of the identified lab equipment.'),
  description: z.string().describe('A detailed description of the lab equipment and its uses.'),
  category: z.string().describe('The category of the lab equipment (e.g., glassware, heating apparatus).'),
});
export type IdentifyEquipmentOutput = z.infer<typeof IdentifyEquipmentOutputSchema>;

export async function identifyEquipment(input: IdentifyEquipmentInput): Promise<IdentifyEquipmentOutput> {
  return identifyEquipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyEquipmentPrompt',
  input: {schema: IdentifyEquipmentInputSchema},
  output: {schema: IdentifyEquipmentOutputSchema},
  prompt: `You are an expert in laboratory equipment. Your task is to identify the equipment in the provided image and provide a detailed description, including its uses and category.

  Analyze the following image:
  {{media url=photoDataUri}}
  `,
});

const identifyEquipmentFlow = ai.defineFlow(
  {
    name: 'identifyEquipmentFlow',
    inputSchema: IdentifyEquipmentInputSchema,
    outputSchema: IdentifyEquipmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
