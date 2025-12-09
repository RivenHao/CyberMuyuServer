module.exports = (sequelize, DataTypes) => {
  const GalleryItem = sequelize.define("GalleryItem", {
    title: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1024)
    },
    image_url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    rarity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
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
    tableName: 'gallery_items',
    underscored: true
  });

  return GalleryItem;
};

