/*
 * @Author: Any
 * @Date: 2022-04-24 15:40:38
 * @LastEditTime: 2022-04-24 21:24:53
 * @LastEditors: Any
 * @Description: 原神
 * @FilePath: \node-ts\src\router\ys.ts
 * 版权声明
 */
import koaRoter from 'koa-router'
import controller from '@/controller/YuanSheng/rolename'
const router = new koaRoter({ prefix: '/ys' })
const { getRole, getRoleList, getRodeLogoList, getRodeTableList } = controller

// 获取角色基本信息
router.post('/getRole', getRole)
// 获取所有角色列表
router.get('/getRolelist', getRoleList)
// 获取全部角色logo
router.post('/rodeLogoData', getRodeLogoList)
// 获取表格角色数据
router.get('/rodetable', getRodeTableList)

export const YsRouter = router
