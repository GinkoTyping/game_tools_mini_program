import express from 'express';
import wowBisRoutes from './routes/wow/bisRoutes.js';
 
const app = express();
const port = 3000;
 
// 使用 JSON 解析中间件
app.use(express.json());
 
// 挂载用户路由
app.use('/wow', wowBisRoutes);
 
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});