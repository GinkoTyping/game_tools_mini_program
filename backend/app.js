import express from 'express';
import cors from 'cors';

import wowBisRoutes from './routes/wow/bisRoutes.js';
import dungeonRoutes from './routes/wow/dungeonRoutes.js';
import dungeonTipRoutes from './routes/wow/dungeonTipRoutes.js';
import spellRoutes from './routes/wow/spellRoutes.js';
import commonBisRoutes from './routes/common/commonRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
// 使用 JSON 解析中间件
app.use(express.json());

// 挂载用户路由
app.use('/api/wow', wowBisRoutes);
app.use('/api/wow', spellRoutes);
app.use('/api/wow', dungeonRoutes);
app.use('/api/wow', dungeonTipRoutes);
app.use('/api/common', commonBisRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
