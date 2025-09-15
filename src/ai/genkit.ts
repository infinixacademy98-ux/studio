import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {gemini15Flash, gemini20Flash} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});
