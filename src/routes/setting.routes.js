module.exports = app => {
  const settings = require("../controllers/setting.controller.js");
  const router = require("express").Router();

  // GET /api/setting - 获取设置
  router.get("/", settings.get);

  // PUT /api/setting - 更新设置
  router.put("/", settings.update);

  app.use('/api/setting', router);
};
