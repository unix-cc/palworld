// ============================================================================
// PalWorldSettings.ini 配置项元数据 (中文说明 + 类型 + 分类)
//
// 分类严格对齐官方文档的四个分组:
//   https://docs.palworldgame.com/settings-and-operation/configuration
//     - Performances      性能 (提高会增加服务器负载)
//     - Server management 服务器管理
//     - Features          玩法功能开关
//     - Game balances     游戏平衡 (各类倍率/惩罚)
//
// managed=true 表示该项由 game/server.env 在每次启动时重新写入, 面板改了重启会被
// 覆盖, 故设为只读并给出提示。
//
// 注: RCON 在本项目已废弃, 面板与后台全程使用官方 REST API。
// ============================================================================

export type FieldType = 'bool' | 'int' | 'float' | 'text' | 'select'

export type CategoryKey = 'performance' | 'server' | 'features' | 'balance'

export interface FieldMeta {
  cat: CategoryKey
  label: string
  type: FieldType
  desc: string
  options?: string[]
  managed?: boolean
  note?: string
  /**
   * 数值项 (int/float) 的滑块范围。给定后渲染「滑块 + 数字框」组合。
   * 范围对齐游戏内「世界设置」滑块的常用边界; 数字框仍可自由输入 (允许超出滑块范围)。
   */
  min?: number
  max?: number
  step?: number
}

export interface Category {
  key: CategoryKey
  title: string
  tip: string
}

export const CATEGORIES: Category[] = [
  { key: 'performance', title: '性能', tip: '这些项调高会显著增加服务器 CPU / 内存 / 磁盘负载, 按机器配置谨慎设置。' },
  { key: 'server', title: '服务器管理', tip: '服务器身份、网络、跨平台、日志等运维相关设置。' },
  { key: 'features', title: '玩法功能', tip: '开关类玩法功能 (PvP / 硬核 / 语音 / 快速旅行 / 随机化等)。' },
  { key: 'balance', title: '游戏平衡', tip: '各类倍率与惩罚, 决定游戏节奏与难度。多为倍率, 1.0 为原版。' },
]

