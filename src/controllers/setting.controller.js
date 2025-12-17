const db = require("../models");
const Setting = db.settings;

// 获取用户设置
exports.get = async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) {
      return res.status(401).send({ code: 401, msg: '未授权' });
    }

    // 查找或创建默认设置
    const [setting] = await Setting.findOrCreate({
      where: { user_id: userId },
      defaults: {
        sound: true,
        vibration: true,
        immersive_mode: false,
        auto_click: false,
        bgm: false
      }
    });

    res.send({ code: 0, msg: '获取成功', data: setting });
  } catch (err) {
    console.error(err);
    res.status(500).send({ code: 500, msg: err.message || "获取设置失败" });
  }
};

// 更新用户设置
exports.update = async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) {
      return res.status(401).send({ code: 401, msg: '未授权' });
    }

    const { sound, vibration, immersive_mode, auto_click, bgm } = req.body;

    // 查找或创建
    let [setting, created] = await Setting.findOrCreate({
      where: { user_id: userId },
      defaults: { sound: true, vibration: true, immersive_mode: false, auto_click: false, bgm: false }
    });

    // 更新传入的字段
    const updateData = {};
    if (typeof sound === 'boolean') updateData.sound = sound;
    if (typeof vibration === 'boolean') updateData.vibration = vibration;
    if (typeof immersive_mode === 'boolean') updateData.immersive_mode = immersive_mode;
    if (typeof auto_click === 'boolean') updateData.auto_click = auto_click;
    if (typeof bgm === 'boolean') updateData.bgm = bgm;

    if (Object.keys(updateData).length > 0) {
      await setting.update(updateData);
    }

    res.send({ code: 0, msg: '更新成功', data: setting });
  } catch (err) {
    console.error(err);
    res.status(500).send({ code: 500, msg: err.message || "更新设置失败" });
  }
};
