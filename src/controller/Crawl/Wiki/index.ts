/*
 * @Author: Any
 * @Date: 2022-04-25 12:27:56
 * @LastEditTime: 2022-06-05 20:14:28
 * @LastEditors: Any
 * @Description:  Wiki B站 路由入口文件
 * @FilePath: \node-ts\src\controller\Crawl\Wiki\index.ts
 * 版权声明
 */
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
import { GetRodebrek } from './Role/GetRodebrek'
import { getUserrole } from '@/controller/Crawl/Wiki/Role/getUserrole'
import { IDentityUser } from '@/controller/Crawl/Wiki/Role/IDentityUser'

class InitWki {
  // 角色 (这个模块比较大单独拿出来)
  async wiki_IDentityUser(ctx: Context) {
    return await new Promise<boolean>(async (resolve, reject) => {
      const { isUserName, iupDB } = ctx.request.body
      if (!isUserName && !isUserName?.length) {
        Errors<string>(ctx, '请传入爬取角色名称')
        resolve(false)
        return
      }
      // 角色
      await IDentityUser(isUserName, iupDB, ctx).catch(err =>
        Errors<string>(ctx, err)
      )
      resolve(true)
    })
  }
  // 角色基本信息
  async wiki_getUserrole(ctx: Context) {
    return await new Promise<boolean>(async (resolve, reject) => {
      const { isUserName, iupDB = false } = ctx.request.body
      if (!isUserName) {
        Errors<string>(ctx, '请传入爬取角色名称')
        resolve(false)
        return
      }
      // 角色基本信息
      await getUserrole(isUserName, iupDB, ctx).catch(err =>
        Errors<string>(ctx, err)
      )
      resolve(true)
    })
  }
  // 角色突破材料
  async wiki_GetRodebrek(ctx: Context) {
    return await new Promise<boolean>(async (resolve, reject) => {
      const { isUserName, iupDB = false } = ctx.request.body
      if (!isUserName) {
        Errors<string>(ctx, '请传入爬取角色名称')
        resolve(false)
        return
      }
      // 角色突破材料
      await GetRodebrek(isUserName, iupDB, ctx).catch(err =>
        Errors<string>(ctx, err)
      )
      resolve(true)
    })
  }
}

export const Crawl_InitWki = new InitWki()
