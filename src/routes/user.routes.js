module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const router = require("express").Router();

  // POST /api/auth/dev-login
  router.post("/dev-login", users.devLogin);
  
  // GET /api/auth/profile
  router.get("/profile", users.getProfile);

  // POST /api/auth/merit/sync (注意路径，这里其实建议放在 /api/user/merit/sync 更好，但为了方便暂时挂在 auth 下或者新建 user.routes)
  // 这里我们稍微改一下挂载点，下面这一行是新增的
  router.post("/merit/sync", users.syncMerit);

  // POST /api/auth/merit/decrease
  router.post("/merit/decrease", users.decreaseMerit);

  // POST /api/auth/increasePoolLevel
  router.post("/increasePoolLevel", users.increasePoolLevel);

  app.use('/api/auth', router);
};
