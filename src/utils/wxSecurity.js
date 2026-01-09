/**
 * 微信内容安全检测工具
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/sec-center/sec-check/msgSecCheck.html
 */

// 缓存 access_token
let accessTokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * 获取微信 access_token
 * access_token 有效期为 2 小时，需要缓存
 */
async function getAccessToken() {
  const now = Date.now();
  
  // 如果缓存的 token 还有效（提前 5 分钟刷新）
  if (accessTokenCache.token && accessTokenCache.expiresAt > now + 5 * 60 * 1000) {
    return accessTokenCache.token;
  }

  const appId = process.env.WX_APP_ID;
  const appSecret = process.env.WX_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('服务器未配置 WX_APP_ID/WX_APP_SECRET');
  }

  const fetch = (await import('node-fetch')).default;
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (data.errcode) {
    console.error('获取 access_token 失败:', data);
    throw new Error(`获取 access_token 失败: ${data.errmsg}`);
  }

  // 缓存 token
  accessTokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000
  };

  return data.access_token;
}

/**
 * 文本内容安全检测
 * @param {string} content - 需要检测的文本内容
 * @param {string} openid - 用户的 openid
 * @param {number} scene - 场景值 (1: 资料, 2: 评论, 3: 论坛, 4: 社交日志)
 * @returns {Promise<{pass: boolean, errcode?: number, errmsg?: string, detail?: any}>}
 */
async function msgSecCheck(content, openid, scene = 2) {
  try {
    const accessToken = await getAccessToken();
    const fetch = (await import('node-fetch')).default;
    
    const url = `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content,
        version: 2,
        scene: scene,
        openid: openid
      })
    });

    const data = await res.json();

    // errcode 为 0 表示接口调用成功
    if (data.errcode !== 0) {
      console.error('内容安全检测接口错误:', data);
      // 接口调用失败时，为了不影响用户体验，可以选择放行
      // 但建议记录日志，后续人工审核
      return { 
        pass: true, 
        errcode: data.errcode, 
        errmsg: data.errmsg,
        warning: '内容安全接口调用失败，已放行但需人工复核'
      };
    }

    // 检查审核结果
    // result.suggest: "pass" 通过, "review" 需人工审核, "risky" 违规
    const result = data.result;
    
    if (result.suggest === 'pass') {
      return { pass: true };
    } else if (result.suggest === 'review') {
      // 需要人工审核的内容，可以选择放行或拦截
      console.warn('内容需人工审核:', content, result);
      return { 
        pass: false, 
        errmsg: '内容需要审核，请稍后再试',
        detail: result
      };
    } else {
      // risky - 违规内容
      console.warn('检测到违规内容:', content, result);
      return { 
        pass: false, 
        errmsg: '内容包含敏感信息，请修改后重试',
        detail: result
      };
    }
  } catch (err) {
    console.error('内容安全检测异常:', err);
    // 异常时放行，但记录日志
    return { 
      pass: true, 
      warning: '内容安全检测异常，已放行但需人工复核',
      error: err.message
    };
  }
}

module.exports = {
  getAccessToken,
  msgSecCheck
};

