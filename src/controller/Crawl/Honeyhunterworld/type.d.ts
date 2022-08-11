/*
 * @Author: Any
 * @Date: 2022-04-26 10:19:14
 * @LastEditTime: 2022-06-05 18:50:21
 * @LastEditors: Any
 * @Description: selenium API 类型
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\type.d.ts
 * 版权声明
 */
import { Context } from 'koa'

// 爬取类型参数 data 类型
export type seleniumDataType = {
  url: string // 爬取网页跟路径 字符串
  UPurl: string // 爬取更新网页跟路径 字符串
  IS_URL: string // 爬取网页路由 字符串 默认为 ''
  crawlsubject: crawlsubjectType<any> // 爬取业务逻辑 函数
  returnpage: returnpageType // 爬虫成功跳转页面 函数
  getDataNum: getDataNumType // 所有角色数量 函数
  getDataBtn: getDataBtnType // 获取元素按钮 函数
  Updb: UpdbTye<any> // 更新数据库 函数
  iupDB: boolean // 是否更新数据库
  isAll: boolean // 是否为爬取所有角色 Boolean 默认为 false
  isName?: string // 爬取制定元素名称 可选
}

// 爬取框架参数类型
export type seleniumType = (
  data: seleniumDataType,
  ctx: Context,
  index?: number
) => Promise

// 爬取业务逻辑
export type crawlsubjectType<T> = (
  driver: selenium.ThenableWebDriver,
  By: selenium.ThenableWebDriver,
  falg: boolean | undefined,
  IS_URL?: string | undefined,
  isName?: string
) => Promise<T>

// 返回详情列表
export type returnpageType = (
  driver: selenium.ThenableWebDriver,
  By: selenium.ThenableWebDriver,
  falg: boolean | undefined,
  IS_URL?: string | undefined
) => Promise<any>

// 获取所有元素数量
export type getDataNumType = (
  driver: selenium.ThenableWebDriver,
  By: selenium.ThenableWebDriver
) => Promise<number>

// 获取元素按钮
export type getDataBtnType = (
  driver: selenium.ThenableWebDriver,
  By: selenium.ThenableWebDriver,
  index: number,
  isAll: boolean,
  isName?: string
) => Promise<any>

// 更新数据库
export type UpdbTye<T> = (data?: T) => Promise
