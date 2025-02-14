import md5 from 'md5';
import axios from 'axios';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import translateMap from '../../database/wow/data/translate-map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, '../../.env') });

// 百度翻译配置
const BAIDU_CONFIG = {
  appid: process.env.BAIDU_APP_ID,
  key: process.env.BAIDU_KEY,
  api: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
};

/**
 * 调用百度翻译API
 * @param {string} text - 要翻译的文本
 * @param {string} from - 源语言（默认auto）
 * @param {string} to - 目标语言（默认zh）
 */
export async function translate(text, useMap = false, from = 'en', to = 'zh') {
  try {
    // 生成签名（按百度要求顺序拼接）
    const salt = Date.now();
    const signStr = BAIDU_CONFIG.appid + text + salt + BAIDU_CONFIG.key;
    const sign = md5(signStr);

    if (useMap) {
      Object.entries(translateMap).forEach(([key, value]) => {
        text = text.replaceAll(key, value);
      });
    }

    // 请求参数
    const params = {
      q: text,
      from: from,
      to: to,
      appid: BAIDU_CONFIG.appid,
      salt: salt,
      sign: sign,
    };

    // 发送请求
    const response = await axios.get(BAIDU_CONFIG.api, { params });

    // 处理响应
    if (response.data.error_code) {
      throw new Error(`百度API错误: ${response.data.error_msg}`);
    }
    console.log(response.data);

    return response.data.trans_result[0].dst;
  } catch (error) {
    console.error('翻译失败:', error.message);
    return null;
  }
}

export async function getTranslation(req, res) {
  const output = await translate(req.body.text);
  res.json(output);
}
