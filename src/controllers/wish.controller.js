const db = require("../models");
const Wish = db.wishes;
exports.create = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body.content) {
      return res.status(400).send({ code: 400, msg: "愿望内容不能为空" });
    }

    // 构建数据对象
    const wishData = {
      user_id: req.body.user_id, // 实际项目中应从 Token 获取
      content: req.body.content,
      merit_cost: req.body.merit_cost,
      status: "active",
    };

    // 保存到数据库
    const data = await Wish.create(wishData);
    res.send({ code: 0, msg: "许愿成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "许愿失败" });
  }
};
