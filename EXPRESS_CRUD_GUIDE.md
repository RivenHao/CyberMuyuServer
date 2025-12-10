# Express + Sequelize 增删改查 (CRUD) 开发指南

本文档旨在帮助你快速掌握在 Express 项目中使用 Sequelize 进行数据库增删改查的标准流程。

## 1. 核心概念速览

| 操作 | HTTP 方法 | Sequelize 方法 | 例子 |
| :--- | :--- | :--- | :--- |
| **增 (Create)** | `POST` | `Model.create()` | 用户注册、新增功德 |
| **查 (Read)** | `GET` | `Model.findAll()` / `findOne()` / `findByPk()` | 获取列表、详情 |
| **改 (Update)** | `PUT` / `PATCH` | `Model.update()` | 修改设置、还愿 |
| **删 (Delete)** | `DELETE` | `Model.destroy()` | 删除记录 |

---

## 2. 标准开发流程

开发一个新功能（如“许愿”），通常需要修改以下三个文件：

1.  **Model (模型)**: 定义数据结构 (这一步我们之前已经做好了)
2.  **Controller (控制器)**: 编写业务逻辑 (`server/src/controllers/`)
3.  **Route (路由)**: 定义 API 地址 (`server/src/routes/`)

---

## 3. 实战示例：许愿功能 (Wishes)

假设我们要实现对 `wishes` 表的增删改查。

### 3.1 编写控制器 (`src/controllers/wish.controller.js`)

```javascript
const db = require('../models');
const Wish = db.wishes;

// 1. 新增愿望 (Create)
exports.create = async (req, res) => {
  try {
    // 校验请求参数
    if (!req.body.content) {
      return res.status(400).send({ code: 400, msg: "愿望内容不能为空" });
    }

    // 构建数据对象
    const wishData = {
      user_id: req.body.user_id, // 实际项目中应从 Token 获取
      content: req.body.content,
      merit_cost: req.body.merit_cost || 100,
      status: 'active'
    };

    // 保存到数据库
    const data = await Wish.create(wishData);
    res.send({ code: 0, msg: "许愿成功", data: data });

  } catch (err) {
    res.status(500).send({ code: 500, msg: err.message || "许愿失败" });
  }
};

// 2. 查询所有愿望 (Read - List)
exports.findAll = async (req, res) => {
  try {
    const data = await Wish.findAll({
      where: { user_id: req.query.user_id }, // 可选过滤条件
      order: [['created_at', 'DESC']]        // 按时间倒序
    });
    res.send({ code: 0, msg: "success", data: data });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "查询失败" });
  }
};

// 3. 查询单个详情 (Read - Detail)
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Wish.findByPk(id);
    if (data) {
      res.send({ code: 0, msg: "success", data: data });
    } else {
      res.status(404).send({ code: 404, msg: "找不到该愿望" });
    }
  } catch (err) {
    res.status(500).send({ code: 500, msg: "查询出错" });
  }
};

// 4. 修改愿望/还愿 (Update)
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    // update 返回的是受影响的行数数组，如 [1]
    const [num] = await Wish.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      res.send({ code: 0, msg: "更新成功" });
    } else {
      res.send({ code: 400, msg: "更新失败，可能是ID不存在或数据未变" });
    }
  } catch (err) {
    res.status(500).send({ code: 500, msg: "更新出错" });
  }
};

// 5. 删除愿望 (Delete)
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await Wish.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({ code: 0, msg: "删除成功" });
    } else {
      res.send({ code: 400, msg: "删除失败，ID可能不存在" });
    }
  } catch (err) {
    res.status(500).send({ code: 500, msg: "删除出错" });
  }
};
```

### 3.2 编写路由 (`src/routes/wish.routes.js`)

```javascript
module.exports = app => {
  const wishes = require("../controllers/wish.controller.js");
  const router = require("express").Router();

  // 定义具体的 URL 规则
  router.post("/", wishes.create);           // POST /api/wishes -> 新增
  router.get("/", wishes.findAll);           // GET /api/wishes -> 列表
  router.get("/:id", wishes.findOne);        // GET /api/wishes/123 -> 详情
  router.put("/:id", wishes.update);         // PUT /api/wishes/123 -> 修改
  router.delete("/:id", wishes.delete);      // DELETE /api/wishes/123 -> 删除

  // 挂载到主应用
  app.use('/api/wishes', router);
};
```

### 3.3 注册路由 (`src/app.js`)

别忘了在入口文件里引用它！

```javascript
// ... existing code ...
const app = express();

// 引入路由
require("./routes/wish.routes")(app);

// ... existing code ...
```

---

## 4. 常用 Sequelize 查询技巧

### 4.1 分页查询
```javascript
const limit = 10;
const offset = 0; // (page - 1) * limit
Wish.findAndCountAll({ limit, offset });
```

### 4.2 关联查询 (连表)
例如：查询愿望时，顺便把用户名字带出来。
```javascript
Wish.findAll({
  include: ["user"] // 需要在 Model index.js 里先定义好关联关系
});
```

### 4.3 字段筛选
只查 id 和 title，不查其他大字段。
```javascript
User.findAll({
  attributes: ['id', 'nickname', 'total_merit']
});
```

### 4.4 条件过滤 (Where)
```javascript
const Op = db.Sequelize.Op;
Wish.findAll({
  where: {
    content: { [Op.like]: '%求财%' }, // 模糊查询
    merit_cost: { [Op.gte]: 100 }     // 大于等于 100
  }
});
```

---

## 5. 调试建议

1.  **使用 Postman / Apifox**: 开发完接口后，先用工具测一下，不要直接对接前端。
2.  **查看 SQL 日志**: 在 `src/models/index.js` 里设置 `logging: console.log`，可以看到每次请求背后生成的真实 SQL 语句，排查 bug 神器。

