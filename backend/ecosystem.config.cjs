module.exports = {
  apps: [
    {
      name: "express-app",
      script: "./app.js", // 你的应用入口文件
      instances: "max", // 或者指定实例数量，如 "1" 或 "2"
      exec_mode: "cluster", // 使用集群模式
      log_date_format: "YYYY-MM-DD HH:mm Z",
      out_file: "logs/out.log",
      error_file: "logs/err.log",
      merge_logs: true,
    },
  ],
};