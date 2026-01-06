module.exports = app => {
  const controller = require("../controllers/muyuConfig.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // 获取木鱼配置
  router.get("/", authMiddleware, controller.getConfig);

  // 更新木鱼配置
  router.put("/", authMiddleware, controller.updateConfig);

  // 重置为默认配置
  router.post("/reset", authMiddleware, controller.resetConfig);

  app.use('/api/muyu-config', router);
};

