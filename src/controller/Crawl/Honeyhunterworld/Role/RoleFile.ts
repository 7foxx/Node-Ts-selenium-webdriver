/*
 * @Author: Any
 * @Date: 2022-04-24 21:46:20
 * @LastEditTime: 2022-06-05 21:21:38
 * @LastEditors: Any
 * @Description: 爬取外网角色资源
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\Role\RoleFile.ts
 * 版权声明
 */
import download from 'download'
import fs from 'fs'
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
    .catch((err:any) => err)
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
  try {
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
  } catch (error) {
    return '获取角色按钮失败'
  }
}

// 返回角色详情列表
export const returnpage: returnpageType = async (driver, By ,falg) => {
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
    return '返回角色详情列表失败'
  }
}

// 爬取业务逻辑
export const crawlsubject: crawlsubjectType<any> = async (
  driver,
  By,
  falg
) => {
  // 下载技能与名座图片
  await downloadSkill(driver, By, falg)
  // 下载角色图片
  return await downloadInof(driver, By, falg)
}

// 更新数据库
export const Updb: UpdbTye<any> = async (data) => {
  console.log(data)
  if (!!data[0]) {
    data.map((item: any) => {
      const sql = `UPDATE identityuser SET 
      usrLogoURL = '${item.usrLogoURL}',
      rolesLIstURL = '${item.rolesLIstURL}',
      BoutiqueURL = '${item.BoutiqueURL}',
      HeadLogoURL = '${item.HeadLogoURL}',
      paintingURL = '${item.paintingURL}'
       WHERE username = '${item.username}'`

      db.query(sql, (err, res) => {
        if (err) return console.log(err)
        console.log(res)
      })
    })
  }
}

// 下载角色卡片
const downloadInof: crawlsubjectType<
  | {
      username: string
      usrLogoURL: string
      rolesLIstURL: string
      BoutiqueURL: string
      HeadLogoURL: string
      paintingURL: string
    }
  | undefined
> = async (driver, By, falg) => {
  // 稀有度
  const usenTableArr = await driver.findElements(
    By.css('.wrappercont .item_main_table')
  )
  const useTrArr = await usenTableArr[0].findElements(By.css('tr'))
  const rarityTD = await useTrArr[3].findElements(By.css('td'))
  const rarityIndex = await rarityTD[1].findElements(
    By.css('.sea_char_stars_wrap')
  )
  const rarity = [...rarityIndex].length + ''

  // 获取角色iD
  let identUserID = null
  await new Promise<void>((resolve, reject) => {
    db.query(
      `SELECT identUserID FROM identityuser  WHERE username = '${name}'`,
      (err, data) => {
        if (err) return resolve()
        identUserID = data[0].identUserID
        resolve()
      }
    )
  })
  if (!identUserID) return

  // 获取 uList 图
  const uListArr = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/table[4]/tbody/tr[1]/td[1]/div/img')
  )
  const uList =
    `https://genshin.honeyhunterworld.com` +
    (await uListArr[0].getAttribute('data-src'))
  // 下载
  await download(uList, `./src/assets/AssetsDate/人物/uList`, {
    filename: `${identUserID}.png`
  }).catch(err => err)

  // 获取 LOGO 图
  const LOGOArr = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/div[6]/div/div[1]/a')
  )
  const LOGO = await LOGOArr[0].getAttribute('href')
  // 下载
  await download(LOGO, `./src/assets/AssetsDate/人物/LOGO`, {
    filename: `${identUserID}-${rarity}-${name}.png`
  }).catch(err => err)

  // 获取 head 图
  const headArr = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/div[6]/div/div[2]/a')
  )
  const head = await headArr[0].getAttribute('href')
  // 下载
  await download(head, `./src/assets/AssetsDate/人物/head`, {
    filename: `${identUserID}.png`
  }).catch(err => err)

  // 获取 VerticalCard2 图
  const VerticalCard2Arr = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/div[6]/div/div[3]/a')
  )
  const VerticalCard2 = await VerticalCard2Arr[0].getAttribute('href')
  // 下载
  await download(VerticalCard2, `./src/assets/AssetsDate/人物/VerticalCard2`, {
    filename: `${identUserID}.png`
  }).catch(err => err)

  // 获取 Boutique 图
  const BoutiqueArr = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/div[6]/div/div[4]/a')
  )
  const Boutique = await BoutiqueArr[0].getAttribute('href')
  // 下载
  await download(Boutique, `./src/assets/AssetsDate/人物/Boutique`, {
    filename: `${identUserID}.png`
  }).catch(err => err)

  return Promise.resolve({
    username: name,
    usrLogoURL: `/人物/LOGO/${identUserID}-${rarity}-${name}.png`,
    rolesLIstURL: `/人物/uList/${identUserID}.png`,
    BoutiqueURL: `/人物/Boutique/${identUserID}.png`,
    HeadLogoURL: `/人物/head/${identUserID}.png`,
    paintingURL: `/人物/painting/${identUserID}.pngg`
  })
}

