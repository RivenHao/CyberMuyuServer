module.exports = (app) => {
  const wishes = require("../controllers/wish.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // 所有愿望相关接口都需要登录
  router.post("/create", authMiddleware, wishes.create);
  router.get("/getUserWishes", authMiddleware, wishes.getUserWishes);
  router.post("/fulfillWish", authMiddleware, wishes.fulfillWish);
  router.post("/receiveShared", authMiddleware, wishes.receiveSharedWish);
  router.get("/getShared", authMiddleware, wishes.getSharedWish);
  
  app.use("/api/wish", router);
};
