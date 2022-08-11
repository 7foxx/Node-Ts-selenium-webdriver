# 爬虫 Api 文档

# Honeyhunterworld

## 角色资源

Path： `/crawl/honeyhunterworld`

Method： `POST`

**Body 参数**

|                         参数名称                         |  类型   |
| :------------------------------------------------------: | :-----: |
|      CrawlType：爬取类型（Role/RoleFile） 角色资源       | String  |
|      CrawlType：爬取类型（Role/RoleInfo） 角色信息       | String  |
| CrawlType：爬取类型（Role/AscensionMaterial 角色突破材料 | String  |
|               IS_URL_KEY 路由路径（可选）                | boolean |
|        iupDB：是否追加数据库 （可选 默认 false）        | boolean |
|       isAll：是否爬取所有 （可选 默认 false）        | boolean |

# Wiki

## 角色信息

Path： `/crawl/wiki_IDentityUser`

Method： `POST`

**Body 参数**

|              参数名称              |  类型   |
| :--------------------------------: | :-----: |
|     isUserName：追加角色的名称     | String  |
| isDB：是否追加数据库（默认 false） | boolean |

## 角色基本信息

Path： `/crawl/getUserrol`

Method： `POST`

**Body 参数**

|              参数名称              |  类型   |
| :--------------------------------: | :-----: |
|     isUserName：追加角色的名称     | String  |
| isDB：是否追加数据库（默认 false） | boolean |

## 角色突破材料

Path： `/crawl/getRodebrek`

Method： `POST`

**Body 参数**

|              参数名称              |  类型   |
| :--------------------------------: | :-----: |
|     isUserName：追加角色的名称     | String  |
| isDB：是否追加数据库（默认 false） | boolean |

# MiHoYo

## 角色资源

Path： `/crawl/ysgw`

Method： `POST`

**Body 参数**

|                     参数名称                      |  类型   |
| :-----------------------------------------------: | :-----: |
|              isName：追加角色的名称               | String  |
|                isrRarity： 稀有度                 | String  |
| isChanne：角色所属城市 稻妻 324 离月 151 蒙德 150 | number  |
|               isLenght：角色总条数                | number  |
|      isDownload：是否下载资源（默认 false）       | boolean |
|        isDB：是否追加数据库（默认 false）         | boolean |
