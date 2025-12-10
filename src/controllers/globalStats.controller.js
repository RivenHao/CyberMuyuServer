const db = require("../models");
const GlobalStats = db.globalStats;

exports.addMerit = async (req, res) => {
  try {
    const meritToAdd = Number(req.body.merit);

    // 1. 查找或创建 'total_merit' 记录
    let [stats, created] = await GlobalStats.findOrCreate({
      where: { stat_key: 'total_merit' },
      defaults: { stat_value: 0 }
    });

    // 2. 增加功德
    // 注意：如果是刚创建的(created=true)，stat_value 已经是 0 了，直接加即可
    // 如果是查出来的，stats.stat_value 是当前值
    // Sequelize 的 increment 方法也可以，这里用 update 更直观
    const newValue = Number(stats.stat_value) + meritToAdd;
    
    await stats.update({ stat_value: newValue });

    res.send({ code: 0, msg: '全服功德已同步', data: { total_merit: newValue } });

  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "更新全服功德失败" });
  }
};

exports.getMerit = async (req, res) => {
  try {
    const stats = await GlobalStats.findByPk('total_merit');
    res.send({ code: 0, data: { total_merit: stats } });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "获取全服功德失败" });
  }
};
