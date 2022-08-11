/*
 * @Author: Any
 * @Date: 2022-04-26 15:00:13
 * @LastEditTime: 2022-06-05 19:06:35
 * @LastEditors: Any
 * @Description: 爬取爆料测试角色信息
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\Role\RoleInfo.ts
 * 版权声明
 */
import db from '@/db'
import {
  crawlsubjectType,
  getDataBtnType,
  getDataNumType,
  returnpageType,
  UpdbTye
} from '../type'

// 已出角色
export const url =
  'https://genshin.honeyhunterworld.com/db/char/characters/?lang=CHS'
// 'https://genshin.honeyhunterworld.com/db/char/unreleased-and-upcoming-characters/?lang=CHS'

// 爆料角色
export const UPurl =
  'https://genshin.honeyhunterworld.com/db/char/unreleased-and-upcoming-characters/?lang=CHS'

// 角色名
let name: string = ''
// 英文名
let englishName: string = ''

// 获取所有角色数量
export const getDataNum: getDataNumType = async (driver, By) => {
  const leng = await driver
    .findElements(By.css('.char_sea_cont'))
    .catch((err: any) => {
      console.log(err)
      return err
    })
  return leng.length
}

// 获取角色按钮
export const getDataBtn: getDataBtnType = async (
  driver,
  By,
  index,
  isAll,
  isName
) => {
  const arr = await driver.findElements(By.css('.char_sea_cont'))
  if (isName) {
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i]
      const nameStr = await element
        .findElement(By.css('.sea_charname'))
        .getText()
      name = nameStr.replace(/\s/g, '')
      if (name === isName) {
        // 获取角色英文名
        const englishNameStr = await element
          .findElement(By.css('img'))
          .getAttribute('data-src')
        englishName = englishNameStr
          .replace('/img/char/', '')
          .replace('_135.png', '')
        const btn = await element.findElements(By.css('a'))
        await driver.executeScript('arguments[0].click();', btn[0])
        break
      }
    }
  } else if (!isName) {
    const nameStr = await arr[index]
      .findElement(By.css('.sea_charname'))
      .getText()
    name = nameStr.replace(/\s/g, '')
    // 获取角色英文名
    const englishNameStr = await arr[index]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    englishName = englishNameStr
      .replace('/img/char/', '')
      .replace('_135.png', '')
    const btn = await arr[index].findElements(By.css('a'))
    await driver.executeScript('arguments[0].click();', btn[0])
  } else {
    return '角色不存在'
  }
}

// 返回角色详情列表
export const returnpage: returnpageType = async (driver, By, falg) => {
  try {
    const arr = await driver.findElements(
      By.css('#custom_html-2>.custom-html-widget>.widget_menu_item')
    )
    const btn = await arr[3].findElements(By.css('a'))
    if (!!falg) {
      await driver.executeScript('arguments[0].click();', btn[0]) // ? 所有角色
    } else {
      await driver.executeScript('arguments[0].click();', btn[1]) // ! 报料角色
    }
  } catch (error) {
    console.log(error)
  }
}

// 爬取业务逻辑
export const crawlsubject: crawlsubjectType<any> = async (driver, By, falg) => {
  try {
    console.log(`开始爬取--${name}--的角色信息`)
    // 获取角色信息
    return await UserNameInfo(driver, By, falg)
  } catch (error) {
    console.log(error)
  }
}

// 更新数据库
export const Updb: UpdbTye<any> = async data => {
  // 查询数据库是否有该角色
  data.map(async (item: any) => {
    let falgeid = ''
    // 查询id
    await new Promise<void>((resolve, reject) => {
      const SQLID = `SELECT identUserID FROM identityuser WHERE username = '${item.username}'`
      db.query(SQLID, (err: any, result: any) => {
        if (err) return console.log(err)
        falgeid = result[0]?.identUserID
        console.log(result)
        resolve()
      })
    })
    // 如果没有则插入如果有则更新
    if (!falgeid) {
      // 一次插入多个数据
      const SQL =
        'insert into identityuser(`username`,`English`,`TitleName`,`TheForces`,`rarity`,`WeaponTypes`,`Uelement`,`LifeOfTheSit`,`voiceNameZ`,`voiceNameR`,`introduce`,`arrange`,`NameCard`) value ?'
      const list = [Object.values(item)]
      // 追加到数据库
      db.query(SQL, [list], (err, results) => {
        if (err) return console.log(err.message)
        console.log(results)
      })
    } else {
      const SQL = `UPDATE identityuser SET introduce='${item.introduce}',voiceNameZ='${item.voiceNameZ}',voiceNameR='${item.voiceNameR}' WHERE identUserID = ${falgeid}`
      db.query(SQL, (err, results) => {
        if (err) return console.log(err.message)
        console.log(results)
      })
    }
  })
}

