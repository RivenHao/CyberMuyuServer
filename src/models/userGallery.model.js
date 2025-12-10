module.exports = (sequelize, DataTypes) => {
  const UserGallery = sequelize.define("UserGallery", {
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
    item_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    acquired_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_gallery',
    underscored: true,
    timestamps: false
  });

  return UserGallery;
};
