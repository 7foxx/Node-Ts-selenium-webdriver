/*
 * @Author: Any
 * @Date: 2022-05-12 13:16:01
 * @LastEditTime: 2022-05-21 13:33:24
 * @LastEditors: Any
 * @Description: 角色信息
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\Role\RoleSilkInfo.ts
 * 版权声明
 */
import db from '@/db'
import { to2DArray2 } from '@/utils'
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
    const IsNumIndex = 3
    // 多开浏览器
    const driver2arr: any[] = []
    let Url = ''
    if (isAll) {
      Url = 'https://genshin.honeyhunterworld.com/db/char/characters/?lang=CHS'
    } else {
      Url =
        'https://genshin.honeyhunterworld.com/db/char/unreleased-and-upcoming-characters/?lang=CHS'
    }

    const Theselector = {
      lectorFn: 'css',
      lector: '.char_sea_cont'
    }

    // 黑名单
    const blackList = ['旅行者']
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
            const urlB = await Arra.getAttribute('href').catch(() => [])
            if (typeof urlB === 'string') {
              // 打开网页
              console.log(urlB)
              driver2.get(urlB)
            }

            // 名称
            const username = element2.name

            // 所有 table
            const StatProgressionTable = await driver2
              .findElements(By.css(`.add_stat_table`))
              .catch(() => [])
            // 基本属性
            const StatProgression = []
            // 属性突破材料
            const material2: any = []
            const StatProgressionTRArr = await StatProgressionTable[1]
              .findElements(By.css('tr'))
              .catch(() => [])
            for (let i = 0; i < StatProgressionTRArr.length; i++) {
              const element = StatProgressionTRArr[i]
              const textarr = await element.getText().catch(() => [])
              StatProgression[i] = textarr.split(/\s/).slice(0, 6)
              // 属性突破材料
              if (StatProgression[i][0].search(/\+/) > -1) {
                const tdarr1 = await StatProgressionTRArr[i - 1]
                  .findElements(By.css('td'))
                  .catch(() => [])
                const tdarr = await tdarr1[tdarr1.length - 2]
                  .findElements(By.css('.nowrap_rew_cont'))
                  .catch(() => [])
                material2[i] = []
                for (let j = 0; j < tdarr.length; j++) {
                  const element = tdarr[j]
                  const str = await element.getText().catch(() => '')
                  const imgstr = await element
                    .findElement(By.css('img'))
                    .getAttribute('data-src')
                    .catch(() => [])
                  const img = imgstr.replace(/_35\.png/, '')
                  material2[i].push({
                    img,
                    num: str
                  })
                }
              }
            }
            // console.log(StatProgression)
            // 属性突破材料
            const StatProgressionMaterial = material2.filter(
              (item: any) => item
            )
            // console.log(StatProgressionMaterial)

            // 技能与名座
            const SkillProgression = await driver2
              .findElements(By.css('.data_cont_wrapper .item_main_table'))
              .catch(() => [])
            SkillProgression.splice(0, 1)
            const SkillProgressionArr: any = []
            for (let i = 0; i < SkillProgression.length; i++) {
              const element = SkillProgression[i]
              const trarr = await element
                .findElements(By.css('tr'))
                .catch(() => [])
              const arr = []
              for (let j = 0; j < trarr.length; j++) {
                const element = trarr[j]
                let text = ''
                if (j % 2 === 0) {
                  text = await element.getText().catch(() => '')
                } else {
                  text = await element
                    .findElement(By.css('.skill_desc_layout'))
                    .getAttribute('outerHTML')
                    .catch(() => '')
                  text = text.replace(
                    /<\/div>|<div class="skill_desc_layout">/gi,
                    ''
                  )
                }
                arr.push(text)
              }
              SkillProgressionArr[i] = arr
            }
            const newArr = SkillProgressionArr.filter((item: any[]) =>
              item.every(item2 => item2.trim().length)
            )
            // 处理数据
            if (newArr.length >= 6) {
              newArr.splice(6)
            } else {
              newArr.splice(3, 0, [])
            }
            // 被动
            const passive = to2DArray2(newArr[4], 2)
            // 命坐
            const Lifeofthesit = to2DArray2(newArr[5], 2)
            const GeneralAttack = [...newArr.slice(0, 4), passive, Lifeofthesit]
            // 技能属性
            const object: any = {
              S: 2,
              E: 3,
              Q: GeneralAttack[3].length !== 0 ? 5 : 4
            }
            const SkillProgressionOBJECTS: any = {}
            for (const key in object) {
              if (Object.prototype.hasOwnProperty.call(object, key)) {
                const element = object[key]
                const TRArr = await driver2
                  .findElements(
                    By.xpath(
                      `/\/*[@class="wrappercont"]/div[${
                        isAll ? 3 : 4
                      }]/div[${element}]/table/tbody/tr`
                    )
                  )
                  .catch(() => [])
                SkillProgressionOBJECTS[key] = []
                for (let i = 0; i < TRArr.length; i++) {
                  const TDARR = await TRArr[i]
                    .findElements(By.css('td'))
                    .catch(() => [])
                  SkillProgressionOBJECTS[key][i] = []
                  for (let j = 0; j < TDARR.length; j++) {
                    const element = TDARR[j]
                    const str = await element.getText().catch(() => '')
                    SkillProgressionOBJECTS[key][i][j] = str.replace(/\\n/, '')
                  }
                }
              }
            }
            // console.log(SkillProgressionOBJECTS)
            // 技能突破材料
            const material = await driver2
              .findElements(
                By.xpath(
                  `/\/*[@class="wrappercont"]/div[${isAll ? 3 : 4}]/div[${
                    GeneralAttack[3].length !== 0 ? 6 : 5
                  }]/table/tbody/tr`
                )
              )
              .catch(() => [])

            material.splice(0, 1)
            const materialArr: any = []
            for (let i = 0; i < material.length; i++) {
              const element = await material[i].findElements(By.css('td'))
              const tdarr = await element[1]
                .findElements(By.css('.nowrap_rew_cont'))
                .catch(() => [])
              materialArr[i] = []
              for (let j = 0; j < tdarr.length; j++) {
                const element = tdarr[j]
                const str = await element.getText().catch(() => '')
                const imgstr = await element
                  .findElement(By.css('img'))
                  .getAttribute('data-src')
                  .catch(() => [])
                const img = imgstr.replace(/_35\.png/, '')
                materialArr[i].push({
                  img,
                  num: str
                })
              }
            }
            // console.log({
            //   username,
            //   BasicProperties: JSON.stringify(StatProgression),
            //   BasicAttributeBreakthrough: JSON.stringify(
            //     StatProgressionMaterial
            //   ),
            //   GeneralAttack: JSON.stringify(GeneralAttack[0]),
            //   GeneralAttackData: JSON.stringify(SkillProgressionOBJECTS.S),
            //   Eskills: JSON.stringify(GeneralAttack[1]),
            //   EskillsData: JSON.stringify(SkillProgressionOBJECTS.E),
            //   ShiftSkills: JSON.stringify(GeneralAttack[3]),
            //   Qskills: JSON.stringify(GeneralAttack[2]),
            //   QskillsData: JSON.stringify(SkillProgressionOBJECTS.Q),
            //   SkillsBreakthroughMaterials: JSON.stringify(materialArr),
            //   passive: JSON.stringify(GeneralAttack[4]),
            //   Lifeofthesit: JSON.stringify(GeneralAttack[5])
            // })
            if (iupDB) {
              const objs: {
                [key: string]: string
              } = {
                RoleAttributeID: '',
                username,
                BasicProperties: JSON.stringify(StatProgression),
                BasicAttributeBreakthrough: JSON.stringify(
                  StatProgressionMaterial
                ),
                GeneralAttack: JSON.stringify(GeneralAttack[0]),
                GeneralAttackData: JSON.stringify(SkillProgressionOBJECTS.S),
                Eskills: JSON.stringify(GeneralAttack[1]),
                EskillsData: JSON.stringify(SkillProgressionOBJECTS.E),
                ShiftSkills: JSON.stringify(GeneralAttack[3]),
                Qskills: JSON.stringify(GeneralAttack[2]),
                QskillsData: JSON.stringify(SkillProgressionOBJECTS.Q),
                SkillsBreakthroughMaterials: JSON.stringify(materialArr),
                passive: JSON.stringify(GeneralAttack[4]),
                Lifeofthesit: JSON.stringify(GeneralAttack[5])
              }
              // 查询id
              await new Promise<void>((resolve, reject) => {
                const SQLID = `SELECT identUserID FROM identityuser WHERE username = '${objs.username}'`
                db.query(SQLID, (err: any, result: any) => {
                  if (err) return console.log(err)
                  objs.RoleAttributeID = result[0].identUserID
                  console.log(result)
                  resolve()
                })
              })
              // 一次插入多个数据
              const SQL =
                'insert into role_attribute_data(`RoleAttributeID`,`username`,`BasicProperties`,`BasicAttributeBreakthrough`,`GeneralAttack`,`GeneralAttackData`,`Eskills`,`EskillsData`,`ShiftSkills`,`Qskills`,`QskillsData`,`SkillsBreakthroughMaterials`,`passive`,`Lifeofthesit`) value ?'
              const list = [Object.values(objs)]
              db.query(SQL, [list], (err, res) => {
                if (err) return console.log(err)
                console.log(res)
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
      mainFn
    )
    if (falgs) {
      resolve(falgs)
    }
  })
}
export default fun
