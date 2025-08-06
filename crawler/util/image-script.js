import sharp from 'sharp';
import fs from 'fs';
// import glob from 'glob';
import path from 'path';

// 配置参数
const inputDir = '../../backend/assets/wow/dungeon-o';    // 输入目录
const outputDir = '../../backend/assets/wow/dungeon';  // 输出目录
const targetWidth = 400;      // 目标宽度

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 遍历输入目录中的所有WebP文件
import('glob').then((glob) => {
  glob.sync(`${inputDir}/**/*.webp`).forEach(async (filePath) => {
    try {
      const outputPath = path.join(outputDir, path.basename(filePath));

      await sharp(filePath)
        .resize(targetWidth)
        .toFile(outputPath);

      console.log(`成功处理: ${filePath} -> ${outputPath}`);
    } catch (error) {
      console.error(`处理失败: ${filePath}`, error.message);
    }
  });
});