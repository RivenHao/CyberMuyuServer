const db = require("../models");
const Wish = db.wishes;
const User = db.users;

exports.create = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body.content || !req.body.user_id) {
      return res
        .status(400)
        .send({ code: 400, msg: "愿望内容和用户ID不能为空" });
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
    await User.decrement("current_merit", {
      by: req.body.merit_cost,
      where: { id: req.body.user_id },
    });

    res.send({ code: 0, msg: "许愿成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "许愿失败" });
  }
};

exports.getUserWishes = async (req, res) => {
  try {
    const data = await Wish.findAll({
      where: { user_id: req.query.user_id, status: "active" },
      order: [["created_at", "DESC"]],
    });
    res.send({ code: 0, msg: "success", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "查询失败" + err.message });
  }
};

// 还愿
exports.fulfillWish = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body.user_id || !req.body.id) {
      return res
        .status(400)
        .send({ code: 400, msg: "用户ID和愿望ID不能为空" });
    }
    // 校验愿望是否存在
    const wish = await Wish.findByPk(req.body.id);
    if (!wish) {
      return res
        .status(404)
        .send({ code: 404, msg: "愿望不存在" });
    }
    // 校验功德是否足够
    if (wish.merit_cost > (await User.findByPk(req.body.user_id)).current_merit) {
      return res
        .status(400)
        .send({ code: 400, msg: "功德不足" });
    }
    // 扣除用户当前功德
    await User.decrement("current_merit", {
      by: req.body.merit_cost,
      where: { id: req.body.user_id },
    });
    // 更新愿望状态
    const data = await Wish.update(
      {
        status: "fulfilled",
        fulfilled_at: new Date(),
      },
      { where: { user_id: req.body.user_id, id: req.body.id } }
    );
    
    res.send({ code: 0, msg: "还愿成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "还愿失败" + err.message });
  }
};
