import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from 'next-connect';
import { chat } from '@/utils/llm';

// Create a next-connect handler
const router = createRouter<NextApiRequest, NextApiResponse>();

async function generate(words: string, jokeType: string = "苏联笑话"): Promise<{ result: string, chineseResult: string, englishResult: string }> {
  const prompt = `
<instruction>
你是一个英语学习助手，你负责为用户生成一个${jokeType}，但是保留指定单词的英文格式。不用用完所有的单词。
你的任务是：
  - step1: 生成中英文的${jokeType}。
  - step2: 从上一步的中文结果中，按指定单词的顺序，将英文单词翻译成中文。
  - step3: 从上一步的结果中，检查中文和英文单词是否正确。其中中文单词必须是出现在中文结果中。仔细检查，因为中文同一个词语可能是不同的词性，对应就是不同的单词。
    - 如果用户输入的单词是在词组中，保留词组的格式。
    - 比如用户提供的单词是 \`supportive\`，翻译成\`支持的\`。
    - step1 生成的英文句子是 \`my colleague is not supportive of my work\`，中文句子是\`我的同事不支持我的工作\`。
    - 那么需要单词改为 \`supportive of\` 和 \`支持\`。
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
    <reasoning>step2 中缺少了 hike 这个单词</reasoning>
    <english_words>run,walk,ride bicycle,sit,hike</english_words>
    <chinese_words>跑步,步行,骑自行车,坐,徒步旅行</chinese_words>
  </step3_fixed>
</output_example1>

<input_example2>
assign, neutral, beneficial, dominant, registration
</input_example2>
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
    <reasoning>step2 中 registration 没有出现在英文句子中，需要调整为 register</reasoning>
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
    <reasoning>step2 中 ownership 没有出现在英文句子中，需要调整为 own</reasoning>
    <english_words>candle, own, incentive, identical, reasonably</english_words>
    <chinese_words>蜡烛,拥有,动力,一样,相当</chinese_words>
  </step3_fixed>
</ouput_example3>

<input_example4>
accuracy, deadline, signature, subsequent, devote
</input_example4>
<output_example4>
  <step1>
    <english>
      An economist was asked to predict the accuracy of his economic forecasts. He replied, "I'm 100% certain about my predictions, but I can't guarantee their accuracy." His colleague chimed in, "That's why we always set a deadline for our reports. By the time anyone checks our predictions, we've already moved on to subsequent forecasts!" The first economist nodded, "Indeed. We devote so much time to making new predictions that we never have to face the consequences of our old ones. Just sign here to confirm you understand the risks!"
    </english>
    <chinese>
      一位经济学家被要求预测他的经济预测的准确性。他回答说："我对我的预测100%确定，但我不能保证它们的准确性。"他的同事插话说："这就是为什么我们总是为我们的报告设定截止日期。等到有人检查我们的预测时，我们已经转向后续的预测了！"第一位经济学家点头说："确实如此。我们投入了这么多时间来做新的预测，以至于我们永远不用面对旧预测的后果。在这里签个名，确认你理解风险就行了！"
    </chinese>
  </step1>
  <step2_translated>
    <english_words>accuracy, deadline, signature, subsequent, devote</english_words>
    <chinese_words>准确性,截止日期,签名,后续的,投入</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>step2 中 签名 没有出现在中文句子中，需要调整为 签个名</reasoning>
    <english_words>accuracy, deadline, signature, subsequent, devote</english_words>
    <chinese_words>准确性,截止日期,签个名,后续,投入</chinese_words>
  </step3_fixed>
</output_example4>

<input_example5>
supportive, escalate, somebody
</input_example5>
<output_example5>
  <step1>
    <english>
      In Soviet Russia, a worker complains to his boss, "Comrade, my colleague is not supportive of my work, and he keeps escalating every little problem to management!" The boss sighs, "Comrade, somebody has to take responsibility for the failures of the system.  It's easier to blame somebody else than to fix the problem."
    </english>
    <chinese>
      在苏联俄罗斯，一个工人向他的老板抱怨：“同志，我的同事不支持我的工作，他总是把每一个小问题都升级到管理层！”老板叹了口气：“同志，总得有某人为体制的失败负责。责备别人比解决问题更容易。”
    </chinese>
  </step1>
  <step2_translated>
    <english_words>supportive, escalate, somebody</english_words>
    <chinese_words>支持的,升级,某人</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>step2 中 支持的 没有出现在中文句子中，需要调整为 支持，同时调整单词 supportive 为词组 supportive of</reasoning>
    <english_words>supportive of, escalate, somebody</english_words>
    <chinese_words>支持,升级,某人</chinese_words>
  </step3_fixed>
</output_example5>

<input_example6>
closure, drum, she
</input_example6>
<output_example6>
  <step1>
    <english>
      Why did the drummer's girlfriend break up with him? She couldn't handle his constant drum solos and his inability to achieve closure. In the end, she said, "I'm sick of you beating around the bush... and everything else!"
    </english>
    <chinese>
      鼓手的女朋友为什么和他分手？她无法忍受他不断的鼓独奏和无法结束。最后，她说：“我受够了你的拐弯抹角……还有其他一切！”
    </chinese>
  </step1>
  <step2_translated>
    <english_words>closure, drum, she</english_words>
    <chinese_words>结束, 鼓, 她</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>没有需要修正的内容。</reasoning>
    <english_words>closure, drum, she</english_words>
    <chinese_words>结束, 鼓, 她</chinese_words>
  </step3_fixed>
</output_example6>

<input_example7>
lawsuit, divorced, determine
</input_example7>
<ouput_example7>
  <step1>
    <english>
      I got divorced last year. The judge said he'd determine who gets the house in our lawsuit. Turns out, the bank does.
    </english>
    <chinese>
      我去年离婚了。法官说他会在我们的诉讼中决定谁能得到房子。结果，银行得到了。
    </chinese>
  </step1>
  <step2_translated>
    <english_words>lawsuit, divorced, determine</english_words>
    <chinese_words>诉讼, 离婚, 决定</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>没有需要修正的内容。</reasoning>
    <english_words>lawsuit, divorced, determine</english_words>
    <chinese_words>诉讼, 离婚, 决定</chinese_words>
  </step3_fixed>
</ouput_example7>

<input_example8>
field, accompany, spot
</input_example8>
<ouput_example8>
  <step1>
    <english>
      A farmer and his wife were walking through their field when they spotted a UFO. The farmer excitedly said, "Quick, honey! Go get the camera. I'll stay here to accompany our alien visitors!" His wife replied, "Are you crazy? You go get the camera, and I'll stay here to spot the UFO." The farmer chuckled, "Nice try, dear. But the last time I left you alone in a field, you came back with a degree in crop circles!"
    </english>
    <chinese>
      一个农夫和他的妻子在他们的田地里散步时，发现了一个不明飞行物。农夫兴奋地说："快，亲爱的！去拿相机。我留在这里陪伴我们的外星访客！"他的妻子回答说："你疯了吗？你去拿相机，我留在这里观察不明飞行物。"农夫笑着说："好主意，亲爱的。但是上次我把你一个人留在田里，你回来时就拿到了一个麦田圈学位！"
    </chinese>
  </step1>
  <step2_translated>
    <english_words>field, accompany, spot</english_words>
    <chinese_words>田地, 陪伴, 发现</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>spot 在中文中被翻译成了两个不同的词语，一个是观察，一个是发现，需要补充完整。</reasoning>
    <english_words>field, accompany, spot, spot</english_words>
    <chinese_words>田地, 陪伴, 发现, 观察</chinese_words>
  </step3_fixed>
</ouput_example8>

<input_example9>
field, accompany, spot
</input_example9>
<ouput_example9>
  <step1>
    <english>
      A couple was enjoying a picnic in a field when they spotted a rare bird. The husband excitedly said, "Honey, I'll accompany that bird to get a better look!" His wife replied, "Are you serious? You can barely spot the difference between a sparrow and an eagle." The husband chuckled, "Well, at least I can spot the difference between our anniversary and a regular Tuesday, unlike someone I know!"
    </english>
    <chinese>
      一对夫妇在田野里野餐时发现了一只稀有鸟类。丈夫兴奋地说："亲爱的，我要跟着那只鸟去看个仔细！"他的妻子回答说："你认真的吗？你连麻雀和老鹰的区别都分不清。"丈夫笑着说："好吧，至少我能分清我们的结婚纪念日和普通的星期二，不像某些人！"
    </chinese>
  </step1>
  <step2_translated>
    <english_words>field, accompany, spot, spot</english_words>
    <chinese_words>田地, 陪伴, 发现, 分清</chinese_words>
  </step2_translated>
  <step3_fixed>
    <reasoning>spot 在文中还有另一种表达，bearly spot，翻译成中文是分不清。</reasoning>
    <english_words>field, accompany, spot, spot, barely spot</english_words>
    <chinese_words>田地, 陪伴, 发现, 分清, 分不清</chinese_words>
  </step3_fixed>
</ouput_example9>

<input>
  ${words}
</input>`;

  // Initialize OpenAI client
  let result = await chat(prompt);
  console.log('result', result);
  const englishResult = getSection(result, 'english');
  const chineseResult = getSection(result, 'chinese');
  const translatedResult = getSection(result, 'step3_fixed');
  console.log('translatedResult', translatedResult);
  const englishWords = getSection(translatedResult, 'english_words').split(',').map(word => word.trim());
  const chineseWords = getSection(translatedResult, 'chinese_words').split(',').map(word => word.trim());
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