const db = require("../models");
const UserGallery = db.userGallery;
const GalleryItem = db.galleryItems;

/**
 * 抽取随机佛理卡片（捐香火）
 * 规则：优先抽取低稀有度 (1 -> 2 -> 3)
 */
exports.getGalleryList = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const user = req.user; // 从中间件获取用户

    // 1. 获取所有佛理卡片
    const galleryList = await GalleryItem.findAll({
      order: [["rarity", "asc"]],
      transaction: t
    });

    // 2. 获取用户已拥有的卡片 ID 列表
    const userGalleryList = await UserGallery.findAll({
      where: { user_id: user.id },
      attributes: ["item_id"],
      transaction: t
    });
    const ownedIds = userGalleryList.map((ug) => ug.item_id);

    // 3. 筛选用户未拥有的卡片
    const availableCards = galleryList.filter(
      (item) => !ownedIds.includes(item.id)
    );

    // 4. 已集齐所有卡片
    if (availableCards.length === 0) {
      await t.commit();
      return res.send({
        code: 1,
        msg: "恭喜，你已集齐所有佛理卡片！",
        data: null,
      });
    }

    // 5. 按稀有度优先抽卡 (1 -> 2 -> 3)
    let selectedCard = null;
    for (const rarity of [1, 2, 3]) {
      const pool = availableCards.filter((item) => item.rarity === rarity);
      if (pool.length > 0) {
        selectedCard = pool[Math.floor(Math.random() * pool.length)];
        break;
      }
    }

    // 6. 创建用户-卡片关联（使用 findOrCreate 防止重复）
    const [record, created] = await UserGallery.findOrCreate({
      where: { user_id: user.id, item_id: selectedCard.id },
      defaults: { acquired_at: new Date() },
      transaction: t
    });

    if (!created) {
      // 极端情况：并发抽到同一张卡，重新抽取
      await t.rollback();
      return res.send({ code: 2, msg: "请重试", data: null });
    }

    await t.commit();

    // 7. 返回完整的卡片信息
    res.send({ code: 0, msg: "获取成功", data: selectedCard });
  } catch (err) {
    await t.rollback();
    console.error("Get Gallery Error:", err);
    res.status(500).send({ code: 500, msg: err.message || "获取卡片失败" });
  }
};

// 获取用户佛理卡片列表
exports.getUserGalleryList = async (req, res) => {
  try {
    const user = req.user; // 从中间件获取用户

    // 1. 获取所有佛理卡片
    const galleryList = await GalleryItem.findAll({
      order: [["rarity", "asc"]],
    });

    // 2. 获取用户已拥有的卡片
    const userGalleryList = await UserGallery.findAll({
      where: { user_id: user.id },
    });
    const ownedIds = userGalleryList.map((ug) => ug.item_id);

    // 3. 组合数据
    const finalData = galleryList.map((item) => {
      return {
        ...item.dataValues,
        is_owned: ownedIds.includes(item.id),
      };
    });
    
    // 4. 排序：已拥有的排在前面
    finalData.sort((a, b) => {
      if (a.is_owned === b.is_owned) return 0;
      return a.is_owned ? -1 : 1;
    });

    res.send({
      code: 0,
      msg: "获取成功",
      data: {
        list: finalData,
        total: finalData.length,
        ownedNum: ownedIds.length,
      },
    });
  } catch (err) {
    console.error("Get User Gallery Error:", err);
    res.status(500).send({ code: 500, msg: err.message || "获取卡片失败" });
  }
};
