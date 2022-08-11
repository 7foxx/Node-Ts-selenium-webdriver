/*
 * @Author: Any
 * @Date: 2022-04-25 12:52:16
 * @LastEditTime: 2022-06-05 20:00:41
 * @LastEditors: Any
 * @Description: 角色基本信息
 * @FilePath: \node-ts\src\controller\Crawl\Wiki\Role\getUserrole.ts
 * 版权声明
 */
import selenium from 'selenium-webdriver'
import db from '@/db'
import { WikiType } from '../type'
import { Errors, Success } from '@/utils/response'

/**
 * @description: 爬取角色基本信息
 * @param {string} isUserName 角色名
 * @param {boolean} iupDB 是否追加数据库
 * @param {Context} ctx 路由对象
 */
export const getUserrole: WikiType = async (isUserName, iupDB = false, ctx) => {
  await new Promise(async (resolve, reject) => {
    try {
      const { Builder, By } = selenium
      let url =
        'https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2%E7%AD%9B%E9%80%89'
      // 获取一个浏览器
      let driver = new Builder().forBrowser('chrome').build()
      // 错误信息
      let ErrorMessage = ''
      let yysArrList = []
      // 打开网页
      await driver.get(url)
      // 判断是否找到角色
      let falgestr: boolean = false
      // 获取所有的 li
      let items = await driver.findElements(By.css('#CardSelectTr tbody tr'))
      // 循环迭代数据
      for (let i = 0; i < items.length; i++) {
        // 获取当前 tr 下的 td
        let text = await items[i].findElements(By.css('td'))
        // 名字
        let username = await text[1].getText()
        // 如果名字为空，则跳过
        if (isUserName && username !== isUserName) continue
        falgestr = true
        // 品质
        let quality = await items[i].getAttribute('data-param1')
        // 武器类型
        let weaponType = await items[i].getAttribute('data-param2')
        // 属性
        let proerty = await items[i].getAttribute('data-param3')
        // 性别
        let gender = await items[i].getAttribute('data-param4')
        // 地区
        let region = await items[i].getAttribute('data-param5')
        // 90生命值
        let initialMaxHP = await text[7].getText()
        // 90攻击力
        let initialMaxATK = await text[8].getText()
        // 90防御力
        let initialMaxPH = await text[9].getText()
        // TAG
        let TAG = await items[i].getAttribute('data-param6')
        // 角色活动池
        let isUP = await items[i].getAttribute('data-param7')
        // 突破加成
        let breakProp = await text[10].getText()

        // 循环追加
        yysArrList.push({
          username,
          quality,
          weaponType,
          proerty,
          gender,
          region,
          initialMaxHP,
          initialMaxATK,
          initialMaxPH,
          TAG,
          isUP,
          breakProp
        })
      }
      // 如果找到则进入
      if (falgestr) {
        console.log(yysArrList)
        // 一次插入多个数据
        if (iupDB) {
          const SQL =
            'insert into userrole(`username`,`quality`,`weaponType`,`proerty`,`gender`,`region`,`initialMaxHP`,`initialMaxATK`,`initialMaxPH`,`TAG`,`isUP`,`breakProp`) value ?'
          const list = yysArrList.map(item => {
            return Object.values(item)
          })
          // 追加到数据库
          await db.query(SQL, [list], (err, results) => {
            if (err) {
              console.log(err.message)
              ErrorMessage = err.message
              return err
            }
            console.log(results)
          })
        }
        console.log('角色基本信息爬取成功~~~')
        // 关闭当前一个窗口
        driver.close()
        ErrorMessage ? resolve(ErrorMessage) : resolve('获取成功')
        // 爬虫成功
        Success<string>(ctx, `${isUserName}-基本信息爬取成功~~~`)
        // 关闭浏览器
        // driver.quit()
      } else {
        // 关闭当前一个窗口
        driver.close()
        ErrorMessage ? resolve(ErrorMessage) : resolve(`没有-${isUserName}-该角色`)
        Errors(ctx, `没有-${isUserName}-该角色`)
      }
    } catch (error) {
      Errors(ctx, error)
    }
  })
}
