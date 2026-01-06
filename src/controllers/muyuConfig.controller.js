const db = require("../models");
const MuyuConfig = db.muyuConfigs;

// 默认功德池容量
const DEFAULT_POOL_CAPACITIES = [10, 20, 30, 40, 50, 60, 70, 80];

// 获取木鱼配置
exports.getConfig = async (req, res) => {
  try {
    const userId = req.user.id;

    let config = await MuyuConfig.findOne({
      where: { user_id: userId }
    });

    // 如果没有配置，创建默认配置
    if (!config) {
      config = await MuyuConfig.create({
        user_id: userId,
        pool_capacities: DEFAULT_POOL_CAPACITIES
      });
    }

    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        // 连击阶段配置
        blue_combo: config.blue_combo,
        red_combo: config.red_combo,
        orange_combo: config.orange_combo,
        purple_combo: config.purple_combo, // 新增
        // 连击节奏区间
        combo_interval_min: config.combo_interval_min,
        combo_interval_max: config.combo_interval_max,
        // 功德池容量配置（如果为空则返回默认值）
        pool_capacities: config.pool_capacities || DEFAULT_POOL_CAPACITIES,
        // 沉浸模式配置
        immersive_tap_count: config.immersive_tap_count,
        immersive_timeout: config.immersive_timeout,
        // 各阶段功德加成
        normal_merit: config.normal_merit,
        blue_merit: config.blue_merit,
        red_merit: config.red_merit,
        orange_merit: config.orange_merit,
        purple_merit: config.purple_merit // 新增
      }
    });
  } catch (err) {
    console.error('获取木鱼配置失败:', err);
    res.status(500).json({
      code: 500,
      msg: '获取木鱼配置失败',
      error: err.message
    });
  }
};

// 更新木鱼配置
exports.updateConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // 允许更新的字段
    const allowedFields = [
      'blue_combo', 'red_combo', 'orange_combo', 'purple_combo',
      'combo_interval_min', 'combo_interval_max',
      'pool_capacities',
      'immersive_tap_count', 'immersive_timeout',
      'normal_merit', 'blue_merit', 'red_merit', 'orange_merit', 'purple_merit'
    ];

    // 过滤非法字段
    const filteredData = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    // 数据校验
    if (filteredData.blue_combo !== undefined && filteredData.blue_combo < 1) {
      return res.status(400).json({ code: 400, msg: '蓝色阶段连击次数必须大于0' });
    }
    if (filteredData.red_combo !== undefined && filteredData.red_combo < 1) {
      return res.status(400).json({ code: 400, msg: '红色阶段连击次数必须大于0' });
    }
    if (filteredData.orange_combo !== undefined && filteredData.orange_combo < 1) {
      return res.status(400).json({ code: 400, msg: '橙色阶段连击次数必须大于0' });
    }
    if (filteredData.purple_combo !== undefined && filteredData.purple_combo < 1) { // 新增校验
      return res.status(400).json({ code: 400, msg: '紫色阶段连击次数必须大于0' });
    }
    if (filteredData.combo_interval_min !== undefined && filteredData.combo_interval_min < 100) {
      return res.status(400).json({ code: 400, msg: '连击节奏最小间隔不能小于100ms' });
    }
    if (filteredData.combo_interval_max !== undefined && filteredData.combo_interval_max < 100) {
      return res.status(400).json({ code: 400, msg: '连击节奏最大间隔不能小于100ms' });
    }
    if (filteredData.pool_capacities !== undefined) {
      if (!Array.isArray(filteredData.pool_capacities) || filteredData.pool_capacities.length === 0) {
        return res.status(400).json({ code: 400, msg: '功德池容量必须是非空数组' });
      }
      for (const cap of filteredData.pool_capacities) {
        if (typeof cap !== 'number' || cap < 1) {
          return res.status(400).json({ code: 400, msg: '功德池容量必须是正整数' });
        }
      }
    }
    if (filteredData.immersive_tap_count !== undefined && filteredData.immersive_tap_count < 1) {
      return res.status(400).json({ code: 400, msg: '沉浸模式触发敲击次数必须大于0' });
    }
    if (filteredData.immersive_timeout !== undefined && filteredData.immersive_timeout < 500) {
      return res.status(400).json({ code: 400, msg: '沉浸模式恢复超时时间不能小于500ms' });
    }

    // 查找或创建配置
    let config = await MuyuConfig.findOne({
      where: { user_id: userId }
    });

    if (!config) {
      config = await MuyuConfig.create({
        user_id: userId,
        pool_capacities: DEFAULT_POOL_CAPACITIES,
        ...filteredData
      });
    } else {
      await config.update(filteredData);
    }

    res.json({
      code: 0,
      msg: '更新成功',
      data: {
        blue_combo: config.blue_combo,
        red_combo: config.red_combo,
        orange_combo: config.orange_combo,
        purple_combo: config.purple_combo, // 新增
        combo_interval_min: config.combo_interval_min,
        combo_interval_max: config.combo_interval_max,
        pool_capacities: config.pool_capacities,
        immersive_tap_count: config.immersive_tap_count,
        immersive_timeout: config.immersive_timeout,
        normal_merit: config.normal_merit,
        blue_merit: config.blue_merit,
        red_merit: config.red_merit,
        orange_merit: config.orange_merit,
        purple_merit: config.purple_merit // 新增
      }
    });
  } catch (err) {
    console.error('更新木鱼配置失败:', err);
    res.status(500).json({
      code: 500,
      msg: '更新木鱼配置失败',
      error: err.message
    });
  }
};

// 重置为默认配置
exports.resetConfig = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultConfig = {
      blue_combo: 5,
      red_combo: 10,
      orange_combo: 15,
      purple_combo: 20, // 新增
      combo_interval_min: 750,
      combo_interval_max: 1500,
      pool_capacities: [10, 20, 30, 40, 50, 60, 70, 80],
      immersive_tap_count: 6,
      immersive_timeout: 2000,
      normal_merit: 1,
      blue_merit: 2,
      red_merit: 3,
      orange_merit: 4,
      purple_merit: 5 // 新增
    };

    let config = await MuyuConfig.findOne({
      where: { user_id: userId }
    });

    if (!config) {
      config = await MuyuConfig.create({
        user_id: userId,
        ...defaultConfig
      });
    } else {
      await config.update(defaultConfig);
    }

    res.json({
      code: 0,
      msg: '已重置为默认配置',
      data: defaultConfig
    });
  } catch (err) {
    console.error('重置木鱼配置失败:', err);
    res.status(500).json({
      code: 500,
      msg: '重置木鱼配置失败',
      error: err.message
    });
  }
};
