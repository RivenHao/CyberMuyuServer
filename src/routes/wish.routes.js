module.exports = (app) => {
  const wishes = require("../controllers/wish.controller.js");
  const router = require("express").Router();

  // 定义具体的 URL 规则
  router.post("/create", wishes.create); // POST /api/wishes -> 新增
  app.use("/api/wish", router);
};
