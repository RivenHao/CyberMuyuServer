module.exports = (sequelize, DataTypes) => {
  const GlobalStats = sequelize.define("GlobalStats", {
    stat_key: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false
    },
    stat_value: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'global_stats',
    underscored: true
  });

  return GlobalStats;
};

