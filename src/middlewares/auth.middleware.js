const db = require("../models");
const User = db.users;

/**
 * 身份验证中间件
 * 从 Authorization header 获取 token (openid)，验证用户身份
 * 
 * Header 格式: Authorization: Bearer <openid>
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. 获取 Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ 
        code: 401, 
        msg: '未登录，请先登录' 
      });
    }

    // 2. 提取 token (openid)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).send({ 
        code: 401, 
        msg: 'token 无效' 
      });
    }

    // 3. 查询用户是否存在
    const user = await User.findOne({ where: { openid: token } });
    
    if (!user) {
      return res.status(401).send({ 
        code: 401, 
        msg: '用户不存在，请重新登录' 
      });
    }

    // 4. 将用户信息挂载到 req 对象，供后续使用
    req.user = user;
    req.openid = token;

    // 5. 继续执行后续中间件/路由
    next();

  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).send({ 
      code: 500, 
      msg: '身份验证失败' 
    });
  }
};

/**
 * 可选的身份验证中间件
 * 如果有 token 则验证，没有也放行（用于部分接口）
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const user = await User.findOne({ where: { openid: token } });
        if (user) {
          req.user = user;
          req.openid = token;
        }
      }
    }
    
    next();
  } catch (err) {
    // 可选验证，出错也放行
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};

