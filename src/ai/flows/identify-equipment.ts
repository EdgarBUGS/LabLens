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
  isLaboratoryEquipment: z.boolean().describe('Whether the identified item is actually laboratory equipment.'),
  rejectionReason: z.string().optional().describe('Reason for rejection if the item is not laboratory equipment.'),
});
export type IdentifyEquipmentOutput = z.infer<typeof IdentifyEquipmentOutputSchema>;

export async function identifyEquipment(input: IdentifyEquipmentInput): Promise<IdentifyEquipmentOutput> {
  return identifyEquipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyEquipmentPrompt',
  input: {schema: IdentifyEquipmentInputSchema},
  output: {schema: IdentifyEquipmentOutputSchema},
  prompt: `You are an expert in laboratory equipment identification. Your task is to analyze the provided image and determine if it contains laboratory equipment.

IMPORTANT: Only identify items that are clearly laboratory equipment. If the image shows non-laboratory items (such as household objects, office supplies, furniture, food, clothing, or any non-scientific equipment), you must reject it.

For laboratory equipment:
- Set isLaboratoryEquipment to true
- Provide the equipment name, description, and category
- Leave rejectionReason undefined

For non-laboratory items:
- Set isLaboratoryEquipment to false
- Set equipmentName to "Not Laboratory Equipment"
- Set description to "This item is not laboratory equipment"
- Set category to "Non-laboratory item"
- Provide a clear rejectionReason explaining why it's not laboratory equipment

Examples of laboratory equipment: beakers, test tubes, microscopes, Bunsen burners, pipettes, scales, centrifuges, etc.
Examples of non-laboratory items: cups, books, phones, chairs, food, clothing, etc.

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
