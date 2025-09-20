import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {gemini15Flash} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
