import fs from 'fs';
import axios from 'axios';
import path from 'path';
import archiver from 'archiver';

export async function downloadSingle(
  url,
  savePath = './direct_downloads.jpg',
  isOverride = false
) {
  if (!url) {
    return 'URL为空。';
  }

  if (fs.existsSync(savePath) && !isOverride) {
    return '图片已缓存';
  }

  try {
    const response = await axios({
      url,
      responseType: 'stream',
      timeout: 10000,
    });

    // 创建可写流
    const writer = fs.createWriteStream(savePath);

    // 管道传输
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(savePath));
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`单独下载失败: ${url}`, err.message);
    throw err;
  }
}

export async function downloadZip(urls, savePath) {
  // 创建存储目录（如果不存在）
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // 创建可写流
  const output = fs.createWriteStream(savePath);

  const archive = archiver('zip');
  archive.pipe(output); // 写入本地文件
  archive.pipe(res); // 同时流式响应

  try {
    // 并行处理所有 URL
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const response = await axios({
            url,
            responseType: 'stream',
            timeout: 10000,
          });

          const filename = getFilename(url);
          archive.append(response.data, { name: filename });

          // 等待当前文件流完成
          await new Promise((resolve, reject) => {
            response.data.on('end', resolve);
            response.data.on('error', reject);
          });
        } catch (err) {
          console.error(`下载失败: ${url}`, err.message);
          throw err; // 终止整个流程
        }
      })
    );

    // 最终完成压缩
    await new Promise((resolve, reject) => {
      archive.finalize();
      archive.on('end', resolve);
      archive.on('error', reject);
    });
  } catch (err) {
    console.error('处理失败:', err.message);
    if (!res.headersSent) res.status(500).send('处理请求时出错');
  }
}
