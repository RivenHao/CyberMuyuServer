module.exports = (sequelize, DataTypes) => {
  const MuyuConfig = sequelize.define("MuyuConfig", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '用户ID'
    },
    // ========== 连击阶段配置 ==========
    blue_combo: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: '蓝色阶段连击次数'
    },
    red_combo: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: '红色阶段连击次数'
    },
    orange_combo: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
      comment: '橙色阶段连击次数'
    },
    purple_combo: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      comment: '紫色阶段连击次数'
    },
    // ========== 连击节奏区间 ==========
    combo_interval_min: {
      type: DataTypes.INTEGER,
      defaultValue: 750,
      comment: '连击节奏最小间隔(ms)'
    },
    combo_interval_max: {
      type: DataTypes.INTEGER,
      defaultValue: 1500,
      comment: '连击节奏最大间隔(ms)'
    },
    // ========== 功德池容量配置 ==========
    pool_capacities: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '各等级功德池容量数组'
    },
    // ========== 沉浸模式配置 ==========
    immersive_tap_count: {
      type: DataTypes.INTEGER,
      defaultValue: 6,
      comment: '沉浸模式触发敲击次数'
    },
    immersive_timeout: {
      type: DataTypes.INTEGER,
      defaultValue: 2000,
      comment: '沉浸模式恢复超时时间(ms)'
    },
    // ========== 各阶段功德加成 ==========
    normal_merit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '普通阶段功德加成'
    },
    blue_merit: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      comment: '蓝色阶段功德加成'
    },
    red_merit: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      comment: '红色阶段功德加成'
    },
    orange_merit: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      comment: '橙色阶段功德加成'
    },
    purple_merit: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: '紫色阶段功德加成'
    }
  }, {
    tableName: 'muyu_configs',
    underscored: true,
    timestamps: true
  });

  return MuyuConfig;
};
