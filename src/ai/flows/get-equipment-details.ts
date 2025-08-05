// src/ai/flows/get-equipment-details.ts
'use server';

/**
 * @fileOverview Explains details about lab equipment given a query.
 *
 * - getEquipmentDetails - A function that handles the equipment details process.
 * - GetEquipmentDetailsInput - The input type for the getEquipmentDetails function.
 * - GetEquipmentDetailsOutput - The return type for the getEquipmentDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetEquipmentDetailsInputSchema = z.object({
  equipmentName: z.string().describe('The name of the lab equipment.'),
  query: z.string().describe('The question about the lab equipment.'),
});
export type GetEquipmentDetailsInput = z.infer<typeof GetEquipmentDetailsInputSchema>;

const GetEquipmentDetailsOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the lab equipment and the answer to the query.'),
});
export type GetEquipmentDetailsOutput = z.infer<typeof GetEquipmentDetailsOutputSchema>;

export async function getEquipmentDetails(input: GetEquipmentDetailsInput): Promise<GetEquipmentDetailsOutput> {
  return getEquipmentDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getEquipmentDetailsPrompt',
  input: {schema: GetEquipmentDetailsInputSchema},
  output: {schema: GetEquipmentDetailsOutputSchema},
  prompt: `You are an expert lab assistant. A student is asking you questions about a piece of lab equipment. Provide a clear, concise, and safe explanation.

Equipment Name: {{{equipmentName}}}
Question: {{{query}}}`,
});

const getEquipmentDetailsFlow = ai.defineFlow(
  {
    name: 'getEquipmentDetailsFlow',
    inputSchema: GetEquipmentDetailsInputSchema,
    outputSchema: GetEquipmentDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
