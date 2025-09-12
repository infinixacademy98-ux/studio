'use server';
/**
 * @fileOverview Finds business categories related to a search query.
 *
 * - findRelatedCategories - A function that finds relevant business categories.
 * - FindRelatedCategoriesInput - The input type for the findRelatedCategories function.
 * - FindRelatedCategoriesOutput - The return type for the findRelatedCategories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini25Flash } from '@genkit-ai/googleai';

const FindRelatedCategoriesInputSchema = z.object({
  query: z.string().describe('The user search query.'),
  existingCategories: z.array(z.string()).describe('The list of available business categories to choose from.'),
});

export type FindRelatedCategoriesInput = z.infer<
  typeof FindRelatedCategoriesInputSchema
>;

const FindRelatedCategoriesOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe(
      'A list of categories from the existing list that are semantically related to the user query.'
    ),
});

export type FindRelatedCategoriesOutput = z.infer<
  typeof FindRelatedCategoriesOutputSchema
>;

export async function findRelatedCategories(
  input: FindRelatedCategoriesInput
): Promise<FindRelatedCategoriesOutput> {
  return findRelatedCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRelatedCategoriesPrompt',
  input: { schema: FindRelatedCategoriesInputSchema },
  output: { schema: FindRelatedCategoriesOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert in semantic search and business categorization. Based on the user's search query, identify all relevant categories from the provided list.

User Query: {{{query}}}

Available Categories:
{{#each existingCategories}}
- {{{this}}}
{{/each}}

Return a list of categories from the available list that are relevant to the user's query. The query might be a direct category name (e.g., "Education") or a related concept (e.g., "school"). Find all semantically related categories. For example, if the query is "hotel", you should also consider categories like "Restaurant", "Cafe", and "Catering Services" if they exist in the list. If the query itself matches a category name, be sure to include it in the output.`,
});

const findRelatedCategoriesFlow = ai.defineFlow(
  {
    name: 'findRelatedCategoriesFlow',
    inputSchema: FindRelatedCategoriesInputSchema,
    outputSchema: FindRelatedCategoriesOutputSchema,
  },
  async (input) => {
    // Return empty array if query is too short
    if (input.query.trim().length < 3) {
        return { categories: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
