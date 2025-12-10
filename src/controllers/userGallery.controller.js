const db = require('../models');
const UserGallery = db.userGallery;
const GalleryItem = db.galleryItems;

/**
 * 抽取随机佛理卡片
 * 规则：优先抽取低稀有度 (1 -> 2 -> 3)
 */
exports.getGalleryList = async (req, res) => {
  try {
    const { user_id } = req.body;

    // 1. 获取所有佛理卡片
    const galleryList = await GalleryItem.findAll({ order: [['rarity', 'asc']] });

    // 2. 获取用户已拥有的卡片 ID 列表
    const userGalleryList = await UserGallery.findAll({
      where: { user_id },
      attributes: ['item_id'] // 只查 item_id，减少数据量
    });
    const ownedIds = userGalleryList.map(ug => ug.item_id);

    // 3. 筛选用户未拥有的卡片
    const availableCards = galleryList.filter(item => !ownedIds.includes(item.id));

    // 4. 已集齐所有卡片
    if (availableCards.length === 0) {
      return res.send({ code: 1, msg: "恭喜，你已集齐所有佛理卡片！", data: null });
    }

    // 5. 按稀有度优先抽卡 (1 -> 2 -> 3)
    let selectedCard = null;
    for (const rarity of [1, 2, 3]) {
      const pool = availableCards.filter(item => item.rarity === rarity);
      if (pool.length > 0) {
        selectedCard = pool[Math.floor(Math.random() * pool.length)];
        break;
      }
    }

    // 6. 创建用户-卡片关联
    await UserGallery.create({
      user_id,
      item_id: selectedCard.id,
      acquired_at: new Date()
    });

    // 7. 返回完整的卡片信息
    res.send({ code: 0, msg: "获取成功", data: selectedCard });

  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "获取卡片失败" });
  }
};
