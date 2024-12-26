import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from 'next-connect';
import { chat } from '@/utils/llm';

// Create a next-connect handler
const router = createRouter<NextApiRequest, NextApiResponse>();

async function generate(words: string, jokeType: string = "苏联笑话"): Promise<{ result: string, chineseResult: string, englishResult: string }> {
  const prompt = `
<instruction>
你是一个英语学习助手，你负责为用户生成一个${jokeType}，但是保留指定单词的英文格式。
  - step1: 生成中英文的${jokeType}。
  - step2: 从上一步的中文结果中，按指定单词的顺序，将英文单词翻译成中文。
  - step3: 从上一步的结果中，检查中文和英文单词是否正确。其中中文单词必须是出现在中文结果中。如果用户输入的单词是在词组中，保留词组的格式。
输出格式参考output_example。输出格式为xml格式，最终结果放在result里。
注意，例子都是苏联笑话，你应该生成指定的${jokeType}。
注意，例子都是苏联笑话，你应该生成指定的${jokeType}。
注意，例子都是苏联笑话，你应该生成指定的${jokeType}。
</instruction>
<input_example1>
run,walk,ride bicycle,sit,hike
</input_example1>
<output_example1>
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
</output_example1>

<input_example1>
assign, neutral, beneficial, dominant, registration
</input_example1>
<output_example2>
  <step1>
    <english>
      In Soviet Russia, a man applies for a new job.  The interviewer asks, "Comrade, your application states you have a neutral political stance. Is this accurate?" The man replies, "Absolutely! I believe in a beneficial system for all." The interviewer raises an eyebrow. "And what if the dominant party disagrees with your beneficial ideas?" The man nervously adjusts his collar. "Then," he whispers, "I'll register my disagreement... privately."
    </english>
    <chinese>
      在苏联俄罗斯，一个人申请一份新工作。面试官问：“同志，你的申请上写着你持中立的政治立场。这是准确的吗？”这个人回答说：“当然！我相信对所有人都有利的制度。”面试官扬起了眉毛。“如果执政党不同意你那些有利的想法呢？”这个人紧张地整理了一下衣领。“那么，”他低声说，“我会私下注册我的异议……”
    </chinese>
  </step1>
  <step2_translated>
    <english_words>assign, neutral, beneficial, dominant, registration</english_words>
    <chinese_words>分配,中立的,有利的,主要的,注册</chinese_words>
  </step2_translated>
  <step3_fixed>
    <english_words>assign, neutral, beneficial, dominant party, register</english_words>
    <chinese_words>分配,中立的,有利的,执政党,注册</chinese_words>
  </step3_fixed>
</output_example2>

<input_example3>
candle, ownership, incentive, identical, reasonably
</input_example3>
<ouput_example3>
  <step1>
    <english>
      In Soviet Russia, two men are comparing their apartments.  "Comrade," says the first, "I have a lovely apartment.  It's reasonably spacious, and I even have a candle for when the electricity goes out." The second man scoffs, "Reasonably spacious?  Comrade, my apartment is identical to yours, except I own two candles!  The incentive to save electricity is clearly lacking in our system."
    </english>
    <chinese>
      在苏联俄罗斯，两个人正在比较他们的公寓。“同志，”第一个人说，“我有一套可爱的公寓。它相当宽敞，甚至还有一根蜡烛以备停电时使用。”第二个人嘲笑说：“相当宽敞？同志，我的公寓和你的一样，除了我拥有两根蜡烛！在我们这个体系中，节约用电的动力显然不足。”
    </chinese>
  </step1>
  <step2_translated>
    <english_words>candle, ownership, incentive, identical, reasonably</english_words>
    <chinese_words>蜡烛,拥有,动力,一样的,相当</chinese_words>
  </step2_translated>
  <step3_fixed>
    <english_words>candle, own, incentive, identical, reasonably</english_words>
    <chinese_words>蜡烛,拥有,动力,一样,相当</chinese_words>
  </step3_fixed>
</ouput_example3>
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
    const { input, jokeType } = req.body;
    if (!input) {
      return res.status(400).json({ error: 'input is required' });
    }

    const result = await generate(input, jokeType);
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