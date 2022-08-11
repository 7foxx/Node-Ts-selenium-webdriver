import { Context } from 'koa'

// 角色
export type YsDataTyoe = (
  data: {
    isName: string // 追加角色的名称
    isrRarity: string // 稀有度
    isChanne: 324 | 151 | 150 // 角色所属城市 稻妻  = 324 离月  = 151 蒙德  = 150
    isDownload: boolean // 是否下载资源
    iupDB: boolean // 是否追加数据库
  },
  ctx: Context
) => Promise