export const SCHEMA: Record<string, FieldMeta> = {
  // ------------------------------------------------------------------ 性能
  BaseCampMaxNum: {
    cat: 'performance', label: '全服据点总数上限', type: 'int',
    desc: '整个服务器允许存在的据点(基地)总数量。',
    min: 0, max: 1000, step: 1,
  },
  BaseCampMaxNumInGuild: {
    cat: 'performance', label: '每公会据点数上限', type: 'int',
    desc: '单个公会可拥有的最大据点数。默认 4, 最大 10。',
    note: '调高会增加处理负载。',
    min: 1, max: 10, step: 1,
  },
  BaseCampWorkerMaxNum: {
    cat: 'performance', label: '每据点帕鲁数上限', type: 'int',
    desc: '单个据点内可工作的帕鲁最大数量 (最大 50)。',
    note: '调高会增加处理负载。',
    min: 1, max: 50, step: 1,
  },
  ItemContainerForceMarkDirtyInterval: {
    cat: 'performance', label: '容器界面同步间隔(秒)', type: 'float',
    desc: '打开箱子/容器界面时, 强制重新同步的时间间隔 (秒)。',
    min: 0, max: 5, step: 0.1,
  },
  MaxBuildingLimitNum: {
    cat: 'performance', label: '每人建筑数量上限', type: 'int',
    desc: '每个玩家可建造的建筑数量上限 (0 = 不限制)。',
    min: 0, max: 5000, step: 10,
  },
  PhysicsActiveDropItemMaxNum: {
    cat: 'performance', label: '掉落物物理数量上限', type: 'int',
    desc: '可参与物理行为(受力/滚动)的掉落物最大数量。',
    min: 100, max: 5000, step: 100,
  },
  ServerReplicatePawnCullDistance: {
    cat: 'performance', label: '帕鲁同步距离(cm)', type: 'float',
    desc: '帕鲁相对玩家的同步距离 (单位 cm)。最小 5000, 最大 15000。',
    min: 5000, max: 15000, step: 500,
  },

  // -------------------------------------------------------------- 服务器管理
  ServerName: {
    cat: 'server', label: '服务器名称', type: 'text', managed: true,
    desc: '服务器显示名称。',
  },
  ServerDescription: {
    cat: 'server', label: '服务器描述', type: 'text', managed: true,
    desc: '服务器描述信息。',
  },
  ServerPassword: {
    cat: 'server', label: '进服密码', type: 'text', managed: true,
    desc: '进入服务器所需的密码 (留空为公开服)。',
  },
  AdminPassword: {
    cat: 'server', label: '管理员密码', type: 'text', managed: true,
    desc: '获取服务器管理员权限的密码, 同时用于 REST API 认证。',
  },
  ServerPlayerMaxNum: {
    cat: 'server', label: '最大在线人数', type: 'int', managed: true,
    desc: '服务器允许同时在线的最大玩家数。',
  },
  RESTAPIEnabled: {
    cat: 'server', label: '启用 REST API', type: 'bool', managed: true,
    desc: '是否启用 REST API (本面板依赖此项管理服务器)。',
  },
  RESTAPIPort: {
    cat: 'server', label: 'REST API 端口', type: 'int', managed: true,
    desc: 'REST API 的监听端口。',
  },
  PublicIP: {
    cat: 'server', label: '公网 IP', type: 'text',
    desc: '(社区服) 手动指定对外公网 IP, 留空自动探测。',
  },
  PublicPort: {
    cat: 'server', label: '公网端口', type: 'int',
    desc: '(社区服) 手动指定对外公网端口。不会改变服务器实际监听端口。',
  },
  CrossplayPlatforms: {
    cat: 'server', label: '允许的跨平台', type: 'text',
    desc: '允许连入服务器的平台。默认 (Steam,Xbox,PS5,Mac)。',
    note: '格式为括号包裹的逗号分隔, 如 (Steam,Xbox,PS5,Mac)。',
  },
  AllowConnectPlatform: {
    cat: 'server', label: '允许连接平台(已弃用)', type: 'text',
    desc: '当前版本不可用, 请改用「允许的跨平台 CrossplayPlatforms」。',
  },
  bAllowClientMod: {
    cat: 'server', label: '允许 Mod 玩家加入', type: 'bool',
    desc: '是否允许启用了 Mod 的玩家加入服务器。',
  },
  bEnableBuildingPlayerUIdDisplay: {
    cat: 'server', label: '建筑显示建造者ID', type: 'bool',
    desc: '是否在建筑上显示建造者的玩家 ID。',
  },
  bIsShowJoinLeftMessage: {
    cat: 'server', label: '显示进/退服消息', type: 'bool',
    desc: '专用服务器上, 玩家加入/离开时是否在游戏内显示提示消息。',
  },
  bIsUseBackupSaveData: {
    cat: 'server', label: '启用世界备份', type: 'bool',
    desc: '是否启用世界存档备份。',
    note: '开启会增加磁盘负载。',
  },
  ChatPostLimitPerMinute: {
    cat: 'server', label: '每分钟聊天上限', type: 'int',
    desc: '每分钟允许发送的聊天消息条数上限。',
    min: 0, max: 120, step: 5,
  },
  LogFormatType: {
    cat: 'server', label: '日志格式', type: 'select', options: ['Text', 'Json'],
    desc: '服务器日志格式: Text 文本 或 Json。',
  },

  // ------------------------------------------------------------------ 玩法功能
  bIsPvP: {
    cat: 'features', label: '启用 PvP', type: 'bool',
    desc: '是否开启玩家对战 (PvP)。',
  },
  bHardcore: {
    cat: 'features', label: '硬核模式', type: 'bool',
    desc: '启用硬核模式。死亡后无法复活。',
  },
  bCharacterRecreateInHardcore: {
    cat: 'features', label: '硬核可重建角色', type: 'bool',
    desc: '硬核模式下死亡后是否允许重新创建角色。',
  },
  bPalLost: {
    cat: 'features', label: '死亡永久失去帕鲁', type: 'bool',
    desc: '死亡时是否永久失去帕鲁。',
  },
  bEnableFastTravel: {
    cat: 'features', label: '启用快速旅行', type: 'bool',
    desc: '是否启用快速旅行。',
  },
  bEnableFastTravelOnlyBaseCamp: {
    cat: 'features', label: '仅据点间快旅', type: 'bool',
    desc: '将快速旅行限制为仅能在据点之间进行。',
  },
  bIsStartLocationSelectByMap: {
    cat: 'features', label: '可选出生点', type: 'bool',
    desc: '是否允许玩家在地图上选择出生位置。',
  },
  bEnableInvaderEnemy: {
    cat: 'features', label: '启用入侵者', type: 'bool',
    desc: '是否启用入侵者(袭击)敌人。',
  },
  bEnableVoiceChat: {
    cat: 'features', label: '启用语音聊天', type: 'bool',
    desc: '是否启用游戏内语音聊天。',
  },
  VoiceChatMaxVolumeDistance: {
    cat: 'features', label: '语音满音量距离', type: 'float',
    desc: '语音音量不衰减的距离 (此距离内音量最大)。',
    min: 0, max: 5000, step: 100,
  },
  VoiceChatZeroVolumeDistance: {
    cat: 'features', label: '语音静音距离', type: 'float',
    desc: '语音音量衰减为零的距离。',
    min: 0, max: 20000, step: 500,
  },
  bShowPlayerList: {
    cat: 'features', label: 'ESC菜单玩家列表', type: 'bool',
    desc: '是否在 ESC 菜单中显示在线玩家列表。',
  },
  bBuildAreaLimit: {
    cat: 'features', label: '限制建造区域', type: 'bool',
    desc: '禁止在传送点等关键设施附近建造。',
  },
  bInvisibleOtherGuildBaseCampAreaFX: {
    cat: 'features', label: '显示据点范围边界', type: 'bool',
    desc: '是否显示据点区域的范围边界特效。',
  },
  bExistPlayerAfterLogout: {
    cat: 'features', label: '登出后角色留存', type: 'bool',
    desc: '玩家登出后, 角色是否在原地进入睡眠状态(留在世界中)。',
  },
  bAllowEnhanceStat_Attack: {
    cat: 'features', label: '可加点: 攻击', type: 'bool',
    desc: '是否允许将属性点分配到攻击。',
  },
  bAllowEnhanceStat_Health: {
    cat: 'features', label: '可加点: 生命', type: 'bool',
    desc: '是否允许将属性点分配到生命值 (HP)。',
  },
  bAllowEnhanceStat_Stamina: {
    cat: 'features', label: '可加点: 耐力', type: 'bool',
    desc: '是否允许将属性点分配到耐力。',
  },
  bAllowEnhanceStat_Weight: {
    cat: 'features', label: '可加点: 负重', type: 'bool',
    desc: '是否允许将属性点分配到负重上限。',
  },
  bAllowEnhanceStat_WorkSpeed: {
    cat: 'features', label: '可加点: 工作速度', type: 'bool',
    desc: '是否允许将属性点分配到工作速度。',
  },
  bAutoResetGuildNoOnlinePlayers: {
    cat: 'features', label: '公会无人自动重置', type: 'bool',
    desc: '若公会成员长期无人登录, 自动删除其建筑与据点帕鲁。',
  },
  AutoResetGuildTimeNoOnlinePlayers: {
    cat: 'features', label: '公会重置离线时长', type: 'float',
    desc: '触发上面「公会无人自动重置」所需的离线时长 (小时)。若该项关闭则忽略。',
    min: 1, max: 168, step: 1,
  },
  bAllowGlobalPalboxExport: {
    cat: 'features', label: '允许上传全局帕鲁盒', type: 'bool',
    desc: '是否允许将帕鲁保存到全局帕鲁盒。',
  },
  bAllowGlobalPalboxImport: {
    cat: 'features', label: '允许下载全局帕鲁盒', type: 'bool',
    desc: '是否允许从全局帕鲁盒读取帕鲁。',
  },
  bDisplayPvPItemNumOnWorldMap_BaseCamp: {
    cat: 'features', label: '地图显示据点PvP物资', type: 'bool',
    desc: '是否在地图上显示各据点的 PvP 专用物品数量。',
  },
  bDisplayPvPItemNumOnWorldMap_Player: {
    cat: 'features', label: '地图显示玩家PvP物资', type: 'bool',
    desc: '是否在地图上显示玩家位置及其 PvP 专用物品数量。',
  },
  RandomizerType: {
    cat: 'features', label: '帕鲁随机化模式', type: 'select', options: ['None', 'Region', 'All'],
    desc: '帕鲁刷新随机化模式: None 不随机; Region 按区域随机; All 完全随机。',
  },
  RandomizerSeed: {
    cat: 'features', label: '随机化种子', type: 'text',
    desc: '启用帕鲁刷新随机化时使用的种子值。',
  },
  bIsRandomizerPalLevelRandom: {
    cat: 'features', label: '野生帕鲁等级随机', type: 'bool',
    desc: '开启则野生帕鲁等级完全随机; 关闭则在各区域预设范围内随机。',
  },

  // ------------------------------------------------------------------ 游戏平衡
  ExpRate: {
    cat: 'balance', label: '经验倍率', type: 'float',
    desc: '经验值获取倍率。',
    min: 0.1, max: 20, step: 0.1,
  },
  DayTimeSpeedRate: {
    cat: 'balance', label: '白天流速', type: 'float',
    desc: '白天时间流逝速度。',
    min: 0.1, max: 5, step: 0.1,
  },
  NightTimeSpeedRate: {
    cat: 'balance', label: '夜晚流速', type: 'float',
    desc: '夜晚时间流逝速度。',
    min: 0.1, max: 5, step: 0.1,
  },
  DeathPenalty: {
    cat: 'balance', label: '死亡惩罚', type: 'select',
    options: ['None', 'Item', 'ItemAndEquipment', 'All'],
    desc: '死亡惩罚: None 不掉落; Item 掉落除装备外所有物品; ItemAndEquipment 掉落全部物品; All 掉落全部物品及队伍所有帕鲁。',
  },
  BlockRespawnTime: {
    cat: 'balance', label: '复活冷却(秒)', type: 'int',
    desc: '死亡后可再次复活前的冷却时间 (秒)。',
    min: 0, max: 300, step: 5,
  },
  RespawnPenaltyDurationThreshold: {
    cat: 'balance', label: '复活惩罚生存阈值(秒)', type: 'float',
    desc: '生存时间阈值(秒): 低于该值时再次死亡, 将套用下面的复活冷却倍率。',
    min: 0, max: 600, step: 10,
  },
  RespawnPenaltyTimeScale: {
    cat: 'balance', label: '复活惩罚冷却倍率', type: 'float',
    desc: '施加于复活冷却时间的倍率。',
    min: 0.1, max: 10, step: 0.1,
  },
  CollectionDropRate: {
    cat: 'balance', label: '采集掉落倍率', type: 'float',
    desc: '可采集物品的掉落数量倍率。',
    min: 0.5, max: 3, step: 0.1,
  },
  CollectionObjectHpRate: {
    cat: 'balance', label: '采集物血量倍率', type: 'float',
    desc: '可采集物体的血量倍率。',
    min: 0.5, max: 3, step: 0.1,
  },
  CollectionObjectRespawnSpeedRate: {
    cat: 'balance', label: '采集物重生间隔', type: 'float',
    desc: '可采集物体的重生间隔倍率。',
    min: 0.5, max: 3, step: 0.1,
  },
  EnemyDropItemRate: {
    cat: 'balance', label: '敌人掉落倍率', type: 'float',
    desc: '击败敌人掉落物品的数量倍率。',
    min: 0.5, max: 3, step: 0.1,
  },
  ItemWeightRate: {
    cat: 'balance', label: '物品重量倍率', type: 'float',
    desc: '物品重量倍率。',
    min: 0, max: 5, step: 0.1,
  },
  ItemCorruptionMultiplier: {
    cat: 'balance', label: '物品腐坏速度倍率', type: 'float',
    desc: '物品腐坏速度倍率。',
    min: 0, max: 10, step: 0.1,
  },
  EquipmentDurabilityDamageRate: {
    cat: 'balance', label: '装备耐久损耗倍率', type: 'float',
    desc: '装备耐久度损耗倍率。',
    min: 0, max: 10, step: 0.1,
  },
  SupplyDropSpan: {
    cat: 'balance', label: '补给/陨石间隔(分)', type: 'int',
    desc: '陨石 / 空投补给的出现间隔 (分钟)。',
    min: 0, max: 240, step: 5,
  },
  MonsterFarmActionSpeedRate: {
    cat: 'balance', label: '放牧产出速度倍率', type: 'float',
    desc: '牧场放牧的物品产出速度倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  BuildObjectDamageRate: {
    cat: 'balance', label: '建筑受伤倍率', type: 'float',
    desc: '对建筑造成伤害的倍率。',
    min: 0.5, max: 3, step: 0.1,
  },
  BuildObjectDeteriorationDamageRate: {
    cat: 'balance', label: '建筑老化速度倍率', type: 'float',
    desc: '建筑自然老化(损坏)速度倍率。',
    min: 0, max: 10, step: 0.1,
  },
  PlayerDamageRateAttack: {
    cat: 'balance', label: '玩家攻击倍率', type: 'float',
    desc: '玩家造成伤害的倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PlayerDamageRateDefense: {
    cat: 'balance', label: '玩家受伤倍率', type: 'float',
    desc: '玩家受到伤害的倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PlayerAutoHPRegeneRate: {
    cat: 'balance', label: '玩家自然回血倍率', type: 'float',
    desc: '玩家自然生命恢复倍率。',
    min: 0.1, max: 10, step: 0.1,
  },
  PlayerAutoHpRegeneRateInSleep: {
    cat: 'balance', label: '玩家睡眠回血倍率', type: 'float',
    desc: '玩家睡眠时生命恢复倍率。',
    min: 0.1, max: 10, step: 0.1,
  },
  PlayerStaminaDecreaceRate: {
    cat: 'balance', label: '玩家耐力消耗倍率', type: 'float',
    desc: '玩家耐力消耗速度倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PlayerStomachDecreaceRate: {
    cat: 'balance', label: '玩家饱食下降倍率', type: 'float',
    desc: '玩家饱食度下降速度倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PalDamageRateAttack: {
    cat: 'balance', label: '帕鲁攻击倍率', type: 'float',
    desc: '帕鲁造成伤害的倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PalDamageRateDefense: {
    cat: 'balance', label: '帕鲁受伤倍率', type: 'float',
    desc: '帕鲁受到伤害的倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PalCaptureRate: {
    cat: 'balance', label: '捕捉率倍率', type: 'float',
    desc: '帕鲁捕捉成功率倍率。',
    min: 0.5, max: 2, step: 0.1,
  },
  PalSpawnNumRate: {
    cat: 'balance', label: '帕鲁刷新数量倍率', type: 'float',
    desc: '野生帕鲁刷新数量倍率。',
    note: '影响性能。',
    min: 0.5, max: 3, step: 0.1,
  },
  PalAutoHPRegeneRate: {
    cat: 'balance', label: '帕鲁自然回血倍率', type: 'float',
    desc: '帕鲁自然生命恢复倍率。',
    min: 0.1, max: 10, step: 0.1,
  },
  PalAutoHpRegeneRateInSleep: {
    cat: 'balance', label: '帕鲁睡眠回血倍率', type: 'float',
    desc: '帕鲁在帕鲁盒中睡眠时的生命恢复倍率。',
    min: 0.1, max: 10, step: 0.1,
  },
  PalStaminaDecreaceRate: {
    cat: 'balance', label: '帕鲁耐力消耗倍率', type: 'float',
    desc: '帕鲁耐力消耗速度倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PalStomachDecreaceRate: {
    cat: 'balance', label: '帕鲁饱食下降倍率', type: 'float',
    desc: '帕鲁饱食度下降速度倍率。',
    min: 0.1, max: 5, step: 0.1,
  },
  PalEggDefaultHatchingTime: {
    cat: 'balance', label: '巨蛋孵化时间(时)', type: 'float',
    desc: '孵化巨蛋所需时间 (小时)。注: 其它蛋也需要孵化时间。',
    min: 0, max: 72, step: 1,
  },
  GuildPlayerMaxNum: {
    cat: 'balance', label: '公会人数上限', type: 'int',
    desc: '单个公会的最大成员数。',
    min: 1, max: 100, step: 1,
  },
  GuildRejoinCooldownMinutes: {
    cat: 'balance', label: '公会重新加入冷却(分)', type: 'int',
    desc: '退出后重新加入公会的冷却时间 (分钟)。',
    min: 0, max: 1440, step: 5,
  },
  DenyTechnologyList: {
    cat: 'balance', label: '禁用科技列表', type: 'text',
    desc: '禁用指定科技。填写科技 ID, 例: ("PALBOX","RepairBench")。',
  },
  bAdditionalDropItemWhenPlayerKillingInPvPMode: {
    cat: 'balance', label: 'PvP击杀额外掉落', type: 'bool',
    desc: 'PvP 开启时, 玩家被击杀是否额外掉落一个特殊物品。',
  },
  AdditionalDropItemWhenPlayerKillingInPvPMode: {
    cat: 'balance', label: 'PvP额外掉落物ID', type: 'text',
    desc: '启用上面 PvP 额外掉落时, 掉落物品的 ID。',
  },
  AdditionalDropItemNumWhenPlayerKillingInPvPMode: {
    cat: 'balance', label: 'PvP额外掉落数量', type: 'int',
    desc: '启用 PvP 额外掉落时, 掉落物品的数量。',
    min: 0, max: 100, step: 1,
  },
}

export type FieldValue = boolean | number | string

// 布尔值在 ini 中写作 True/False (帕鲁大小写敏感)
export function toIniValue(type: FieldType, v: FieldValue): string {
  if (type === 'bool') return v ? 'True' : 'False'
  return String(v)
}

// 从 ini 原始字符串解析为控件用值
export function fromIniValue(type: FieldType, raw: string | undefined | null): FieldValue {
  if (raw === undefined || raw === null) return type === 'bool' ? false : ''
  const s = String(raw).trim()
  if (type === 'bool') return s.toLowerCase() === 'true'
  if (type === 'int' || type === 'float') {
    const n = Number(s)
    return Number.isNaN(n) ? s : n
  }
  return s.replace(/^"|"$/g, '')
}
