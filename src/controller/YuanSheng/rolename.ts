/*
 * @Author: Any
 * @Date: 2022-04-24 15:58:07
 * @LastEditTime: 2022-04-24 21:29:52
 * @LastEditors: Any
 * @Description: 原神角色方法
 * @FilePath: \node-ts\src\controller\YuanSheng\rolename.ts
 * 版权声明
 */
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
import db from '@/db'
import { MysqlError } from 'mysql'

class IndexController {
  /**
   * @description: 查询角色信息
   * @param {Context} ctx
   * @param {body} ctx.request.body { uname, Uelement, Weapon }
   */
  async getRole(ctx: Context) {
    try {
      const {
        request: { body }
      } = ctx
      const { uname, Uelement, Weapon } = body
      if (!uname && !Uelement && !Weapon)
        return Errors<string>(ctx, '请求参数不能为空')
      const affiliatingArr = ['蒙德', '璃月', '稻妻', '至冬']
      const ElemetArr = ['风', '岩', '火', '雷', '水', '冰', '草']
      const treeWeapon = ['法器', '长柄武器', '双手剑', '弓', '单手剑']

      let getName = ''
      if (uname) {
        getName = affiliatingArr.includes(uname)
          ? Uelement || Weapon
            ? `affiliating='${uname}' AND`
            : `affiliating='${uname}'`
          : Uelement || Weapon
          ? `username='${uname}' AND`
          : `username='${uname}'`
      }

      // SQL 查询语句
      const SQL = `username,English,TitleName,FullName,affiliating,sex,pond,rarity,Uelement,WeaponTypes,Livefiredate,voiceNameZ,voiceNameR,paintingURL`
      const SETS = `select ${SQL} from identityuser where ${getName} ${
        Uelement
          ? Weapon
            ? `Uelement='${Uelement}' AND `
            : `Uelement='${Uelement}'`
          : ''
      } ${Weapon ? `WeaponTypes='${Weapon}'` : ''}`

      // 查询数据库
      await new Promise<void>((resolve, reject) => {
        db.query(SETS, (err, results) => {
          // mysql 模块工作期间报错了
          if (err) return Errors<MysqlError>(ctx, err)
          const arr = results.sort(
            (a: { Livefiredate: number }, b: { Livefiredate: number }) =>
              a.Livefiredate < b.Livefiredate ? 1 : -1
          )
          // 能够成功的执行 sql 语句
          Success<any>(ctx, arr)
          resolve()
        })
      })
    } catch (error) {
      Errors<unknown>(ctx, error)
    }
  }
  // 查询所有校色
  async getRoleList(ctx: Context) {
    try {
      const SQL = `SELECT username,English,TitleName,FullName,affiliating,sex,pond,rarity,Uelement,WeaponTypes,Livefiredate,voiceNameZ,voiceNameR,paintingURL FROM identityuser`
      await new Promise<void>((resolve, reject) => {
        db.query(SQL, (err, results) => {
          // mysql 模块工作期间报错了
          if (err) return Errors<MysqlError>(ctx, err)
          const arr = results.sort(
            (a: { Livefiredate: number }, b: { Livefiredate: number }) =>
              a.Livefiredate < b.Livefiredate ? 1 : -1
          )
          // 能够成功的执行 sql 语句
          Success<any>(ctx, arr)
          resolve()
        })
      })
    } catch (error) {
      Errors<unknown>(ctx, error)
    }
  }
  // 获取全部角色logo
  async getRodeLogoList(ctx: Context) {
    try {
      const {
        request: { body }
      } = ctx
      if (!body.affiliating) return Errors<string>(ctx, '请求参数不能为空')
      const SQL = `username,rarity,Uelement,HeadLogoURL,FullName`
      await new Promise<void>((resolve, reject) => {
        db.query(
          `select ${SQL} from identityuser where affiliating='${body.affiliating}'`,
          (err, results) => {
            // mysql 模块工作期间报错了
            if (err) return Errors<MysqlError>(ctx, err)
            // 能够成功的执行 sql 语句
            Success<any>(ctx, results)
            resolve()
          }
        )
      })
    } catch (error) {
      Errors<unknown>(ctx, error)
    }
  }
  // 获取表格角色数据
  async getRodeTableList(ctx: Context) {
    try {
      const SQL =
        'SELECT u.breakProp,i.username,i.rarity,i.WeaponTypes,i.Uelement,i.usrLogoURL,i.Livefiredate,i.affiliating,i.pond, i.materials ,u.initialMaxATK,u.initialMaxHP,u.initialMaxPH FROM `identityuser` i INNER JOIN userrole u on i.username	 = u.username'
      await new Promise<void>((resolve, reject) => {
        db.query(SQL, (err, results) => {
          // mysql 模块工作期间报错了
          if (err) return Errors<MysqlError>(ctx, err)
          const arr = results.sort(
            (a: { Livefiredate: number }, b: { Livefiredate: number }) =>
              a.Livefiredate < b.Livefiredate ? 1 : -1
          )
          // 能够成功的执行 sql 语句
          Success<any>(ctx, arr)
          resolve()
        })
      })
    } catch (error) {
      Errors<unknown>(ctx, error)
    }
  }
}

export default new IndexController()
