/*
 * @Author: Any
 * @Date: 2022-05-06 21:17:32
 * @LastEditTime: 2022-05-08 13:40:55
 * @LastEditors: Any
 * @Description: 指定请求所需要带的KEY
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\IS_URL_TYPE.ts
 * 版权声明
 */
import { roleAscensionMaterialType } from './Role/AscensionMaterial'
import { WeaponAscensionMaterialTpye } from './Weapons/WeaponAscensionMaterial'
import { WeaponsType } from './Weapons/WeaponsInfo'

// 需要携带 IS_URL_KEY
export const IS_URL_RODER = [
  'Weapons/WeaponsInfo',
  'Role/AscensionMaterial',
  'Weapons/WeaponAscensionMaterial'
]

export default [
  ...roleAscensionMaterialType,
  ...WeaponsType,
  ...WeaponAscensionMaterialTpye
]
