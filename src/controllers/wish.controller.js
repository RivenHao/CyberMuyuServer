const db = require("../models");
const { msgSecCheck } = require("../utils/wxSecurity");
const Wish = db.wishes;

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { content, merit_cost } = req.body;

    // 参数校验
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "愿望内容不能为空" });
    }

    if (!merit_cost || merit_cost <= 0 || !Number.isInteger(merit_cost)) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "功德消耗必须是正整数" });
    }

    // 内容安全检测
    const secResult = await msgSecCheck(content.trim(), req.user.openid, 2);
    if (!secResult.pass) {
      await t.rollback();
      return res.status(400).send({ 
        code: 400, 
        msg: secResult.errmsg || "内容包含敏感信息，请修改后重试" 
      });
    }

    // 在事务中重新查询用户，获取最新余额
    const freshUser = await db.users.findByPk(req.user.id, { transaction: t });

    // 余额校验（使用最新数据）
    if (Number(freshUser.current_merit) < merit_cost) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "功德不足" });
    }

    // 1. 创建愿望
    const wish = await Wish.create({
      user_id: freshUser.id,
      content: content.trim(),
      merit_cost: merit_cost,
      status: "active",
    }, { transaction: t });

    // 2. 扣除功德
    await freshUser.update({
      current_merit: Number(freshUser.current_merit) - merit_cost
    }, { transaction: t });

    await t.commit();

    res.send({ code: 0, msg: "许愿成功", data: wish });
  } catch (err) {
    await t.rollback();
    console.error("Create Wish Error:", err);
    res.status(500).send({ code: 500, msg: err.message || "许愿失败" });
  }
};

exports.getUserWishes = async (req, res) => {
  try {
    const user = req.user; // 从中间件获取用户
    
    const data = await Wish.findAll({
      where: { user_id: user.id, status: "active" },
      order: [["created_at", "DESC"]],
    });
    res.send({ code: 0, msg: "success", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "查询失败: " + err.message });
  }
};

// 还愿
exports.fulfillWish = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { wish_id } = req.body;

    // 参数校验
    if (!wish_id) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "愿望ID不能为空" });
    }

    // 在事务中重新查询用户，获取最新余额
    const freshUser = await db.users.findByPk(req.user.id, { transaction: t });

    // 查找愿望（必须是当前用户的）
    const wish = await Wish.findOne({
      where: { id: wish_id, user_id: freshUser.id },
      transaction: t
    });

    if (!wish) {
      await t.rollback();
      return res.status(404).send({ code: 404, msg: "愿望不存在" });
    }

    if (wish.status === 'fulfilled') {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "该愿望已还愿" });
    }

    // 使用数据库中的 merit_cost，防止篡改
    const meritCost = Number(wish.merit_cost);

    // 余额校验（使用最新数据）
    if (Number(freshUser.current_merit) < meritCost) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "功德不足" });
    }

    // 1. 扣除功德
    await freshUser.update({
      current_merit: Number(freshUser.current_merit) - meritCost
    }, { transaction: t });

    // 2. 更新愿望状态
    await wish.update({
      status: "fulfilled",
      fulfilled_at: new Date(),
    }, { transaction: t });

    await t.commit();

    res.send({ code: 0, msg: "还愿成功", data: wish });
  } catch (err) {
    await t.rollback();
    console.error("Fulfill Wish Error:", err);
    res.status(500).send({ code: 500, msg: "还愿失败: " + err.message });
  }
};
