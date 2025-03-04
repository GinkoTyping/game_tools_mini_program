import OpenAI from 'openai';
import Bottleneck from 'bottleneck';
import fs from 'fs';

import '../util/set-env.js';
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_KEY,
});

export function useDeepseek(cachePath) {
  const limiter = new Bottleneck({
    maxConcurrent: 5, // 适当并行
    minTime: 50, // 50ms间隔 → 20次/秒
    reservoir: 30,
    reservoirRefreshAmount: 30,
    reservoirRefreshInterval: 1000,
  });
  let translatedTotalCount = 0;
  let translatedSuccessCount = 0;
  const translationCache = loadTranslationCache();
  function loadTranslationCache() {
    let translationCache = new Map();
    try {
      const data = fs.readFileSync(cachePath, 'utf-8');
      const rawCache = JSON.parse(data);
      translationCache = new Map(Object.entries(rawCache));
      console.log(`已加载历史翻译缓存，条目数：${translationCache.size}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在时创建空缓存
        console.log('未找到历史翻译缓存，将创建新文件');
        translationCache = new Map();
      } else {
        console.warn('加载翻译缓存失败，使用空缓存:', error.message);
      }
    } finally {
      return translationCache;
    }
  }
  function saveTranslationCache() {
    try {
      // 将 Map 转换为普通对象
      const rawCache = Object.fromEntries(translationCache);
      fs.writeFileSync(cachePath, JSON.stringify(rawCache, null, 2), 'utf-8');
      console.log(`已保存翻译缓存，条目数：${translationCache.size}`);
    } catch (error) {
      console.warn('保存翻译缓存失败:', error.message);
    }
  }
  async function translate(value) {
    translatedTotalCount++;
    if (translationCache.has(value)) {
      translatedSuccessCount++;
      console.log(
        `翻译成功(缓存)：${translatedSuccessCount} / ${translatedTotalCount}`
      );
      return translationCache.get(value);
    }

    function buildValue() {
      return (
        '按照中文的阅读习惯翻译以下的内容，它是魔兽世界的副本攻略。原文本中已经是中文的部分和"["、"]"符号请保留。如果原文本只包含中文或者"["、"]"符号，则不需要翻译。请给出翻译后的文字：' +
        value
      );
    }

    try {
      const translatedText = await limiter.schedule(async () => {
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'assistant', content: buildValue(value) }],
          model: 'deepseek-chat',
        });
        return completion.choices[0].message.content;
      });

      translationCache.set(value, translatedText);
      translatedSuccessCount++;
      console.log(
        `翻译成功：${translatedSuccessCount} / ${translatedTotalCount}`
      );
      return translatedText;
    } catch (error) {
      console.log(
        `翻译失败：${translatedSuccessCount} / ${translatedTotalCount}`
      );
      console.log(error);
      return value;
    }
  }
  return {
    loadTranslationCache,
    saveTranslationCache,
    translate,
  };
}
