module.exports = {
  apps: [
    {
      name: 'express-app',
      script: './app.js', // 你的应用入口文件
      instances: 'max', // 或者指定实例数量，如 "1" 或 "2"
      exec_mode: 'cluster', // 使用集群模式
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      out_file: 'logs/out.log',
      error_file: 'logs/err.log',
      merge_logs: true,
    },
    {
      name: 'task', // 自定义应用名称
      script: './tasks/index.js', // 主入口文件路径
      instances: 1, // 必须设置为 1（防止定时任务重复执行）
      autorestart: true, // 异常退出时自动重启
      watch: false, // 关闭文件监听（避免误重启）
      max_memory_restart: '500M', // 内存超过限制自动重启
      error_file: './logs/task/error.log', // 错误日志路径
      out_file: './logs/task/out.log', // 标准输出日志路径
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
