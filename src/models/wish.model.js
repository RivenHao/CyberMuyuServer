module.exports = (sequelize, DataTypes) => {
  const Wish = sequelize.define("Wish", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    merit_cost: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'fulfilled'),
      defaultValue: 'active'
    },
    fulfilled_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'wishes',
    underscored: true
  });

  return Wish;
};
