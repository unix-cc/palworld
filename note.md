## 其他里面的参数中文翻译

| 参数                                              | 中文翻译             | 说明                             |
| ----------------------------------------------- | ---------------- | ------------------------------ |
| **Difficulty**                                  | 难度               | 游戏难度设置。`None` 表示自定义难度（不使用预设难度） |
| **BuildObjectHpRate**                           | 建筑物生命值倍率         | 建筑物耐久倍率。<br>例如 `2.0` = 建筑血量翻倍  |
| **bEnablePlayerToPlayerDamage**                 | 开启玩家对玩家伤害        | 是否允许玩家之间造成伤害（PvP伤害）            |
| **bEnableFriendlyFire**                         | 开启友军伤害           | 是否允许攻击队友/同公会成员                 |
| **bActiveUNKO**                                 | 启用UNKO系统         | 开启特殊娱乐内容（与帕鲁排泄相关的彩蛋功能），一般保持关闭  |
| **bEnableAimAssistPad**                         | 手柄瞄准辅助           | 是否开启手柄玩家的自动瞄准辅助                |
| **bEnableAimAssistKeyboard**                    | 键鼠瞄准辅助           | 是否开启键盘鼠标玩家的自动瞄准辅助              |
| **DropItemMaxNum**                              | 世界掉落物最大数量        | 地图上同时存在的掉落物最大数量<br>超过后旧掉落物会被清除 |
| **DropItemMaxNum_UNKO**                         | UNKO掉落物最大数量      | 特殊排泄物掉落数量上限                    |
| **DropItemAliveMaxHours**                       | 掉落物存在时间（小时）      | 地面掉落物多久后自动消失                   |
| **WorkSpeedRate**                               | 工作速度倍率           | 帕鲁工作效率倍率<br>影响采集、制作、发电、种植等工作速度 |
| **AutoSaveSpan**                                | 自动保存间隔（秒）        | 服务器自动保存世界数据时间间隔                |
| **bIsMultiplay**                                | 多人模式             | 是否启用多人服务器模式                    |
| **bCanPickupOtherGuildDeathPenaltyDrop**        | 可拾取其他公会死亡掉落      | 是否允许玩家拾取其他公会成员死亡掉落物            |
| **bEnableNonLoginPenalty**                      | 启用离线惩罚           | 是否开启玩家长时间不上线的惩罚机制              |
| **bEnableDefenseOtherGuildPlayer**              | 开启防御其他公会玩家       | 是否允许建筑/防御设施攻击其他公会玩家            |
| **CoopPlayerMaxNum**                            | 联机玩家最大数量         | 合作模式最大玩家数（非服务器公会人数）            |
| **RCONEnabled**                                 | 开启RCON远程管理       | 是否允许通过RCON工具远程管理服务器            |
| **RCONPort**                                    | RCON端口           | RCON连接端口，默认 `25575`            |
| **Region**                                      | 地区               | 服务器区域设置（通常为空或自动）               |
| **bUseAuth**                                    | 使用认证服务器          | 是否启用官方认证验证                     |
| **BanListURL**                                  | 封禁名单地址           | 官方黑名单/封禁玩家列表URL                |
| **EnablePredatorBossPal**                       | 启用掠食者Boss帕鲁      | 是否生成新的掠食者Boss帕鲁                |
| **PlayerDataPalStorageUpdateCheckTickInterval** | 玩家帕鲁存储检查间隔       | 检查玩家帕鲁存储数据更新的间隔时间              |
| **AutoTransferMasterCheckIntervalSeconds**      | 自动转移服务器主机检查间隔（秒） | 检查服务器管理员/主机转移条件的周期             |
| **AutoTransferMasterThresholdDays**             | 自动转移主机天数阈值       | 主机玩家多少天未登录后触发自动转移              |
| **MaxGuildsPerFrame**                           | 每帧最大公会处理数量       | 服务器每个游戏帧处理的公会数量限制，用于优化性能       |
| **BuildingNameDisplayCacheTTLSeconds**          | 建筑名称显示缓存时间（秒）    | 建筑名称显示缓存有效时间，用于优化服务器性能         |


