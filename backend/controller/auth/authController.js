import axios from 'axios';

import { useAuthMapper } from '../../database/auth/mapper/authMapper.js';
import { getAuthDB } from '../../database/utils/index.js';
import {
  generateRefreshToken,
  generateToken,
} from '../../auth/validateAdmin.js';
import '../../util/set-env.js';

const db = await getAuthDB();
const authMapper = useAuthMapper(db);

export async function queryLogin(req, res) {
  const { code } = req.body;
  try {
    // 向微信服务器请求 openid
    const wxResponse = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid: process.env.APP_ID,
          secret: process.env.APP_SECRET,
          js_code: code,
          grant_type: 'authorization_code',
        },
      }
    );
    const { openid } = wxResponse.data;

    let user = await authMapper.getUserById(openid);
    if (!user) {
      const result = await authMapper.addUser({ open_id: openid });
      user = { id: result.lastID, openid };
    }

    // 生成自定义 Token（例如 JWT）
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({ token, refreshToken, userId: user.id });
  } catch (error) {
    res.status(401).json({ error: '身份验证失败' });
  }
}

export async function queryUpdateUser(req, res) {
  try {
    const result = await authMapper.updateUserById(req.body);
    res.json({
      message: result.changes ? '同步用户信息成功' : '同步用户信息失败',
    });
  } catch (error) {
    res.status(500).json({ message: error.changes });
  }
}
