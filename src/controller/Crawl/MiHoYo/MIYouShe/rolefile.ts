/*
 * @Author: Any
 * @Date: 2022-05-10 09:55:09
 * @LastEditTime: 2022-05-20 16:13:36
 * @LastEditors: Any
 * @Description: 米游社
 * @FilePath: \node-ts\src\controller\Crawl\MiHoYo\MIYouShe\rolefile.ts
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

const url = `https://bbs.mihoyo.com/ys/obc/channel/map/189/25?bbs_presentation_style=no_headerb`

export const MIYouShe: DistributionFn = async data => {
  return await new Promise(async (resolve, reject) => {
    const { isName, isAll ,iupDB} = data
    // 分成几段
    const IsNumIndex = 4
    // 多开浏览器
    const driver2arr: any[] = []
    const Theselector = {
      lectorFn: 'xpath',
      lector:
        '//*[@id="__layout"]/div/div[2]/div[2]/div/div[1]/div[2]/ul/li/div/ul/li[1]/div/div/a'
    }
    // 主体函数
    const mainFn: MainfnT = async (newArr, driver, timer) => {
      const fnArr: Promise<Boolean>[] = []
      for (let i = 0; i < newArr.length; i++) {
        fnArr[i] = (async () => {
          const element = newArr[i]
          // 获取第浏览器
          driver2arr[i] = new Builder().forBrowser('chrome').build()
          const driver2 = driver2arr[i]
          for (let j = 0; j < element.length; j++) {
            const element2 = await element[j].element.getAttribute('href')
            if (typeof element2 === 'string') {
              // 打开网页
              console.log(element2)
              driver2.get(element2)
            }
            // 名称
            const username = await driver2
              .findElement(
                By.xpath(
                  `//*[@id="__layout"]/div/div[2]/div[2]/div/div[1]/div[3]/div[1]/h1`
                )
              )
              .getText()

            // 下载例会
            const downloadBtnArr = await driver2.findElements(
              By.css('.obc-tmpl__part--align-right')
            )
            const Theregularmeeting = await downloadBtnArr[0]
              .findElement(By.css('img'))
              .getAttribute('src')
            download(
              Theregularmeeting,
              `./src/assets/AssetsDate/人物/Dynamicfigure/${username}`,
              { filename: `${username}.png` }
            )

            const devArr = await driver2.findElements(
              By.css('.obc-tmpl__part--align-left')
            )

            // 获取角色动作资源
            const StandbyactionFunc = async (index: number) => {
              const StandbyactionUlArr = await devArr[index].findElements(
                By.css('ul')
              )
              const StandbyactionNameArr = await StandbyactionUlArr[0].getText()
              const StandbyactionName = StandbyactionNameArr.split('\n')
              const StandbyactionImgArr =
                await StandbyactionUlArr[1].findElements(By.css('img'))
              const Standbyaction = []
              for (let i = 0; i < StandbyactionImgArr.length; i++) {
                const element = StandbyactionImgArr[i]
                const src = await element?.getAttribute('src')
                if (!!src) {
                  Standbyaction.push({
                    name: StandbyactionName[i],
                    src
                  })
                }
              }
              return Standbyaction
            }
            // 待机动作
            const Standbyaction = await StandbyactionFunc(0)
            // 技能
            const Skill = await StandbyactionFunc(1)
            const elementObj = {
              username,
              UrlSrc: [...Standbyaction, ...Skill]
            }
            const newArr: any = {
              例会: `/人物/Dynamicfigure/例会.png`
            }
            elementObj.UrlSrc.map((item: any) => {
              newArr[item.name] = `/人物/Dynamicfigure/${item.name}.gif`
              download(
                item.src,
                `./src/assets/AssetsDate/人物/Dynamicfigure/${username}`,
                {
                  filename: `${item.name}.gif`
                }
              )
            })
            const sql = `UPDATE identityuser SET Dynamicfigure = '${JSON.stringify(
              newArr
            )}' WHERE username = '${username}'`
            db.query(sql, (err, res) => {
              if (err) return console.log(err)
              console.log(res)
            })
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
      return Promise.resolve(ProAll.every(item => item))
    }
    const blackList = ['旅行者']
    const falgs = await distributionUtilFunction(
      url,
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

export default MIYouShe
