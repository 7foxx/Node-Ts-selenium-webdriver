/*
 * @Author: Any
 * @Date: 2022-04-25 10:20:52
 * @LastEditTime: 2022-06-05 19:07:34
 * @LastEditors: Any
 * @Description: Honeyhunterworld 外网爆料 路由入口文件
 * @FilePath: \node-ts\src\controller\crawl\Honeyhunterworld\index.ts
 * 版权声明
 */
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
import { TheCrawlerMethod } from './selenium'
import ArrType from './ArrType'
import IS_URL_TYPE, { IS_URL_RODER } from './IS_URL_TYPE'

class InitCrawl {
  /**
   * @description:  单个爬取
   * @param {Context} ctx
   */
  async TheCrawlerMethod_INDEX(ctx: Context) {
    return await new Promise<Boolean>(async (resolve, reject) => {
      const {
        CrawlType,
        IS_URL_KEY = '',
        iupDB = false,
        isAll,
        isName = ''
      } = ctx.request.body
      // 爬取类型为空则返回错误
      if (!ArrType.includes(CrawlType)) {
        Errors<string>(ctx, '请传入爬取类型路由')
        resolve(false)
        return
      }

      // 需要携带 IS_URL_KEY
      if (IS_URL_RODER.includes(CrawlType) && !IS_URL_KEY) {
        Errors<string>(ctx, '请传入指定类型KEY')
        resolve(false)
        return
      }

      // 如果有路由 key 则判断
      let IS_URL_VALUE: string = ''
      if (IS_URL_KEY.length > 0) {
        const objarr: any = IS_URL_TYPE
        objarr.map((item: { [x: string]: string }) => {
          if (Object.keys(item).includes(IS_URL_KEY)) {
            IS_URL_VALUE = item[IS_URL_KEY]
          }
        })
      }
      // 如果有路由 key 切不正确则返回错误
      if (IS_URL_KEY.length > 0 && IS_URL_VALUE.length === 0) {
        Errors<string>(ctx, '请传入正确的路由 key')
        resolve(false)
        return
      }
      const {
        getDataNum,
        getDataBtn,
        returnpage,
        crawlsubject,
        url,
        UPurl,
        Updb
      } = require(`./${CrawlType}`) // 爬取数据
      await TheCrawlerMethod(
        {
          url,
          UPurl,
          IS_URL: IS_URL_VALUE,
          getDataNum,
          getDataBtn,
          returnpage,
          crawlsubject,
          Updb,
          iupDB,
          isAll,
          isName
        },
        ctx
      ).catch((err: any) => Errors(ctx, err))
      resolve(true)
    })
  }
}

export const Crawl_TheCrawlerMethod = new InitCrawl()