// 获取角色信息
const UserNameInfo: crawlsubjectType<
  | {
      username: string
      English: string
      TitleName: string
      TheForces: string
      rarity: string
      WeaponTypes: string
      Uelement: string
      LifeOfTheSit: string
      voiceNameZ: string
      voiceNameR: string
      introduce: string
      arrange: string
      NameCard: string
    }
  | undefined
> = async (driver, By, ctx, falg) => {
  try {
    // 元素Arr
    const ElementArr: any = {
      hydro_35: '水',
      pyro_35: '火',
      geo_35: '岩',
      cryo_35: '冰',
      anemo_35: '风',
      electro_35: '雷'
    }

    // 武器类型
    const WeaponTypeArr: any = {
      Sword: '单手剑',
      Claymore: '双手剑',
      Polearm: '长柄武器',
      Bow: '弓',
      Catalyst: '法器'
    }

    // 角色基本信息
    const usenTableArr = await driver.findElements(
      By.css('.wrappercont .item_main_table')
    )
    const useTrArr = await usenTableArr[0].findElements(By.css('tr'))

    // 称号
    const TitleNameTD = await useTrArr[1].findElements(By.css('td'))
    const TitleName = await TitleNameTD[1].getText()

    // 所属势力
    const TheForcesTD = await useTrArr[2].findElements(By.css('td'))
    const TheForces = await TheForcesTD[1].getText()

    // 稀有度
    const rarityTD = await useTrArr[3].findElements(By.css('td'))
    const rarityIndex = await rarityTD[1].findElements(
      By.css('.sea_char_stars_wrap')
    )
    const rarity = [...rarityIndex].length + ''

    // 武器类型
    const WeaponTypeTD = await useTrArr[4].findElements(By.css('td'))
    const WeaponTypeKye = await WeaponTypeTD[1].getText()
    const WeaponTypes = WeaponTypeArr[WeaponTypeKye]

    // 元素
    const ElementTD = await useTrArr[5].findElements(By.css('td'))
    const ELementStr = await ElementTD[1]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    const ELementKey = ELementStr.replace(
      /\/img\/icons\/element\//g,
      ''
    ).replace(/\.png/g, '')
    const Uelement = ElementArr[ELementKey]

    // 命之坐
    const LifeOfTheSitTD = await useTrArr[7].findElements(By.css('td'))
    const LifeOfTheSit = await LifeOfTheSitTD[1].getText()

    // 中午声优
    const voiceNameZTD = await useTrArr[8].findElements(By.css('td'))
    const voiceNameZ = await voiceNameZTD[1].getText()

    // 日文声优
    const voiceNameRTD = await useTrArr[9].findElements(By.css('td'))
    const voiceNameR = await voiceNameRTD[1].getText()

    // 人物描述
    const introduceTD = await useTrArr[12].findElements(By.css('td'))
    const introduce = await introduceTD[1].getText()

    // 特殊料理
    let arrange = ''
    try {
      const specialArr = await driver.findElements(
        By.xpath('//*[@class="wrappercont"]/table[5]/tbody/tr[1]/td[2]/a')
      )
      arrange = await specialArr[0].getText()
    } catch (error) {
      arrange = await driver
        .findElement(
          By.xpath('//*[@class="wrappercont"]/table[4]/tbody/tr[1]/td[2]/a')
        )
        .getText()
    }

    // 角色卡片
    const NameCardArr = await driver.findElements(
      By.xpath('//*[@class="wrappercont"]/table[3]/tbody/tr[1]/td[2]/a')
    )
    const NameCard = await NameCardArr[0].getText()

    return Promise.resolve({
      username: name,
      English: englishName,
      TitleName,
      TheForces,
      rarity,
      WeaponTypes,
      Uelement,
      LifeOfTheSit,
      voiceNameZ,
      voiceNameR,
      introduce,
      arrange,
      NameCard
    })
  } catch (error) {
    console.log(error)
  }
}
