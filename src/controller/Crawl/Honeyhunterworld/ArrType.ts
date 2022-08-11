/*
 * @Author: Any
 * @Date: 2022-05-06 20:53:00
 * @LastEditTime: 2022-05-09 22:04:49
 * @LastEditors: Any
 * @Description: 路由文件
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\ArrType.ts
 * 版权声明
 */
import ArtifactSet from './ArtifactSet'
import Inventory from './Inventory'
import LivingBeings from './LivingBeings'
import Role from './Role'
import Weapons from './Weapons'

export default [
  ...Role,
  ...Weapons,
  ...ArtifactSet,
  ...LivingBeings,
  ...Inventory
]
