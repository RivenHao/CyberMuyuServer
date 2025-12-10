module.exports = (app) => {
  const wishes = require("../controllers/wish.controller.js");
  const router = require("express").Router();

  // 定义具体的 URL 规则
  router.post("/", wishes.create); // POST /api/wishes -> 新增
//   router.get("/", wishes.findAll); // GET /api/wishes -> 列表
//   router.get("/:id", wishes.findOne); // GET /api/wishes/123 -> 详情
//   router.put("/:id", wishes.update); // PUT /api/wishes/123 -> 修改
//   router.delete("/:id", wishes.delete); // DELETE /api/wishes/123 -> 删除

  // 挂载到主应用
  app.use("/api/wishes", router);
};
