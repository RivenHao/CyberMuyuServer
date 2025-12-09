const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 3000;

// 连接数据库并启动服务
// alter: true 选项会自动更新数据库表结构以匹配模型定义
// force: true 会删除表重建 (小心使用!)
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database connected and synced.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    // 数据库连接失败时，退出进程或者降级启动
    // process.exit(1); 
  });
