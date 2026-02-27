module.exports = (sequelize, DataTypes) => {
  const WishCategory = sequelize.define("WishCategory", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(20),
      defaultValue: null
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'wish_categories',
    underscored: true
  });

  return WishCategory;
};
