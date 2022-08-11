/*
 * @Author: Any
 * @Date: 2022-05-12 13:16:01
 * @LastEditTime: 2022-05-20 16:12:46
 * @LastEditors: Any
 * @Description: 敌人信息资源
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\LivingBeings\Gegner.ts
 * 版权声明
 */
import db from '@/db'
import download from 'download'
import selenium from 'selenium-webdriver'
import {
  DistributionFn,
  distributionUtilFunction,
  MainfnT
} from '../../distribution'
const { Builder, By } = selenium
// 怪物英文名
const Ename = require('./GegnerName.json')
const fun: DistributionFn = async (data, ctx) => {
  return await new Promise(async resolve => {
    const { isName, isAll ,iupDB} = data
    // 分成几段
    const IsNumIndex = 4
    let Url = 'https://genshin.honeyhunterworld.com/db/enemy/?lang=CHS'
    // 多开浏览器
    const driver2arr: any[] = []
    const Theselector = {
      lectorFn: 'css',
      lector: '.char_sea_cont'
    }

    // 黑名单
    const blackList = ['']
    // 主函数
    const mainFn: MainfnT = async (newArr, driver, timer) => {
      const fnArr: Promise<Boolean>[] = []
      for (let i = 0; i < newArr.length; i++) {
        fnArr[i] = (async () => {
          const element = newArr[i]
          // 获取第浏览器
          driver2arr[i] = new Builder().forBrowser('chrome').build()
          const driver2 = driver2arr[i]
          for (let j = 0; j < element.length; j++) {
            const element2 = element[j]
            const Arra = await element2.element
              .findElements(By.css('a'))
              .catch((err: any) => err)
            const url = await Arra[1].getAttribute('href')
            if (typeof url === 'string') {
              // 打开网页
              console.log(url)
              driver2.get(url)
            }
            // 名称
            // const username = await driver2
            //   .findElement(By.xpath('//*[@class="wrappercont"]/div[1]'))
            //   ?.getText()
            const username = element2.name
            const TheEnglishname = element2.EnglishName
            console.log(element2.name)
            console.log(element2.EnglishName)
            //  类型
            const type = await driver2
              .findElement(
                By.xpath(
                  `//*[@class="wrappercont"]/table[1]/tbody/tr[1]/td[3]/a`
                )
              )
              ?.getText()
              .catch((err: any) => err)

            // Icon
            const iconArr = await driver2
              .findElements(By.css(`.wrappercont .item_main_table`))
              .catch((err: any) => err)
            const iconurl = await iconArr[0]
              .findElement(By.css(`img`))
              ?.getAttribute('data-src')
              .catch((err: any) => err)

            download(
              `https://genshin.honeyhunterworld.com` + iconurl,
              `./src/assets/AssetsDate/LivingBeings/Gegner/${username}`,
              {
                filename: `icon_${username}.png`
              }
            )
            const icon = `LivingBeings/Gegner/icon_${username}.png`

            // 介绍Description
            const Descriptionarr = await driver2
              .findElement(
                By.xpath(`//*[@class="wrappercont"]/table[1]/tbody/tr[4]/td[2]`)
              )
              .getAttribute('outerHTML')
              .catch((err: any) => err)
            const Description = Descriptionarr.replace(/<td>|<\/td>/g, '')

            //  Drops 掉落
            const dropsArrTr = await driver2
              .findElements(By.xpath(`//*[@class="wrappercont"]/table[2]//tr`))
              .catch((err: any) => err)
            dropsArrTr.splice(0, 1)
            const Drops: string[] = []
            for (let i = 0; i < dropsArrTr.length; i++) {
              const element = dropsArrTr[i]
              const text = await element?.getText()
              Drops[i] = text.split(' ')[0]
            }

            // 属性抗性
            const resistArrTd = await driver2
              .findElements(
                By.xpath(`//*[@class="wrappercont"]/table[4]/tbody/tr[4]/td`)
              )
              .catch((err: any) => err)
            resistArrTd.splice(0, 3)
            const resist = []
            const resistArrName = [
              '物',
              '火',
              '草',
              '水',
              '雷',
              '风',
              '冰',
              '岩'
            ]
            for (let i = 0; i < resistArrTd.length; i++) {
              const element = resistArrTd[i]
              const text = await element?.getText()
              resist[i] = {
                [resistArrName[i]]: text
              }
            }

            // 详细属性
            let attribute: string[][] = []
            if (type === 'Bosses') {
              // 形态名称
              const tables = await driver2.findElements(
                By.css('.wrappercont>.monster_stat_table')
              )
              const ssfafa: any[] = []
              for (let i = 0; i < tables.length; i++) {
                const element = tables[i]
                const trarr = await element.findElements(By.css('tr'))
                const Aname = await trarr[0].getText()
                const Bname = await trarr[5]?.getText()
                ssfafa[i] = {
                  Aname,
                  Bname,
                  element: []
                }
              }
              // 具体形态属性
              const tables2 = await driver2.findElements(
                By.css('.add_stat_table')
              )
              tables2.splice(0, 1)
              for (let i = 0; i < tables2.length; i++) {
                const elementi = tables2[i]
                const trarr = await elementi
                  .findElements(By.css('tr'))
                  .catch((err: any) => err)
                for (let j = 0; j < trarr.length; j++) {
                  const elementj = trarr[j]
                  const tdarr = await elementj
                    .findElements(By.css('td'))
                    .catch((err: any) => err)
                  ssfafa[i].element[j] = []
                  for (let k = 0; k < tdarr.length; k++) {
                    const elementk = tdarr[k]
                    ssfafa[i].element[j][k] = await elementk
                      ?.getText()
                      .catch((err: any) => err)
                  }
                }
              }
              attribute = ssfafa
            } else {
              const attributearr = await driver2
                .findElements(
                  By.xpath(`//*[@class="wrappercont"]/div[4]/table/tbody/tr`)
                )
                .catch((err: any) => err)
              for (let i = 0; i < attributearr.length; i++) {
                const element = attributearr[i]
                const tdarr = await element
                  .findElements(By.css('td'))
                  .catch((err: any) => err)
                attribute[i] = []
                for (let j = 0; j < tdarr.length; j++) {
                  attribute[i][j] = await tdarr[j]
                    ?.getText()
                    .catch((err: any) => err)
                }
              }
            }

            console.log({
              username,
              TheEnglishname,
              type,
              icon,
              Description: JSON.stringify(Description),
              Drops: JSON.stringify(Drops),
              resist: JSON.stringify(resist),
              attribute: JSON.stringify(attribute)
            })
            const objs = {
              username,
              TheEnglishname,
              type,
              icon,
              Description: JSON.stringify(Description),
              Drops: JSON.stringify(Drops),
              resist: JSON.stringify(resist),
              attribute: JSON.stringify(attribute)
            }
            if(iupDB){
              // 一次插入多个数据
              const SQL =
                'insert into livingbeings(`username`,`TheEnglishname`,`type`,`icon`,`Description`,`Drops`,`resist`,`attribute`) value ?'
              const list = [Object.values(objs)]
              // 追加到数据库
              db.query(SQL, [list], (err, results) => {
                if (err) return console.log(err.message)
                console.log(results)
              })
            }
          }
          return Promise.resolve(true)
        })()
      }
      const ProAll = await Promise.all(fnArr)
      // 清楚定时器
      clearInterval(timer)
      driver.quit().catch((err: any) => err)
      driver2arr.map(item => {
        item.quit().catch((err: any) => err)
      })
      return Promise.resolve(!!ProAll.length && ProAll.every(item => item))
    }
    // 调用主函数框架
    const falgs = await distributionUtilFunction(
      Url,
      blackList,
      isName,
      Theselector,
      IsNumIndex,
      mainFn,
      Ename
    )
    if (falgs) {
      resolve(falgs)
    }
  })
}
export default fun
