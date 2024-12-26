
import { OpenAI } from 'openai';



export async function chat(prompt: string) {
  const openai = new OpenAI({
    baseURL: process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: { "x-foo": "true" },
  });

  // console.log('prompt:\n', prompt)
  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_API_MODEL || 'gemini-1.5-flash',
    messages: [{
      role: "system",
      content: "You are a helpful English learning assistant. "
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ]
    }
    ],
    max_tokens: 2048,
    temperature: 0.1,
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error(`invalid response: ${response}`);
  }
  return result;
}

