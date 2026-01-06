-- 木鱼配置表
CREATE TABLE IF NOT EXISTS `muyu_configs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  
  -- 连击阶段配置
  `blue_combo` INT DEFAULT 5 COMMENT '蓝色阶段连击次数',
  `red_combo` INT DEFAULT 10 COMMENT '红色阶段连击次数',
  `orange_combo` INT DEFAULT 15 COMMENT '橙色阶段连击次数',
  `purple_combo` INT DEFAULT 20 COMMENT '紫色阶段连击次数',
  
  -- 连击节奏区间
  `combo_interval_min` INT DEFAULT 750 COMMENT '连击节奏最小间隔(ms)',
  `combo_interval_max` INT DEFAULT 1500 COMMENT '连击节奏最大间隔(ms)',
  
  -- 功德池容量配置
  `pool_capacities` JSON COMMENT '各等级功德池容量数组',
  
  -- 沉浸模式配置
  `immersive_tap_count` INT DEFAULT 6 COMMENT '沉浸模式触发敲击次数',
  `immersive_timeout` INT DEFAULT 2000 COMMENT '沉浸模式恢复超时时间(ms)',
  
  -- 各阶段功德加成
  `normal_merit` INT DEFAULT 1 COMMENT '普通阶段功德加成',
  `blue_merit` INT DEFAULT 2 COMMENT '蓝色阶段功德加成',
  `red_merit` INT DEFAULT 3 COMMENT '红色阶段功德加成',
  `orange_merit` INT DEFAULT 4 COMMENT '橙色阶段功德加成',
  `purple_merit` INT DEFAULT 5 COMMENT '紫色阶段功德加成',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_muyu_config_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='木鱼配置表';
