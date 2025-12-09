const Sequelize = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // 设置为 console.log 可以查看生成的 SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 导入模型
db.users = require("./user.model.js")(sequelize, Sequelize);
db.wishes = require("./wish.model.js")(sequelize, Sequelize);
db.galleryItems = require("./gallery.model.js")(sequelize, Sequelize);
db.userGallery = require("./userGallery.model.js")(sequelize, Sequelize);
db.globalStats = require("./globalStats.model.js")(sequelize, Sequelize);

// 建立关联关系
// User <-> Wish (一对多)
db.users.hasMany(db.wishes, { foreignKey: "user_id", as: "wishes" });
db.wishes.belongsTo(db.users, { foreignKey: "user_id", as: "user" });

// User <-> GalleryItem (多对多，通过 UserGallery)
db.users.belongsToMany(db.galleryItems, {
  through: db.userGallery,
  foreignKey: "user_id",
  otherKey: "item_id",
  as: "collectedItems"
});
db.galleryItems.belongsToMany(db.users, {
  through: db.userGallery,
  foreignKey: "item_id",
  otherKey: "user_id",
  as: "collectors"
});

module.exports = db;

