/*
 * @Author: Any
 * @Date: 2022-04-25 12:48:50
 * @LastEditTime: 2022-06-05 20:00:46
 * @LastEditors: Any
 * @Description: 角色突破材料
 * @FilePath: \node-ts\src\controller\Crawl\Wiki\Role\GetRodebrek.ts
 * 版权声明
 */
import selenium from 'selenium-webdriver'
import db from '@/db'
import { WikiType } from '../type'
import { MysqlError } from 'mysql'
import { Errors, Success } from '@/utils/response'

/**
 * @description:角色突破材料
 * @param {*} isUserName 角色名
 * @param {*} iupDB 是否追加数据库
 * @param {Context} ctx 路由对象
 */
export const GetRodebrek: WikiType = async (isUserName, iupDB = false, ctx) => {
  await new Promise(async (resolve, reject) => {
    const { Builder, By } = selenium
    let url =
      'https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2%E6%B6%88%E8%80%97%E6%9D%90%E6%96%99%E4%B8%80%E8%A7%88'
    // 获取一个浏览器
    let driver = new Builder().forBrowser('chrome').build()
    // driver.set_page_load_timeout(5) // 设置超时时间为5秒，如果5秒后网页还是没有加载完成则抛出异常
    // 错误信息
    let ErrorMessage: string | MysqlError = ''
    try {
      // 打开网页
      driver.get(url)
    } catch (error) {
      console.log('跳过')
    }
    // 计数器
    let idindex = 0

    // 所有数量
    let AllLing = null
    // 判断是否找到角色
    let falgestr: boolean = false
    ;(async function fn() {
      // 获取所有数量
      AllLing = await driver.findElements(By.css('#CardSelectTr tbody tr'))
      // 开始爬取
      strt(idindex)
    })()

    // 爬虫主函数
    async function strt(i: number) {
      // 等待3秒
      // await new Promise((res, rej) => {
      //   setTimeout(() => {
      //     console.log('已进详情页')
      //     res()
      //   }, 3000)
      // })

      // 获取所有的tr
      AllLing = await driver.findElements(By.css('#CardSelectTr tbody tr'))
      // 获取当前tr下的所有td
      const td = await AllLing[i].findElements(By.css('td'))
      const uname = await td[1].getText()
      // 如果名字为空，则跳过
      if (isUserName && uname === isUserName) {
        falgestr = true
        const tparr = await td[9].findElements(By.css('a'))
        const tparrtest = []
        for (let i = 0; i < tparr.length; i++) {
          const test = await tparr[i].getAttribute('title')
          tparrtest.push(test)
        }
        const tfarr = await td[10].findElements(By.css('a'))
        const tfarrtest = []
        for (let i = 0; i < tfarr.length; i++) {
          const test = await tfarr[i].getAttribute('title')
          tfarrtest.push(test)
        }
        console.log(uname, tparrtest, tfarrtest)

        const materials = JSON.stringify([tparrtest, tfarrtest])
        // 等待爬取信息
        // await new Promise((res, rej) => {
        //   setTimeout(() => {
        //     console.log('开始爬取角色信息')
        //     res()
        //   }, 3000)
        // })
        if (iupDB) {
          db.query(
            `UPDATE identityuser set materials='${materials}' where username='${uname}'`,
            (err, res) => {
              if (err) {
                console.log(err)
                ErrorMessage = err
                return err
              }
              console.log(res)
            }
          )
        }
      } else if (i === AllLing.length - 1 && !falgestr) {
        // 没有找到角色则推出
        console.log('没有该角色')
        driver.close()
        resolve('没有该角色')
        Errors(ctx, `没有-${isUserName}-该角色`)
        return
      }
      // 出口
      if (i < AllLing.length - 1) {
        await strt(++idindex)
      } else {
        console.log(`${isUserName}-角色突破材料爬取成功~~~`)
        // 关闭当前一个窗口
        driver.close()
        resolve('获取成功')
        // 关闭浏览器
        // driver.quit()
        Success<string>(ctx, `${isUserName}-突破材料爬取成功~~~`)
        return
      }
    }
  })
}
