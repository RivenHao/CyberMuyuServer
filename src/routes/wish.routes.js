module.exports = (app) => {
  const wishes = require("../controllers/wish.controller.js");
  const router = require("express").Router();

  // 定义具体的 URL 规则
  router.post("/create", wishes.create); // POST /api/wishes -> 新增
  router.get("/getUserWishes", wishes.getUserWishes); // GET /api/wishes/getUserWishes -> 查询用户愿望
  router.post("/fulfillWish", wishes.fulfillWish); // POST /api/wishes/fulfillWish -> 还愿
  app.use("/api/wish", router);
};
