module.exports = (app) => {
  const wishCategory = require("../controllers/wishCategory.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // 获取心愿大类列表
  router.get("/getCategories", authMiddleware, wishCategory.getCategories);
  // 获取某大类下的心愿列表
  router.get("/getItems", authMiddleware, wishCategory.getItemsByCategory);
  // 一次性获取所有大类及心愿
  router.get("/getAll", authMiddleware, wishCategory.getAllWithItems);

  app.use("/api/wishCategory", router);
};