// 下载技能与命坐
const downloadSkill: crawlsubjectType<any> = async (driver, By, falg) => {
  // A E Q Shift
  let Attack_A: { name: string; url: string; type: string } = {
    name: '',
    type: '',
    url: ''
  }
  let Attack_E: { name: string; url: string; type: string } = {
    name: '',
    type: '',
    url: ''
  }
  let Attack_Q: { name: string; url: string; type: string } = {
    name: '',
    type: '',
    url: ''
  }
  let Attack_Shift: { name: string; url: string; type: string } = {
    name: '',
    type: '',
    url: ''
  }
  if (!falg) {
    // 普攻
    const Attack_A_Arr = await driver.findElements(
      By.xpath('//*[@class="wrappercont"]/div[4]/table[3]/tbody/tr[1]/td')
    )

    const Attack_A_name = await Attack_A_Arr[1].getText()
    const Attack_A_Url = await Attack_A_Arr[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    Attack_A = {
      name: Attack_A_name,
      type: 'S',
      url: Attack_A_Url
    }

    // E 技能
    const Attack_E_Arr = await driver.findElements(
      By.xpath('//*[@class="wrappercont"]/div[4]/table[4]/tbody/tr[1]/td')
    )
    const Attack_E_name = await Attack_E_Arr[1].getText()
    const Attack_E_Url = await Attack_E_Arr[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    Attack_E = {
      name: Attack_E_name,
      type: 'E',
      url: Attack_E_Url
    }
    // 判断是否有 SHift 技能
    const isShift = await driver.findElements(
      By.css('.data_cont_wrapper>.item_main_table')
    )

    if (isShift.length > 6) {
      // Shift 技能
      const Attack_Shift_Arr = await driver.findElements(
        By.xpath('//*[@class="wrappercont"]/div[4]/table[5]/tbody/tr[1]/td')
      )
      const Attack_Shift_name = await Attack_Shift_Arr[1].getText()
      const Attack_Shift_Url = await Attack_Shift_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')
      Attack_Shift = {
        name: Attack_Shift_name,
        type: 'Shift',
        url: Attack_Shift_Url
      }
      // Q 技能
      const Attack_Q_Arr = await driver.findElements(
        By.xpath('//*[@class="wrappercont"]/div[4]/table[6]/tbody/tr[1]/td')
      )
      const Attack_Q_name = await Attack_Q_Arr[1].getText()
      const Attack_Q_Url = await Attack_Q_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')
      Attack_Q = {
        name: Attack_Q_name,
        type: 'Q',
        url: Attack_Q_Url
      }
    } else {
      // Q 技能
      const Attack_Q_Arr = await driver.findElements(
        By.xpath('//*[@class="wrappercont"]/div[4]/table[5]/tbody/tr[1]/td')
      )
      const Attack_Q_name = await Attack_Q_Arr[1].getText()
      const Attack_Q_Url = await Attack_Q_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')
      Attack_Q = {
        name: Attack_Q_name,
        type: 'Q',

        url: Attack_Q_Url
      }
    }
  } else {
    console.log(falg);
    // 普攻
    const Attack_A_Arr = await driver.findElements(
      By.xpath('//*[@id="live_data"]/table[3]/tbody/tr[1]/td')
    )
    const Attack_A_name = await Attack_A_Arr[1].getText()
    const Attack_A_Url = await Attack_A_Arr[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    Attack_A = {
      name: Attack_A_name,
      type: 'S',

      url: Attack_A_Url
    }
    // E 技能
    const Attack_E_Arr = await driver.findElements(
      By.xpath('//*[@id="live_data"]/table[4]/tbody/tr[1]/td')
    )
    const Attack_E_name = await Attack_E_Arr[1].getText()
    const Attack_E_Url = await Attack_E_Arr[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    Attack_E = {
      name: Attack_E_name,
      type: 'E',
      url: Attack_E_Url
    }
    // 判断是否有 SHift 技能
    const isShift = await driver.findElements(
      By.css('#live_data .item_main_table')
    )
    if (isShift.length > 6) {
      // Shift 技能
      const Attack_Shift_Arr = await driver.findElements(
        By.xpath('//*[@id="live_data"]/table[5]/tbody/tr[1]/td')
      )
      const Attack_Shift_name = await Attack_Shift_Arr[1].getText()
      const Attack_Shift_Url = await Attack_Shift_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')

      Attack_Shift = {
        name: Attack_Shift_name,
        type: 'Shift',
        url: Attack_Shift_Url
      }
      // Q 技能
      const Attack_Q_Arr = await driver.findElements(
        By.xpath('//*[@id="live_data"]/table[6]/tbody/tr[1]/td')
      )
      const Attack_Q_name = await Attack_Q_Arr[1].getText()
      const Attack_Q_Url = await Attack_Q_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')
      Attack_Q = {
        name: Attack_Q_name,
        type: 'Q',
        url: Attack_Q_Url
      }
    } else {
      // Q 技能
      const Attack_Q_Arr = await driver.findElements(
        By.xpath('//*[@id="live_data"]/table[5]/tbody/tr[1]/td')
      )
      const Attack_Q_name = await Attack_Q_Arr[1].getText()
      const Attack_Q_Url = await Attack_Q_Arr[0]
        .findElement(By.css('img'))
        .getAttribute('data-src')
      Attack_Q = {
        name: Attack_Q_name,
        type: 'Q',
        url: Attack_Q_Url
      }
    }
  }

  // 技能
  const Attack = [Attack_A, Attack_E, Attack_Shift, Attack_Q]
  // 被动与命坐-------------------------------------------------------------------------------
  const passiveSkill_ConstellationsArr: {
    name: string
    url: string
    type: string
  }[] = []

  // 被动技能
  let passiveSkillArr = []
  if (!falg) {
    // 被动技能
    passiveSkillArr = await driver.findElements(
      By.xpath(
        `/\/*[@class="data_cont_wrapper"]/table[@class="item_main_table"][5]/tbody/tr`
      )
    )
  } else {
    const index = name === '莫娜' || name === '神里绫华' ? 8 : 7
    // 被动技能
    passiveSkillArr = await driver.findElements(
      By.xpath(`/\/*[@id="live_data"]/table[${index}]/tbody/tr`)
    )
  }
  // 筛选奇数
  const passiveSkill = [...passiveSkillArr].filter(
    (item, index) => index % 2 === 0
  )
  for (let o = 0; o < passiveSkill.length; o++) {
    const element = passiveSkill[o]
    const skillNametd = await element.findElements(By.css('td'))
    const skillName = await skillNametd[1]?.getText()
    const skillURL = await skillNametd[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')

    passiveSkill_ConstellationsArr.push({
      name: skillName,
      type: `P_${o}`,
      url: skillURL
    })
  }

  // 命之坐
  let ConstellationsArr = []
  if (!falg) {
    // 被动技能
    ConstellationsArr = await driver.findElements(
      By.xpath(
        `/\/*[@class="data_cont_wrapper"]/table[@class="item_main_table"][6]/tbody/tr`
      )
    )
  } else {
    const index = name === '莫娜' || name === '神里绫华' ? 9 : 8
    // 被动技能
    ConstellationsArr = await driver.findElements(
      By.xpath(`/\/*[@id="live_data"]/table[${index}]/tbody/tr`)
    )
  }
  // 筛选奇数
  const Constellations = [...ConstellationsArr].filter(
    (item, index) => index % 2 === 0
  )
  for (let o = 0; o < Constellations.length; o++) {
    const element = Constellations[o]
    const skillNametd = await element.findElements(By.css('td'))
    const Constellationsname = await skillNametd[1]?.getText()
    const ConstellationsURL = await skillNametd[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    passiveSkill_ConstellationsArr.push({
      name: Constellationsname,
      type: `C_${o}`,
      url: ConstellationsURL
    })
  }
  const nerOBJ = [...Attack, ...passiveSkill_ConstellationsArr]

  console.log(nerOBJ)

  // 下载
  for (let i = 0; i < nerOBJ.length; i++) {
    const element = nerOBJ[i]
    if (element?.url.length > 0) {
      await download(
        'https://genshin.honeyhunterworld.com' + element?.url,
        `./src/assets/AssetsDate/AttackTalents/${name}`,
        {
          filename: `${element?.type}-${element?.name}.png`
        }
      ).catch(err => err)
    }
  }
}
