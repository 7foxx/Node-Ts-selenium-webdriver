/*
 * @Author: Any
 * @Date: 2022-04-25 12:17:01
 * @LastEditTime: 2022-06-05 20:01:34
 * @LastEditors: Any
 * @Description: 角色信息
 * @FilePath: \node-ts\src\controller\Crawl\Wiki\Role\IDentityUser.ts
 * 版权声明
 */
import selenium from 'selenium-webdriver'
import db from '@/db'
import type { WikiType } from '../type'
import { Errors, Success } from '@/utils/response'
/**
 * @description: 角色类
 * @param {string} isUserName 角色名
 * @param {boolean} iupDB 是否追加数据库
 * @param {Context} ctx 路由对象
 */

export const IDentityUser: WikiType = async (isUserName, iupDB = false, ctx) => {
  await new Promise((resolve, reject) => {
    try {
      const { Builder, By } = selenium
      let url = 'https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2'
      // 获取一个浏览器
      let driver = new Builder().forBrowser('chrome').build()
      // driver.set_page_load_timeout(5) // 设置超时时间为5秒，如果5秒后网页还是没有加载完成则抛出异常
      // 错误信息
      let ErrorMessage = ''
      try {
        // 打开网页
        driver.get(url)
      } catch (error) {
        console.log('跳过')
      }
      // 判断是否找到角色
      let falgestr: boolean = false
      // 角色计数器（0从第一个开始爬所有角色）
      let idindex = 0

      // 所有角色数量
      let AllLing = null
      let uidI: any = '0'

      // 角色名称
      let username: string = ''
      ;(async function fn() {
        // 获取角色图鉴 按钮
        AllLing = await driver.findElements(
          By.css('.resp-tabs-container .resp-tab-content .resp-tab-case')
        )
        uidI = await AllLing[0].findElements(By.css('.g'))
        // 开始爬取
        strt(idindex)
      })()

      // 爬取角色信息主函数
      async function strt(i: number) {
        // let yysArrList = []
        if (!isUserName) {
          await new Promise<void>((res, rej) => {
            setTimeout(() => {
              console.log('已进入角色详情页')
              res()
            }, 3000)
          })
        }
        // 获取角色图鉴 按钮
        const arr = await driver.findElements(
          By.css('.resp-tabs-container .resp-tab-content .resp-tab-case')
        )
        const alit = await arr[0].findElements(By.css('.g'))
        const but = await alit[i].findElements(By.css('a'))
        const BtnUsername = await alit[i].findElement(By.css('.L')).getText()
        // 如果名字相同 则进入 且不能为旅行者
        if (BtnUsername === isUserName && BtnUsername !== '旅行者') {
          falgestr = true
          await driver.executeScript('arguments[0].click();', but[1])

          // 等待爬取信息
          await new Promise<void>((res, rej) => {
            setTimeout(() => {
              console.log('开始爬取角色信息')
              res()
            }, 3000)
          })

          // 获取角色信息（第一张表）
          await usernames()

          // 获取角色天赋技能信息（第二张）
          // await talent()

          // 爬虫成功跳转到 获取角色图鉴 页面
          const arr2 = await driver.findElements(
            By.css('#mw-content-text>.mw-parser-output>div')
          )
          const but2 = await arr2[0].findElements(By.css('div>a'))
          await driver.executeScript('arguments[0].click();', but2[1])
        } else if (i === uidI.length - 1 && !falgestr) {
          // 没有找到角色则推出
          console.log('没有该角色')
          driver.close()
          resolve('没有该角色')
          Errors(ctx, `没有-${isUserName}-该角色`)
          return
        }

        // 递归爬取 (循环所有角色)
        if (i < uidI.length - 1) {
          ++idindex
          strt(idindex)
        } else {
          console.log(`${isUserName}-详细信息爬取成功~~~`)
          // 关闭当前一个窗口
          driver.close()
          ErrorMessage ? resolve(ErrorMessage) : resolve('获取成功')
          // 爬虫成功
          Success<string>(ctx, `${isUserName}-详细信息爬取成功~~~`)
          // 关闭浏览器
          // driver.quit()
          return
        }
      }

      // 第一张表 identityuser
      // 获取角色信息详情（角色详情表）
      async function usernames() {
        let userList = []
        const All = await driver.findElements(By.css('.mw-parser-output .row'))
        const rowArr = await All[0].findElements(By.css('.col-sm-8>.poke-bg'))
        // 所有模块名称
        const nameAll = await All[0].findElements(
          By.css('.col-sm-8>h2 .mw-headline')
        )
        // 角色名称
        username = await nameAll[0].getText()
        // 角色信息模块
        const items = rowArr[0]
        // 获取所有的 tr
        const trAll = await items.findElements(By.css('tbody tr'))
        // 称号
        const TitleName = await trAll[0].findElement(By.css('td')).getText()
        // 全名
        const FullName = await trAll[1].findElement(By.css('td')).getText()
        // 所属地区
        const affiliating = await trAll[2].findElement(By.css('td')).getText()
        // 性别
        const sex = await trAll[3].findElement(By.css('td')).getText()
        // 稀有度
        let str = await trAll[4]
          .findElement(By.css('td img'))
          .getAttribute('alt')
        let rarity = str.substring(0, 1)
        // 卡池
        const pond = await trAll[5].findElement(By.css('td')).getText()
        // 元素
        const Uelement = await trAll[6].findElement(By.css('td')).getText()
        // 武器类型
        const WeaponTypes = await trAll[7].findElement(By.css('td')).getText()
        // 命之座
        const LifeOfTheSit = await trAll[8].findElement(By.css('td')).getText()
        // 特殊料理
        let arrange = await trAll[9].findElement(By.css('td')).getText()
        arrange = arrange.replace(/\s/gi, '')
        // 实装日期
        const NewDAte = await trAll[10].findElement(By.css('td')).getText()
        const Livefiredate = NewDAte.replace(/年|月/gi, '-').replace(/日/gi, '')
        // 人物特点
        const characteristic = await trAll[11]
          .findElement(By.css('td'))
          .getText()
        // 人物介绍
        const introduce = await trAll[12].findElement(By.css('td')).getText()
        userList.push({
          username,
          TitleName,
          FullName,
          affiliating,
          sex,
          rarity,
          pond,
          Uelement,
          WeaponTypes,
          LifeOfTheSit,
          arrange,
          Livefiredate,
          characteristic,
          introduce
        })
        console.log(userList)

        if (iupDB) {
          userList.map(async item => {
            const SQL = `UPDATE identityuser SET 
            pond='${item.pond}',
            affiliating='${item.affiliating}',
            sex='${item.sex}',
            FullName='${item.FullName}',
            Livefiredate='${item.Livefiredate}',
            characteristic='${item.characteristic}' WHERE username = '${item.username}'`
            db.query(SQL, (err, results) => {
              if (err) return console.log(err.message)
              console.log(results)
            })
          })
        }
      }
    } catch (error) {
      Errors(ctx, error)
    }
  })
}
