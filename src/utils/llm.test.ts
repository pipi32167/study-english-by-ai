import { describe } from 'node:test';
import { chat } from './llm';

describe('llm', () => {
  it('chat', async () => {
    const words = ['run', 'walk', 'ride bicycle', 'sit', 'hike'];
    const result = await chat(words.join(','));
    console.log('result:', result);
  });
})