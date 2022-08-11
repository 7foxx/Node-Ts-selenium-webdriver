# 原神接口文档

# 角色

|     字段名     |              描述              |
| :------------: | :----------------------------: |
|  identUserID   |            角色 id             |
|    username    |            角色名称            |
|    English     |           角色英文名           |
|   TitleName    |              称号              |
|   TheForces    |            所属势力            |
|    FullName    |              全名              |
|  affiliating   |            所属地区            |
|      sex       |              性别              |
|     rarity     |             稀有度             |
|      pond      |              卡池              |
|    Uelement    |            元素属性            |
|  WeaponTypes   |            武器类型            |
|  LifeOfTheSit  |             命之座             |
|    arrange     |            特殊料理            |
|   materials    |          天赋突破材料          |
|  Livefiredate  |            实装日期            |
| characteristic |            人物特点            |
|   introduce    |            人物介绍            |
|   voiceNameZ   |            中文声优            |
|   voiceNameR   |            日文声优            |
|    synopsis    |            角色简介            |
|   usrLogoURL   |           角色 logo            |
|  rolesLIstURL  |           角色卡片图           |
|  paintingURL   |          角色展示主图          |
|  BoutiqueURL   |          抽卡立绘裸图          |
|  HeadLogoURL   |           角色侧头图           |
|  PCpicturePNG  |           客户端主图           |
|  MCpicturePNG  |           移动端主图           |
|    linesPNG    |            台词图片            |
|  AudioUrlAll   |    json 格式角色中英文语音     |
|     s_skil     | 普攻、E、Q 图（json 格式数组） |
|     p_skil     |  固有天赋图（json 格式数组）   |
|     c_skil     |    命座图（json 格式数组）     |

## 获取角色基本信息

Path： `/ys/getRole`

Method： `POST`

**Body 参数**

| 参数名称 |  类型  |
| :------: | :----: |
|  uname   | String |

返回值

## 获取所有角色列表

Path： `/ys/getRolelist`

Method： `GET`

返回值

## 获取全部角色 logo

Path： `/ys/rodeLogoData`

Method： `POST`

**Body 参数**

|  参数名称   |  类型  |
| :---------: | :----: |
| affiliating | String |

返回值

## 获取所有角色列表

Path： `/ys/rodetable`

Method： `GET`

返回值
