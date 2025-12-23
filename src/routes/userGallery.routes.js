module.exports = app => {
  const userGallery = require("../controllers/userGallery.controller.js");
  const { authMiddleware } = require("../middlewares/auth.middleware.js");
  const router = require("express").Router();

  // 所有图鉴相关接口都需要登录
  router.post("/getGalleryList", authMiddleware, userGallery.getGalleryList);
  router.post("/getUserGalleryList", authMiddleware, userGallery.getUserGalleryList);
  
  app.use('/api/userGallery', router);
};