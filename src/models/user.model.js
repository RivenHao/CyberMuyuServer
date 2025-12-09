module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    openid: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
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
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    underscored: true
  });

  return User;
};

