const db = require("../models");
const GalleryItem = db.galleryItems;
exports.create = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body) {
      return res.status(400).send({ code: 400, msg: "请求参数不能为空" });
    }

    // 构建数据对象
    const galleryItemData = {
      title: req.body.title,
      description: req.body.description,
      image_url: req.body.image_url,
      rarity: req.body.rarity,
      explanation: req.body.explanation,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 保存到数据库
    const data = await GalleryItem.create(galleryItemData);
    res.send({ code: 0, msg: "创建成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "创建失败" });
  }
};
exports.findAll = async (req, res) => {
  try {
    const data = await GalleryItem.findAll();
    res.send({ code: 0, msg: "查询成功", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "查询失败" });
  }
};
