/*
 * @Author: Any
 * @Date: 2022-05-19 09:56:49
 * @LastEditTime: 2022-06-05 11:01:41
 * @LastEditors: Any
 * @Description: GenshinImpactWiki 角色资源
 * @FilePath: \node-ts\src\controller\Crawl\GenshinImpactWiki\Role\Rolefile.ts
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
    const { isName, isAll, iupDB } = data
    // 分成几段
    const IsNumIndex = 6
    let Url = `https://genshin-impact.fandom.com/wiki/Genshin_Impact_Wiki`

    // 多开浏览器
    const driver2arr: any[] = []
    const Theselector = {
      lectorFn: 'css',
      lector: '.card_container'
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
            let imgstr1 = ''
            imgstr1 = await driver2
              .findElement(
                By.xpath(
                  `//*[@id="mw-content-text"]/div[1]/aside/div/div[3]/figure/a/img`
                )
              )
              .getAttribute('src')
              .catch(() => '')

            //人物站立图小图
            let imgstr2 = ''
            imgstr2 = await driver2
              .findElement(
                By.xpath(
                  `//*[@id="mw-content-text"]/div[1]/aside/div/div[4]/figure/a/img`
                )
              )
              .getAttribute('src')
              .catch(() => '')
            //人物站立图最新的
            let imgstr3 = ''
            imgstr3 = await driver2
              .findElement(
                By.xpath(
                  `//*[@id="mw-content-text"]/div[1]/aside/div/div[4]/figure/a`
                )
              )
              .getAttribute('href')
              .catch(() => '')
            if (imgstr1 && imgstr2 && imgstr3) {
              const img1 = imgstr1
              const img1_MAX = imgstr1?.replace(/\/(\d+)\?/gi, '/1000?')
              const img2 = imgstr2
              const img2_MAX = imgstr3
              let identUserID = ''
              // 查询中午名
              await new Promise<void>((resolve, reject) => {
                const sql = `SELECT identUserID FROM identityuser WHERE EnglishName = '${Eusername}'`
                db.query(sql, (err, res) => {
                  identUserID = res[0]?.identUserID
                  resolve()
                })
              })
              // 如果没有中文名就跳过
              if (!identUserID) continue
              download(img1, `./src/assets/AssetsDate/人物/Boutique_MIN`, {
                filename: `${identUserID}.png`
              }).catch(() => null)
                download(img1_MAX, `./src/assets/AssetsDate/人物/Boutique_MAX`, {
                  filename: `${identUserID}.png`
                }).catch(() => null)
                download(img2, `./src/assets/AssetsDate/人物/InGame`, {
                  filename: `${identUserID}.png`
                }).catch(() => null)
              download(img2_MAX, `./src/assets/AssetsDate/人物/InGame_MAX`, {
                filename: `${identUserID}.png`
              }).catch(() => null)
              const obj = {
                Eusername,
                identUserID,
                Boutique_MAX: `/人物/Boutique_MAX/${identUserID}.png`,
                InGame: `/人物/InGame/${identUserID}.png`
              }
              console.log(obj)
              if (iupDB) {
                const SQL = `UPDATE identityuser SET InGame = '${obj.InGame}' WHERE identUserID = '${obj.identUserID}'`
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
      mainFn
    )
    if (falgs) {
      resolve(falgs)
    }
  })
}

export default fun
