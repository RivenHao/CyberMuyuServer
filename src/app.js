const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// 1. 中间件 (必须放在路由之前)
app.use(cors()); // 允许跨域
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true }));

// 2. 路由
require("./routes/wish.routes")(app);
require("./routes/gallery.routes")(app);
require("./routes/user.routes")(app);
require("./routes/userGallery.routes")(app);
require("./routes/globalStats.routes")(app);
require("./routes/setting.routes")(app);
require("./routes/muyuConfig.routes")(app);

// 简单的健康检查路由
app.get('/', (req, res) => {
  res.json({ message: 'Cyber Muyu API is running.' });
});

// 3. 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, msg: '服务器内部错误', error: err.message });
});

module.exports = app;
