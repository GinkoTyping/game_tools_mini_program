const https = require('https');
const fs = require('fs');
const path = require('path');

const gemURLs = require('./passive-skills.json');
// 示例URL列表
const urls = gemURLs.map(item => item.icon).filter(item => item?.length).slice(900);

// 存储下载失败的URL
let failedUrls = [];
let completedDownloads = 0; // 初始化已完成的下载计数器

const download = (url, filename, callback) => {
    const file = fs.createWriteStream(filename);
    const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    completedDownloads++; // 下载完成后增加计数器
                    if (callback) callback(null, `Downloaded ${url} to ${filename}`);
                    printDownloadProgress(); // 打印下载进度
                });
            });
        } else {
            // 如果服务器返回非200状态码，也视为下载失败
            failedUrls.push(url);
            if (callback) callback(`Server responded with status code ${response.statusCode} for URL: ${url}`);
            printDownloadProgress(); // 打印下载进度
        }
    }).on('error', (err) => {
        failedUrls.push(url);
        if (callback) callback(`Download error for URL: ${url} - ${err.message}`);
        printDownloadProgress(); // 打印下载进度
    });

    // 监听请求错误（例如，DNS解析失败）
    request.on('socket', (socket) => {
        socket.on('error', (err) => {
            failedUrls.push(url);
            if (callback) callback(`Socket error for URL: ${url} - ${err.message}`);
            printDownloadProgress(); // 打印下载进度
        });
    });
};

const printDownloadProgress = () => {
    console.clear(); // 清除控制台以更新进度（可选）
    console.log(`当前已经下载的数量: ${completedDownloads} / 总数量: ${urls.length}`);
    if (failedUrls.length > 0) {
        console.log(`已有 ${failedUrls.length} 个URL下载失败。`);
    }
};

const downloadAllImages = (urls, destinationFolder, callback) => {
    const promises = urls.map((url) => {
        return new Promise((resolve, reject) => {
            const filename = path.basename(url);
            const filePath = path.join(destinationFolder, filename);
            download(url, filePath, (err, message) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(message);
                }
            });
        });
    });

    Promise.all(promises)
        .then((results) => {
            // 所有下载成功，处理结果（可选）
            console.log(results);
            if (failedUrls.length > 0) {
                // 如果有失败的URL，将它们写入JSON文件
                writeFailedUrlsToJson(failedUrls);
            }
            if (callback) callback(null, results);
        })
        .catch((error) => {
            // 处理Promise.all中的错误（这通常不会发生，因为每个下载都有自己的错误处理）
            console.error('An unexpected error occurred:', error);
            if (callback) callback(error);
        });
};

const writeFailedUrlsToJson = (failedUrls) => {
    const jsonData = JSON.stringify({ failedUrls }, null, 2); // 格式化JSON输出
    const filePath = './failed_urls.json';
    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            console.error('Error writing failed URLs to JSON file:', err);
        } else {
            console.log(`Failed URLs written to ${filePath}`);
        }
    });
};

// 指定下载的目标文件夹
const destinationFolder = './images/passive-skills';

// 确保目标文件夹存在
if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
}

// 开始下载所有图像
downloadAllImages(urls, destinationFolder, (err, results) => {
    if (err) {
        console.error('Download process failed:', err);
    } else {
        console.log('Download process completed successfully.');
    }
});