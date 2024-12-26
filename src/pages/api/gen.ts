import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from 'next-connect';
import { chat } from '@/utils/llm';

// Create a next-connect handler
const router = createRouter<NextApiRequest, NextApiResponse>();

async function generate(words: string): Promise<{ result: string, chineseResult: string, englishResult: string }> {
  const prompt = `
<instruction>
你是一个英语学习助手，你负责为用户生成一个苏联笑话，但是保留指定单词的英文格式。
  - step1: 生成中英文的苏联笑话。
  - step2: 从上一步的中文结果中，按指定单词的顺序，将英文单词翻译成中文。
输出格式参考output_example。输出格式为xml格式，最终结果放在result里。
</instruction>
<input_example>
run,walk,ride bicycle,sit,hike
</input_example>
<output_example>
  <step1>
    <english>
      In Soviet Russia, a man complains to his friend:
      "Comrade, our new fitness program is killing me! They make us run 5 km, walk 10 km, ride bicycle for an hour, and then hike in the mountains!"
      His friend replies, "That's terrible! When do you get to sit and rest?"
      The man laughs bitterly, "Oh, we sit plenty... in the gulag for complaining about the program!"
    </english>
    <chinese>
      在苏联俄罗斯,一个人向他的朋友抱怨:
      "同志,我们的新健身计划快把我累死了!他们让我们跑步5公里,步行10公里,骑自行车一小时,然后还要徒步旅行到山上!"
      他的朋友回答说:"太可怕了!你们什么时候能坐下来休息?"
      这个人苦笑着说:"哦,我们有很多时间坐...在古拉格里抱怨这个计划的时候!"
    </chinese>
  </step1>
  <step2_translated>
    <english_words>run,walk,ride bicycle,sit</english_words>
    <chinese_words>跑步,步行,骑自行车,坐</chinese_words>
  </step2_translated>
  <step3_fixed>
    <english_words>run,walk,ride bicycle,sit,hike</english_words>
    <chinese_words>跑步,步行,骑自行车,坐,徒步旅行</chinese_words>
  </step3_fixed>
</output_example>
<input>
  ${words}
</input>`;

  // Initialize OpenAI client
  let result = await chat(prompt);
  console.log('result', result);
  const englishResult = getSection(result, 'english');
  const chineseResult = getSection(result, 'chinese');
  const translatedResult = getSection(result, 'step3_fixed').split(',').map(word => word.trim());
  console.log('translatedResult', translatedResult);
  const englishWords = getSection(result, 'english_words').split(',').map(word => word.trim());
  const chineseWords = getSection(result, 'chinese_words').split(',').map(word => word.trim());
  console.log('englishWords', englishWords);
  console.log('chineseWords', chineseWords);
  result = chineseResult;
  for (let i = 0; i < englishWords.length; i++) {

    const word = englishWords[i];
    const word2 = chineseWords[i];
    // result = result.replace(word2, `<span style="color: red;">${word}</span>`);
    result = result.replaceAll(word2, ` ${word} `);
  }
  // result = getSection(result, 'result');

  return {
    chineseResult,
    englishResult,
    result,
  }
}

function getSection(result: string, name: string): string {
  const startIdx = result.indexOf(`<${name}>`);
  const endIdx = result.indexOf(`</${name}>`);
  const resultLength = `<${name}>`.length;
  return result.slice(startIdx + resultLength, endIdx);
}

router.post(async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: 'input is required' });
    }

    const result = await generate(input);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Disable body parsing, since we're using multer
export const config = {
  api: {
    bodyParser: true,
  },

};

export default router.handler();