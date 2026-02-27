-- ************************************************************
-- 心愿大类 + 心愿详情表
-- 使用方法: mysql -u root -p cyber_muyu < wish_categories.sql
-- ************************************************************

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- 心愿大类表
CREATE TABLE IF NOT EXISTS `wish_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '大类名称，如学业事业',
  `icon` VARCHAR(20) DEFAULT NULL COMMENT '图标emoji',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重，越小越靠前',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用：0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心愿大类表';

-- 心愿详情表
CREATE TABLE IF NOT EXISTS `wish_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL COMMENT '所属大类ID',
  `content` VARCHAR(100) NOT NULL COMMENT '心愿内容，如考试顺利',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用：0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_wish_item_category` FOREIGN KEY (`category_id`) REFERENCES `wish_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心愿详情表';

-- 初始化大类数据
INSERT INTO `wish_categories` (`id`, `name`, `icon`, `sort_order`) VALUES
(1, '学业事业', '🎓', 1),
(2, '姻缘感情', '💕', 2),
(3, '家宅平安', '🏠', 3),
(4, '财运亨通', '💰', 4),
(5, '健康长寿', '🌿', 5),
(6, '日常生活', '☀️', 6);

-- 初始化心愿数据
INSERT INTO `wish_items` (`category_id`, `content`, `sort_order`) VALUES
-- 学业事业
(1, '考试顺利通过', 1),
(1, '面试拿到offer', 2),
(1, '项目顺利上线', 3),
(1, '代码零bug', 4),
(1, '升职加薪', 5),
(1, '论文顺利发表', 6),
(1, '考研上岸', 7),
(1, '工作顺心', 8),
-- 姻缘感情
(2, '早日脱单', 1),
(2, '感情和睦', 2),
(2, '有情人终成眷属', 3),
(2, '婚姻幸福美满', 4),
(2, '友情长久', 5),
-- 家宅平安
(3, '家人身体健康', 1),
(3, '阖家平安', 2),
(3, '父母长寿安康', 3),
(3, '子女学业有成', 4),
(3, '家庭和睦', 5),
-- 财运亨通
(4, '收入稳步增长', 1),
(4, '投资顺利', 2),
(4, '不再月光', 3),
(4, '早日财务自由', 4),
-- 健康长寿
(5, '身体健康无病痛', 1),
(5, '睡眠质量变好', 2),
(5, '焦虑烦恼消散', 3),
(5, '精力充沛', 4),
(5, '远离亚健康', 5),
-- 日常生活
(6, '今天不加班', 1),
(6, '出行一路顺风', 2),
(6, '好运常伴', 3),
(6, '心想事成', 4),
(6, '万事胜意', 5);

SET FOREIGN_KEY_CHECKS=1;

-- 验证
SELECT c.name, COUNT(i.id) as item_count 
FROM wish_categories c 
LEFT JOIN wish_items i ON c.id = i.category_id 
GROUP BY c.id, c.name;
