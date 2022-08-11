/*
 * @Author: Any
 * @Date: 2022-05-12 13:36:48
 * @LastEditTime: 2022-05-19 11:42:35
 * @LastEditors: Any
 * @Description: 通用分布爬取路由入口
 * @FilePath: \node-ts\src\controller\Crawl\Crawl.ts
 * 版权声明
 */
import { Errors } from '@/utils/response'
import { Context } from 'koa'
import { Distribution } from '@/controller/Crawl/distribution'
import PathType from './PathType'
class Crawl {
  constructor() {}
  /**
   * @description:  分布爬取
   * @param {Context} ctx
   * @return {*}
   */
  async Distribution_INDEX(ctx: Context) {
    await new Promise<void>(async (resolve, reject) => {
      const { isName, path, iupDB, isAll } = ctx.request.body
      if (!PathType.includes(path)) {
        resolve()
        Errors<string>(ctx, '请传入正确的路由')
        return
      }
      // 如果 isName 存在则判断是否为 string 或 数组
      if (
        !!isName &&
        (typeof isName !== 'string' ||
          (Array.isArray(isName) && isName.length === 0))
      ) {
        Errors(ctx, '请传入正确的 isName')
        resolve()
        return
      }
      await Distribution(
        {
          isName,
          path,
          isAll,
          iupDB
        },
        ctx
      ).catch((err: any) => Errors(ctx, err))
      resolve()
    })
  }
}
export default new Crawl()
