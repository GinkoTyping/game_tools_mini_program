import jwt from 'jsonwebtoken';

import '../util/set-env.js';

export function isLocal(req) {
  const clientIP = req.ip || req.headers['x-forwarded-for'];
  const allowedIPs = new Set(['127.0.0.1', '::1', 'localhost', process.env.DEV_IP]);
  return allowedIPs.has(clientIP);
}

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export const validateAdmin = async (req, res, next) => {
  try {
    // (2) 验证 JWT 中的用户身份
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id !== process.env.AMIND_ID) {
      // 替换为你的实际用户标识
      return res.status(403).json({ message: 'User not authorized' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Access denied' });
  }
};

export function authenticateToken(req, res, next) {
  if (process.env.ENABLE_AUTHENTICATE === 'true') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ code: 'TOKEN_EXPIRED', error: 'Token 已过期' });
        }
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    next();
  }
}
