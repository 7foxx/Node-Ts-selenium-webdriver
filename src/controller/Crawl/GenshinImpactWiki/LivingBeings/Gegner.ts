/*
 * @Author: Any
 * @Date: 2022-05-17 19:30:27
 * @LastEditTime: 2022-05-20 16:13:03
 * @LastEditors: Any
 * @Description: GenshinImpactWiki 怪物资源
 * @FilePath: \node-ts\src\controller\Crawl\GenshinImpactWiki\LivingBeings\Gegner.ts
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
const fun: DistributionFn = async (data, ctx) => {
  return await new Promise(async resolve => {
    const { isName, isAll ,iupDB} = data
    // 分成几段
    const IsNumIndex = 5
    const type = [
      `Elite_Enemies`,
      `Common_Enemies`,
      `Normal_Bosses`,
      `Weekly_Bosses`,
      `Wildlife`
    ]
    const typeURL = type[2]
    let Url = ` https://genshin-impact.fandom.com/wiki/${typeURL}`

    // 多开浏览器
    const driver2arr: any[] = []
    const Theselector = {
      lectorFn: 'css',
      lector: '.wikitable .item_image'
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
              .findElement(By.css('a'))
              .catch((err: any) => err)
            const urlB = await Arra.getAttribute('href').catch(() => null)
            if (typeof urlB === 'string') {
              // 打开网页
              console.log(urlB)
              driver2.get(urlB)
            }
            // 名称
            const Eusername = await driver2
              .findElement(By.xpath(`//*[@id="firstHeading"]`))
              .getText()
              .catch((err: any) => err)

            // 大图
            let imgstr = ''
            imgstr = await driver2
              .findElement(
                By.xpath(`//*[@id="mw-content-text"]/div[1]/aside/figure/a/img`)
              )
              .getAttribute('src')
              .catch(() => '')
            // 如何为空执行方案2
            if (!imgstr) {
              imgstr = await driver2
                .findElement(
                  By.xpath(
                    `//*[@id="mw-content-text"]/div[1]/aside/div/div[2]/figure/a/img`
                  )
                )
                .getAttribute('src')
                .catch(() => '')
            }
            if (imgstr) {
              const img = imgstr?.replace(/\/350/gi, '/1000')
              let Zusernaeme = ''
              // 查询中午名
              await new Promise<void>((resolve, reject) => {
                const sql = `SELECT username FROM livingbeings WHERE TheEnglishname = '${Eusername}'`
                db.query(sql, (err, res) => {
                  Zusernaeme = res[0]?.username
                  resolve()
                })
              })
              // 如果没有中文名就跳过
              if (!Zusernaeme) continue
              download(
                img,
                `./src/assets/AssetsDate/LivingBeings/Gegner/${Zusernaeme}`,
                {
                  filename: `TheFull_${Zusernaeme}.png`
                }
              )
              const obj = {
                Eusername,
                Zusernaeme,
                img: `TheFull_${Zusernaeme}.png`
              }
              console.log(obj)
              if(iupDB){
                const SQL = `UPDATE livingbeings SET img = '${obj.img}' WHERE username = '${obj.Zusernaeme}'`
                db.query(SQL, (err, res) => {
                  if (err) return console.log(err)
                  console.log(res)
                })
              }
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
    )
    if (falgs) {
      resolve(falgs)
    }
  })
}

export default fun
