import jwt from 'jsonwebtoken';

export function isLocal(req) {
  const clientIP = req.ip || req.headers['x-forwarded-for'];
  const allowedIPs = new Set(['127.0.0.1', '::1', 'localhost']);
  return allowedIPs.has(clientIP);
}

export const validateAdmin = async (req, res, next) => {
  try {
    // (1) 验证 IP 白名单
    if (!isLocal(req)) {
      return res.status(403).json({ message: 'IP not allowed' });
    }

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
