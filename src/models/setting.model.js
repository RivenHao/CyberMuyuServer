module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define("Setting", {
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
      }
    },
    sound: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '音效'
    },
    vibration: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '震感'
    },
    immersive_mode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '沉浸模式'
    },
    auto_click: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '自动点击'
    },
    bgm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '背景音乐'
    }
  }, {
    tableName: 'settings',
    underscored: true,
    timestamps: true
  });

  return Setting;
};

