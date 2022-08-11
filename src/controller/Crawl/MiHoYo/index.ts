/*
 * @Author: Any
 * @Date: 2022-04-25 14:38:57
 * @LastEditTime: 2022-06-05 20:14:33
 * @LastEditors: Any
 * @Description: MiHoYo 路由入口文件
 * @FilePath: \node-ts\src\controller\Crawl\MiHoYo\index.ts
 * 版权声明
 */

import { isJSON } from '@/utils'
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
import { MIYouShe } from './MIYouShe/rolefile'
import { YsData } from './YsGw/role'

class InitMiHoYo {
  // 官网API爬取角色
  async MiHoYo_Role(ctx: Context) {
    return await new Promise<boolean>(async (resolve, reject) => {
      const {
        isName,
        isrRarity,
        isChanne,
        isDownload = false,
        iupDB
      } = ctx.request.body
      if (isName && isrRarity && isChanne) {
        await YsData(
          {
            isName,
            isrRarity,
            isChanne,
            isDownload,
            iupDB
          },
          ctx
        ).catch((err: any) => Errors(ctx, err))
        resolve(false)
      } else {
        resolve(true)
        Errors<string>(ctx, '请传入爬取角色名称、稀有度、城市')
      }
    })
  }
}

export const Crawl_InitMiHoYo = new InitMiHoYo()
