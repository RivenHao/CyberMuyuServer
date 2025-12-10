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
    }
  }, {
    tableName: 'global_stats',
    underscored: true,
    timestamps: true 
  });

  return GlobalStats;
};
