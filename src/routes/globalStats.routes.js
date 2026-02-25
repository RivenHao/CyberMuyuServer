module.exports = (app) => {
    const globalStats = require("../controllers/globalStats.controller.js");
    const router = require("express").Router();
  
    // 定义具体的 URL 规则
    router.post("/addMerit", globalStats.addMerit); // POST /api/wishes -> 新增
    router.get("/getAllMerit", globalStats.getAllMerit); // GET /api/wishes -> 列表
    router.get("/getShowWish", globalStats.getShowWish); // GET 许愿功能开关
    // 挂载到主应用
    app.use("/api/globalStats", router);
};