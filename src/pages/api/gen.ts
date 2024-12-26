import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from 'next-connect';
import { chat } from '@/utils/llm';

// Create a next-connect handler
const router = createRouter<NextApiRequest, NextApiResponse>();

async function generate(words: string): Promise<{ result: string, englishResult: string }> {
  const prompt = `
<instruction>
你是一个英语学习助手，你负责为用户生成一个苏联笑话，但是保留指定单词的英文格式。
  1. 生成英文的苏联笑话。
  2. 将除了指定单词外的英文翻译成中文。
输出格式参考output_example。输出格式为xml格式，最终结果放在result里。
</instruction>
<input_example>
run,walk,ride bicycle,sit,hike
</input_example>
<output_example>
  <step1_english>
  In Soviet Russia, a man complains to his friend:
  "Comrade, our new fitness program is killing me! They make us run 5 km, walk 10 km, ride bicycle for an hour, and then hike in the mountains!"
  His friend replies, "That's terrible! When do you get to sit and rest?"
  The man laughs bitterly, "Oh, we sit plenty... in the gulag for complaining about the program!"
  </step1_english>
  <step2_mix>
  在苏联俄罗斯,一个人向他的朋友抱怨:
  "同志,我们的新健身计划快把我累死了!他们让我们跑步5公里,walk 10公里,ride bicycle 一小时,然后还要 hike 到山上!"
  他的朋友回答说:"太可怕了!你们什么时候能 sit 下来休息?"
  这个人苦笑着说:"哦,我们有很多时间 sit...在古拉格里抱怨这个计划的时候!"
  </step2_mix>
  <step3_fixed>
  在苏联俄罗斯,一个人向他的朋友抱怨:
  "同志,我们的新健身计划快把我累死了!他们让我们 run 5公里,walk 10公里,ride bicycle 一小时,然后还要 hike 到山上!"
  他的朋友回答说:"太可怕了!你们什么时候能 sit 下来休息?"
  这个人苦笑着说:"哦,我们有很多时间 sit...在古拉格里抱怨这个计划的时候!"
  </step3_fixed>
  <result>
  在苏联俄罗斯,一个人向他的朋友抱怨:
  "同志,我们的新健身计划快把我累死了!他们让我们 run 5公里,walk 10公里,ride bicycle 一小时,然后还要 hike 到山上!"
  他的朋友回答说:"太可怕了!你们什么时候能 sit 下来休息?"
  这个人苦笑着说:"哦,我们有很多时间 sit...在古拉格里抱怨这个计划的时候!"
  </result>
</output_example>
<input>
  ${words}
</input>`;

  // Initialize OpenAI client
  const result = await chat(prompt);
  const englishResult = getSection(result, 'step1_english');

  const chineseResult = getSection(result, 'result');
  return {
    result: chineseResult,
    englishResult,
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