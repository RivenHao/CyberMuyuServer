module.exports = (sequelize, DataTypes) => {
  const GalleryItem = sequelize.define("GalleryItem", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(64),
    },
    description: {
      type: DataTypes.STRING(1024)
    },
    image_url: {
      type: DataTypes.STRING(512),
    },
    rarity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    explanation: {
      type: DataTypes.STRING(1024)
    }
  }, {
    tableName: 'gallery_items',
    underscored: true
  });

  return GalleryItem;
};
