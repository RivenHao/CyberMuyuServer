module.exports = app => {
  const settings = require("../controllers/setting.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // 所有设置相关接口都需要登录
  router.get("/", authMiddleware, settings.get);
  router.put("/", authMiddleware, settings.update);

  app.use('/api/setting', router);
};