## 服务器返回的json参数
```json
{
    "Difficulty": "None",
    "RandomizerType": "\"None\"",
    "RandomizerSeed": "\"\"",
    "bIsRandomizerPalLevelRandom": "False",
    "DayTimeSpeedRate": "1",
    "NightTimeSpeedRate": "1",
    "ExpRate": "1",
    "PalCaptureRate": "1",
    "PalSpawnNumRate": "1",
    "PalDamageRateAttack": "1",
    "PalDamageRateDefense": "1",
    "PlayerDamageRateAttack": "1",
    "PlayerDamageRateDefense": "1",
    "PlayerStomachDecreaceRate": "0.1",
    "PlayerStaminaDecreaceRate": "0.1",
    "PlayerAutoHPRegeneRate": "1",
    "PlayerAutoHpRegeneRateInSleep": "1",
    "PalStomachDecreaceRate": "1",
    "PalStaminaDecreaceRate": "1",
    "PalAutoHPRegeneRate": "1",
    "PalAutoHpRegeneRateInSleep": "1",
    "BuildObjectHpRate": "1.000000",
    "BuildObjectDamageRate": "1",
    "BuildObjectDeteriorationDamageRate": "1",
    "CollectionDropRate": "3",
    "CollectionObjectHpRate": "1",
    "CollectionObjectRespawnSpeedRate": "1",
    "EnemyDropItemRate": "3",
    "DeathPenalty": "\"Item\"",
    "bEnablePlayerToPlayerDamage": "False",
    "bEnableFriendlyFire": "False",
    "bEnableInvaderEnemy": "True",
    "bActiveUNKO": "False",
    "bEnableAimAssistPad": "True",
    "bEnableAimAssistKeyboard": "False",
    "DropItemMaxNum": "3000",
    "PhysicsActiveDropItemMaxNum": "-1",
    "DropItemMaxNum_UNKO": "100",
    "BaseCampMaxNum": "128",
    "BaseCampWorkerMaxNum": "50",
    "DropItemAliveMaxHours": "1.000000",
    "bAutoResetGuildNoOnlinePlayers": "False",
    "AutoResetGuildTimeNoOnlinePlayers": "72",
    "GuildPlayerMaxNum": "20",
    "BaseCampMaxNumInGuild": "10",
    "PalEggDefaultHatchingTime": "0",
    "WorkSpeedRate": "1.000000",
    "AutoSaveSpan": "30.000000",
    "bIsMultiplay": "False",
    "bIsPvP": "False",
    "bHardcore": "False",
    "bPalLost": "False",
    "bCharacterRecreateInHardcore": "False",
    "bCanPickupOtherGuildDeathPenaltyDrop": "False",
    "bEnableNonLoginPenalty": "True",
    "bEnableFastTravel": "True",
    "bEnableFastTravelOnlyBaseCamp": "False",
    "bIsStartLocationSelectByMap": "False",
    "bExistPlayerAfterLogout": "False",
    "bEnableDefenseOtherGuildPlayer": "False",
    "bInvisibleOtherGuildBaseCampAreaFX": "False",
    "bBuildAreaLimit": "False",
    "ItemWeightRate": "0.1",
    "CoopPlayerMaxNum": "4",
    "ServerPlayerMaxNum": "32",
    "ServerName": "\"Palworld HF\"",
    "ServerDescription": "\"Huafu\"",
    "AdminPassword": "\"huafu@123\"",
    "ServerPassword": "\"huafu123\"",
    "bAllowClientMod": "False",
    "PublicPort": "8211",
    "PublicIP": "\"\"",
    "RCONEnabled": "False",
    "RCONPort": "25575",
    "Region": "",
    "bUseAuth": "True",
    "BanListURL": "https://b.palworldgame.com/api/banlist.txt",
    "RESTAPIEnabled": "True",
    "RESTAPIPort": "8212",
    "bShowPlayerList": "False",
    "ChatPostLimitPerMinute": "30",
    "CrossplayPlatforms": "\"(Steam\"",
    "bIsUseBackupSaveData": "True",
    "LogFormatType": "\"Text\"",
    "bIsShowJoinLeftMessage": "True",
    "SupplyDropSpan": "180",
    "EnablePredatorBossPal": "True",
    "MaxBuildingLimitNum": "0",
    "ServerReplicatePawnCullDistance": "15000",
    "bAllowGlobalPalboxExport": "True",
    "bAllowGlobalPalboxImport": "False",
    "EquipmentDurabilityDamageRate": "1",
    "ItemContainerForceMarkDirtyInterval": "1",
    "PlayerDataPalStorageUpdateCheckTickInterval": "1.000000",
    "ItemCorruptionMultiplier": "1",
    "MonsterFarmActionSpeedRate": "1",
    "DenyTechnologyList": "\"\"",
    "GuildRejoinCooldownMinutes": "0",
    "AutoTransferMasterCheckIntervalSeconds": "3600.000000",
    "AutoTransferMasterThresholdDays": "14",
    "MaxGuildsPerFrame": "10",
    "BlockRespawnTime": "5",
    "RespawnPenaltyDurationThreshold": "0",
    "RespawnPenaltyTimeScale": "2",
    "bDisplayPvPItemNumOnWorldMap_BaseCamp": "False",
    "bDisplayPvPItemNumOnWorldMap_Player": "False",
    "AdditionalDropItemWhenPlayerKillingInPvPMode": "\"PlayerDropItem\"",
    "AdditionalDropItemNumWhenPlayerKillingInPvPMode": "1",
    "bAdditionalDropItemWhenPlayerKillingInPvPMode": "False",
    "bEnableVoiceChat": "False",
    "VoiceChatMaxVolumeDistance": "3000",
    "VoiceChatZeroVolumeDistance": "15000",
    "bAllowEnhanceStat_Health": "True",
    "bAllowEnhanceStat_Attack": "True",
    "bAllowEnhanceStat_Stamina": "True",
    "bAllowEnhanceStat_Weight": "True",
    "bAllowEnhanceStat_WorkSpeed": "True",
    "bEnableBuildingPlayerUIdDisplay": "False",
    "BuildingNameDisplayCacheTTLSeconds": "60"
}

```