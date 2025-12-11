const db = require("../models");
const Wish = db.wishes;
const User = db.users;

exports.create = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body.content || !req.body.user_id) {
      return res.status(400).send({ code: 400, msg: "愿望内容和用户ID不能为空" });
    }

    // 构建数据对象
    const wishData = {
      user_id: req.body.user_id,
      content: req.body.content,
      merit_cost: req.body.merit_cost,
      status: "active",
    };

    // 保存到数据库
    const data = await Wish.create(wishData);
    
    // 扣除用户当前功德
    await User.decrement('current_merit', { 
      by: req.body.merit_cost, 
      where: { id: req.body.user_id } 
    });
    
    res.send({ code: 0, msg: "许愿成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "许愿失败" });
  }
};
