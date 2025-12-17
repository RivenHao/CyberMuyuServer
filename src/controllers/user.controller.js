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
    const { openid } = req.body;
    if (!openid) {
      return res.status(401).send({ code: 401, msg: "未登录" });
    }
    const user = await User.findOne({ where: { openid } });
    if (!user) {
      return res.status(404).send({ code: 404, msg: "用户不存在" });
    }
    res.send({ code: 0, data: user });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message });
  }
};

// 同步功德 (核心接口)
exports.syncMerit = async (req, res) => {
  // 开启事务，保证用户表和全服表同时更新成功，否则都回滚
  const t = await db.sequelize.transaction();

  try {
    const { openid, increment } = req.body;

    if (!openid || increment <= 0) {
      await t.rollback(); // 虽没操作数据库，但好习惯
      return res.status(400).send({ code: 400, msg: "参数无效" });
    }

    // 1. 更新用户功德
    const user = await User.findOne({ where: { openid }, transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).send({ code: 404, msg: "用户不存在" });
    }

    // 检查是否溢出 (可选逻辑，这里暂只负责加)
    const newCurrent = Number(user.current_merit) + increment;
    const newTotal = Number(user.total_merit) + increment;
    const newOverflow = Number(user.overflow_merit); // 如果需要处理溢出逻辑可以在这加

    await user.update(
      {
        current_merit: newCurrent,
        total_merit: newTotal,
      },
      { transaction: t }
    );

    // 2. 更新全服功德
    // 使用 increment 方法更原子化，但为了拿到最新值，这里用 update 也可以
    // 注意：GlobalStats 需要确保只有一行 'total_merit'
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
    await t.rollback(); // 发生任何错误，回滚所有操作
    console.error("Sync Merit Error:", err);
    res.status(500).send({ code: 500, msg: "同步失败" });
  }
};

exports.decreaseMerit = async (req, res) => {
  try {
    const { openid, decrement } = req.body;
    if (!openid || decrement <= 0) {
      return res.status(400).send({ code: 400, msg: "参数无效" });
    }
    const user = await User.findOne({ where: { openid } });
    if (!user) {
      return res.status(404).send({ code: 404, msg: "用户不存在" });
    }
    const newCurrent = Number(user.current_merit) - decrement;
    await user.update({
      current_merit: newCurrent,
      updated_at: new Date(),
    });
    res.send({
      code: 0,
      msg: "功德减少成功",
      data: { current_merit: newCurrent },
    });
  } catch (err) {
    console.error("Decrease Merit Error:", err);
    res.status(500).send({ code: 500, msg: "功德减少失败" });
  }
};

exports.increasePoolLevel = async (req, res) => {
  try {
    const { openid } = req.body;
    if (!openid) {
      return res.status(400).send({ code: 400, msg: "参数无效" });
    }
    const user = await User.findOne({ where: { openid } });
    if (!user) {
      return res.status(404).send({ code: 404, msg: "用户不存在" });
    }
    await user.update({
      pool_level: user.pool_level + 1,
      updated_at: new Date(),
    });
    res.send({
      code: 0,
      msg: "扩充容量成功",
      data: { pool_level: user.pool_level + 1 },
    });
  } catch (err) {
    console.error("Increase Pool Level Error:", err);
    res.status(500).send({ code: 500, msg: "扩充容量失败" });
  }
};
