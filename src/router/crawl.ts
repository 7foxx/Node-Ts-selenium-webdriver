/*
 * @Author: Any
 * @Date: 2022-04-24 22:16:40
 * @LastEditTime: 2022-06-05 19:12:39
 * @LastEditors: Any
 * @Description: 爬虫
 * @FilePath: \node-ts\src\router\crawl.ts
 * 版权声明
 */
import koaRoter from 'koa-router'
import Crawl from '@/controller/Crawl/Crawl'
import { Crawl_TheCrawlerMethod } from '@/controller/Crawl/Honeyhunterworld'
import { Crawl_InitWki } from '@/controller/Crawl/Wiki'
import { Crawl_InitMiHoYo } from '@/controller/Crawl/MiHoYo'
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
const router = new koaRoter({ prefix: '/crawl' })

// Honeyhunterworld 外网爆料资源页面
const { TheCrawlerMethod_INDEX } = Crawl_TheCrawlerMethod
// 角色资源：src\controller\Crawl\Honeyhunterworld\Role\RoleFile.ts
// 角色信息：src\controller\Crawl\Honeyhunterworld\Role\RoleInfo.ts
// 角色突破材料: src\controller\Crawl\Honeyhunterworld\Role\AscensionMaterial.ts
// 武器资源：src\controller\Crawl\Honeyhunterworld\Weapons\WeaponsFile.ts
// 武器信息：src\controller\Crawl\Honeyhunterworld\Weapons\WeaponsInfo.ts
// 武器突破材料: src\controller\Crawl\Honeyhunterworld\Weapons\AscensionMaterial.ts
// 圣遗物资源信息：src\controller\Crawl\Honeyhunterworld\ArtifactSet\ArtifactSet.ts
// 生物志大世界 ：src\controller\Crawl\Honeyhunterworld\LivingBeings\Wildlife.ts
router.post('/honeyhunterworld', TheCrawlerMethod_INDEX)

// 通用分布爬取
const { Distribution_INDEX } = Crawl

// 分布爬取
router.post('/Distribution', Distribution_INDEX)

// wiki B站页面
const { wiki_getUserrole, wiki_IDentityUser, wiki_GetRodebrek } = Crawl_InitWki
// 角色
router.post('/wiki/identityUser', wiki_IDentityUser)
router.post('/wiki/getUserrol', wiki_getUserrole)
// 角色突破材料
router.post('/wiki/getRodebrek', wiki_GetRodebrek)

// MiHoYo
const { MiHoYo_Role } = Crawl_InitMiHoYo
// 角色
router.post('/ysgw', MiHoYo_Role)
// 米游社角色资源
// router.post('/mihoyo/rolefile', MiHoYo_Role_file)

// 获取角色信息
const RolePost = async (ctx: Context, next: any) => {
  const { CrawlType, isName, isAll, iupDB } = ctx.request.body
  if (CrawlType !== 'Role/RoleInfo' || !isName || !isAll || !iupDB)
    return Errors(ctx, '参数错误')
  const A = await TheCrawlerMethod_INDEX(ctx)

  const B = await wiki_IDentityUser(ctx)

  const C = await MiHoYo_Role(ctx)

  const D = await wiki_GetRodebrek(ctx)

  if (await Promise.all([A, B, C, D])) return Success(ctx, '爬取成功')
  return Errors(ctx, '爬取失败')
}

router.post('/Role/RolePostAll', RolePost)

export const CrawlRouter = router
