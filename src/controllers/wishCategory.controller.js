const db = require("../models");
const WishCategory = db.wishCategories;
const WishItem = db.wishItems;

// 获取所有启用的心愿大类
exports.getCategories = async (req, res) => {
  try {
    const categories = await WishCategory.findAll({
      where: { is_active: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'name', 'icon']
    });
    res.send({ code: 0, data: categories });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "获取心愿大类失败: " + err.message });
  }
};

// 获取某个大类下的所有启用心愿
exports.getItemsByCategory = async (req, res) => {
  try {
    const { category_id } = req.query;
    if (!category_id) {
      return res.status(400).send({ code: 400, msg: "缺少 category_id 参数" });
    }

    const items = await WishItem.findAll({
      where: { category_id, is_active: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'content']
    });
    res.send({ code: 0, data: items });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "获取心愿列表失败: " + err.message });
  }
};

// 一次性获取所有大类及其心愿（减少请求次数）
exports.getAllWithItems = async (req, res) => {
  try {
    const categories = await WishCategory.findAll({
      where: { is_active: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'name', 'icon'],
      include: [{
        model: WishItem,
        as: 'items',
        where: { is_active: 1 },
        required: false,
        order: [['sort_order', 'ASC']],
        attributes: ['id', 'content']
      }]
    });
    res.send({ code: 0, data: categories });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "获取心愿数据失败: " + err.message });
  }
};
