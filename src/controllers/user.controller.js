const db = require("../models");
const User = db.users;
const GlobalStats = db.globalStats; // 引入 GlobalStats
const Setting = db.settings;

// 微信登录（真实环境）
exports.wxLogin = async (req, res) => {
  try {
    const { code } = req.body;
    console.log("code", code);
    if (!code) {
      return res.status(400).send({ code: 400, msg: "缺少 code 参数" });
    }

    // 1. 用 code 换取 openid
    const appId = process.env.WX_APP_ID;
    const appSecret = process.env.WX_APP_SECRET;

    if (!appId || !appSecret) {
      return res
        .status(500)
        .send({ code: 500, msg: "服务器未配置 AppID/AppSecret" });
    }

    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    // 请求微信服务器
    const fetch = (await import("node-fetch")).default;
    const wxRes = await fetch(wxUrl);
    const wxData = await wxRes.json();

    if (wxData.errcode) {
      console.error("微信登录失败:", wxData);
      return res
        .status(400)
        .send({ code: 400, msg: "微信登录失败: " + wxData.errmsg });
    }

    const { openid, session_key } = wxData;

    // 2. 查找或创建用户
    const [user, created] = await User.findOrCreate({
      where: { openid },
      defaults: {
        nickname: `微信用户_${openid}`,
        avatar_url: "",
        current_merit: 0,
        pool_level: 0,
      },
    });

    // 3. 如果是新用户，创建默认设置
    const [setting, createdSetting] = await Setting.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        sound: true,
        vibration: true,
        immersive_mode: false,
        auto_click: false,
        bgm: false,
      },
    });

    res.send({
      code: 0,
      msg: created ? "新用户注册成功" : "登录成功",
      data: { user, setting },
    });
  } catch (err) {
    console.error("微信登录错误:", err);
    res.status(500).send({ code: 500, msg: "登录失败: " + err.message });
  }
};

// 获取用户信息
exports.getProfile = async (req, res) => {
  try {
    // 用户信息已由 authMiddleware 挂载到 req.user
    res.send({ code: 0, data: req.user });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message });
  }
};

// 同步功德 (核心接口)
exports.syncMerit = async (req, res) => {
  // 开启事务，保证用户表和全服表同时更新成功，否则都回滚
  const t = await db.sequelize.transaction();

  try {
    const { increment } = req.body;
    const user = req.user; // 从中间件获取用户

    // 参数校验
    if (!increment || increment <= 0 || !Number.isInteger(increment)) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "increment 必须是正整数" });
    }

    // 重新查询用户（在事务中）
    const freshUser = await User.findByPk(user.id, { transaction: t });

    // 计算新值
    const newCurrent = Number(freshUser.current_merit) + increment;
    const newTotal = Number(freshUser.total_merit) + increment;

    await freshUser.update(
      {
        current_merit: newCurrent,
        total_merit: newTotal,
      },
      { transaction: t }
    );

    // 2. 更新全服功德
    let [globalStat] = await GlobalStats.findOrCreate({
      where: { stat_key: "total_merit" },
      defaults: { stat_value: 0 },
      transaction: t,
    });

    await globalStat.update(
      {
        stat_value: Number(globalStat.stat_value) + increment,
      },
      { transaction: t }
    );

    // 3. 提交事务
    await t.commit();

    res.send({
      code: 0,
      msg: "同步成功",
      data: {
        current_merit: newCurrent,
        total_merit: newTotal,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("Sync Merit Error:", err);
    res.status(500).send({ code: 500, msg: "同步失败" });
  }
};

exports.decreaseMerit = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { decrement } = req.body;

    // 参数校验
    if (!decrement || decrement <= 0 || !Number.isInteger(decrement)) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "decrement 必须是正整数" });
    }

    // 在事务中重新查询用户，获取最新余额
    const freshUser = await User.findByPk(req.user.id, { transaction: t });
    
    // 余额校验（使用最新数据）
    if (Number(freshUser.current_merit) < decrement) {
      await t.rollback();
      return res.status(400).send({ code: 400, msg: "功德不足" });
    }

    const newCurrent = Number(freshUser.current_merit) - decrement;
    await freshUser.update({ current_merit: newCurrent }, { transaction: t });

    await t.commit();

    res.send({
      code: 0,
      msg: "功德减少成功",
      data: { current_merit: newCurrent },
    });
  } catch (err) {
    await t.rollback();
    console.error("Decrease Merit Error:", err);
    res.status(500).send({ code: 500, msg: "功德减少失败" });
  }
};

// 功德池容量配置: 50/100/500/1000/2000/3000/4000/5000
const POOL_CAPACITIES = [50, 100, 500, 1000, 2000, 3000, 4000, 5000];
const MAX_POOL_LEVEL = POOL_CAPACITIES.length - 1; // 7

exports.increasePoolLevel = async (req, res) => {
  try {
    const user = req.user; // 从中间件获取用户

    // 检查是否已达上限
    if (user.pool_level >= MAX_POOL_LEVEL) {
      return res.status(400).send({ 
        code: 400, 
        msg: "功德池已达最大容量",
        data: { pool_level: user.pool_level, max_capacity: POOL_CAPACITIES[MAX_POOL_LEVEL] }
      });
    }

    const newLevel = user.pool_level + 1;
    await user.update({ pool_level: newLevel });

    res.send({
      code: 0,
      msg: "扩充容量成功",
      data: { 
        pool_level: newLevel,
        new_capacity: POOL_CAPACITIES[newLevel]
      },
    });
  } catch (err) {
    console.error("Increase Pool Level Error:", err);
    res.status(500).send({ code: 500, msg: "扩充容量失败" });
  }
};

// 导出常量供其他模块使用
exports.POOL_CAPACITIES = POOL_CAPACITIES;
