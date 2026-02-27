module.exports = (sequelize, DataTypes) => {
  const WishItem = sequelize.define("WishItem", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    tableName: 'wish_items',
    underscored: true
  });

  return WishItem;
};
