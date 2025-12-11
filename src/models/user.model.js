module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    openid: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(64)
    },
    avatar_url: {
      type: DataTypes.STRING(512)
    },
    current_merit: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    overflow_merit: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    pool_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_merit: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    settings: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'users',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['openid'],
        name: 'uk_openid'  // 指定固定的索引名，避免重复创建
      }
    ]
  });

  return User;
};
