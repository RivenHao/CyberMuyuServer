module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // ========== 无需登录的接口 ==========
  // POST /api/auth/wx-login (微信登录)
  router.post("/wx-login", users.wxLogin);

  // ========== 需要登录的接口 ==========
  // GET /api/auth/profile
  router.get("/profile", authMiddleware, users.getProfile);

  // POST /api/auth/merit/sync
  router.post("/merit/sync", authMiddleware, users.syncMerit);

  // POST /api/auth/merit/decrease
  router.post("/merit/decrease", authMiddleware, users.decreaseMerit);

  // POST /api/auth/increasePoolLevel
  router.post("/increasePoolLevel", authMiddleware, users.increasePoolLevel);

  app.use('/api/auth', router);
};
