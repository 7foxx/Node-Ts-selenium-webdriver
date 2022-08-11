/*
 * @Author: Any
 * @Date: 2022-05-06 20:55:50
 * @LastEditTime: 2022-05-08 13:16:56
 * @LastEditors: Any
 * @Description: 获取武器
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\Weapons\WeaponsInfo.ts
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
import download from 'download'

// 材料路由 key
export const WeaponsType: any = [
  {
    // 单手剑
    Sword: 'db/weapon/sword/?lang=CHS'
  },
  // 双手剑
  {
    Claymore: 'db/weapon/claymore/?lang=CHS'
  },
  // 长柄武器
  {
    Polearm: 'db/weapon/polearm/?lang=CHS'
  },
  // 弓
  {
    Bow: 'db/weapon/bow/?lang=CHS'
  },
  // 法器
  {
    Catalyst: 'db/weapon/catalyst/?lang=CHS'
  }
]

// 武器类型 KEY
let WeaponsTypeKEY: string = ''

// 武器名称
let WeaponsName = ''

const WeaponsTypeValue: {
  [key: string]: string
} = {
  Sword: '单手剑',
  Claymore: '双手剑',
  Polearm: '长柄武器',
  Bow: '弓',
  Catalyst: '法器'
}

// 已有武器
export const url = 'https://genshin.honeyhunterworld.com/'

// 爆料武器
export const UPurl = 'https://genshin.honeyhunterworld.com/'

// 获取所有武器数量
export const getDataNum: getDataNumType = async (driver, By) => {
  const leng = await driver
    .findElements(By.xpath('//*[@class="wrappercont"]/div[2]/table/tbody/tr'))
    .catch((err: any) => err)
  return leng.length
}

// 获取武器按钮
export const getDataBtn: getDataBtnType = async (
  driver,
  By,
  index,
  isAll,
  isname
) => {
  try {
    let isAlltr = []
    // 所有武器
    if (isAll) {
      isAlltr = await driver.findElements(
        By.xpath(`//*[@class="wrappercont"]/div[2]/table/tbody/tr`)
      )
      // 删除表头
      isAlltr.shift()
    } else if(!!isname) {
      // 更新武器
      const arr = await driver.findElements(By.css('.scrollwrapper'))
      isAlltr = await arr[1].findElements(By.css('tr'))
      // 删除表头
      isAlltr.shift()
    } else {
      return '请输入武器名称'
    }
    // 按钮
    let btn = null
    // 如果有制定武器名称
    if (!!isname) {
      for (let i = 0; i < isAlltr.length; i++) {
        const element = isAlltr[i]
        const arrtd = await element.findElements(By.css('td'))
        const name = await arrtd[2].findElement(By.css('a')).getText()
        if (isname === name) {
          // 武器名称
          WeaponsName = name
          btn = await arrtd[2].findElement(By.css('a'))
          break
        }
      }
    } else if (!isname) {
      const arrtd = await isAlltr[index].findElements(By.css('td'))
      btn = await arrtd[2].findElement(By.css('a'))
      // 武器名称
      WeaponsName = await btn.getText()
    } else {
      return '武器不存在'
    }
    if (btn) {
      await driver.executeScript('arguments[0].click();', btn)
    } else {
      return '按钮为空'
    }
  } catch (error) {
    return '获取武器按钮失败'
  }
}

// 返回详情列表
export const returnpage: returnpageType = async (driver, By, falg, IS_URL) => {
  // 获取武器类型
  let btn = null
  let isIndex: number = 1
  // 筛选武器类型 key
  for (let i = 0; i < WeaponsType.length; i++) {
    const item = WeaponsType[i]
    if (Object.values(item).includes(IS_URL)) {
      isIndex = i + 1
      btn = await driver.findElements(
        By.xpath(`/\/*[@id="custom_html-2"]/div/div[6]/a[${isIndex}]/div/span`)
      )
    }
  }
  if (btn) {
    await driver.executeScript('arguments[0].click();', btn[0])
  } else {
    return '返回详情列表失败'
  }
}

// 爬取业务逻辑
export const crawlsubject: crawlsubjectType<any> = async (
  driver,
  By,
  falg,
  IS_URL
) => {
  for (let i = 0; i < WeaponsType.length; i++) {
    const item = WeaponsType[i]
    if (Object.values(item).includes(IS_URL)) {
      WeaponsTypeKEY = Object.keys(item)[0]
    }
  }
  // 获取全部武器信息
  return await getWeaponsInfo(driver, By, falg)
}

// 更新数据库
export const Updb: UpdbTye<any> = async ArrLise => {
  if (ArrLise?.length) {
    // 一次插入多个数据
    const SQL =
      'insert into Weapons(`WeaponsName`,`WeaponsTypeValue`,`rarity`,`WeaponsAttack`,`WeaponsAttr`,`WeaponsAttrInit`,`WeaponsAbility`,`WeaponsAbilityDesc`,`WeaponsDesc`,`WeaponsDesc2`,`WeaponsBack`,`WeaponsInfo`,`ImgUrl`) value ?'
    const list = ArrLise.map(
      (item: { [s: string]: unknown } | ArrayLike<unknown>) =>
        Object.values(item)
    )
    // 追加到数据库
    db.query(SQL, [list], (err, results) => {
      if (err) return console.log(err.message)
      console.log(results)
    })
  }
}

const getWeaponsInfo: crawlsubjectType<any> = async (driver, By, ctx, falg) => {
  try {
    // 获取稀有度
    const WeaponsRare = await driver.findElements(
      By.xpath(
        `//*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[2]/td[2]/div`
      )
    )
    const rarity = WeaponsRare.length

    // 获取出生攻击力
    const WeaponsAttack = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[3]/td[2]`)
      )
      ?.getText()

    // 获取附加属性
    const WeaponsAttr = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[4]/td[2]`)
      )
      ?.getText()

    // 获取初始属性
    const WeaponsAttrInit = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[5]/td[2]`)
      )
      ?.getText()

    // 特殊(被动)能力
    const WeaponsAbility = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[6]/td[2]`)
      )
      ?.getText()

    // 特殊(被动)能力描述
    const WeaponsAbilityDesc = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[7]/td[2]`)
      )
      ?.getText()

    // 装备描述
    const WeaponsDesc = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/table[1]/tbody/tr[8]/td[2]`)
      )
      ?.getText()

    // 精练描述
    const WeaponsDesc2 = []
    for (let i = 2; i <= 6; i++) {
      const item = await driver
        .findElement(
          By.xpath(
            `/\/*[@class="wrappercont"]/div[4]/table[3]/tbody/tr[${i}]/td[2]`
          )
        )
        ?.getText()
      const test = item.replace(/\s/g, '')
      WeaponsDesc2.push(test)
    }

    // 背景介绍
    let WeaponsBack = ''
    try {
      const WeaponsBackstr = await driver
        .findElement(
          By.xpath(`/\/*[@class="wrappercont"]/table[2]/tbody/tr/td/div`)
        )
        ?.getAttribute('outerHTML')
      WeaponsBack = WeaponsBackstr.replace(
        '<div class="story_container"><br>',
        ''
      ).replace('</div>', '')
    } catch (error) {}

    // 下载图片
    // icon
    const iconstr: string = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/div/div/div[1]/a`)
      )
      .getAttribute('href')
    const icon: string = `/AssetsDate/Weapons/${WeaponsTypeKEY}/icon_${WeaponsName}.png`
    await download(
      iconstr,
      `./src/assets/AssetsDate/Weapons/${WeaponsTypeKEY}`,
      {
        filename: `icon_${WeaponsName}.png`
      }
    )

    // AwakenedIcon
    const AwakenedIconstr: string = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/div/div/div[2]/a`)
      )
      .getAttribute('href')
    const AwakenedIcon: string = `/AssetsDate/Weapons/${WeaponsTypeKEY}/AwakenedIcon_${WeaponsName}.png`
    await download(
      AwakenedIconstr,
      `./src/assets/AssetsDate/Weapons/${WeaponsTypeKEY}`,
      {
        filename: `AwakenedIcon_${WeaponsName}.png`
      }
    )

    // GachaIcon
    const GachaIconstr: string = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[4]/div/div/div[3]/a`)
      )
      .getAttribute('href')
    const GachaIcon: string = `/AssetsDate/Weapons/${WeaponsTypeKEY}/GachaIcon_${WeaponsName}.png`
    await download(
      GachaIconstr,
      `./src/assets/AssetsDate/Weapons/${WeaponsTypeKEY}`,
      {
        filename: `GachaIcon_${WeaponsName}.png`
      }
    )

    // 武器详细属性
    const WeaponsInfotr = await driver.findElements(
      By.xpath(`//*[@class="wrappercont"]/div[4]/table[2]/tbody/tr`)
    )

    const WeaponsInfo: any = {
      Level: [],
      BaseAtk: [],
      none: [],
      AscensionMaterials: []
    }

    for (let i = 1; i < WeaponsInfotr.length; i++) {
      const element = WeaponsInfotr[i]
      const item = await element.findElements(By.css('td'))
      const Level = await item[0]?.getText()
      const BaseAtk = await item[1]?.getText()
      const none = await item[2]?.getText()
      let AscensionMaterials: { urlid: string; name: string }[] = []
      const Leveltyoearr = ['20+', '40+', '50+', '60+', '70+', '80+']
      if (Leveltyoearr.includes(Level)) {
        const AscensionMaterialsnumber = await item[3]?.getText()
        const arr = AscensionMaterialsnumber.split('x')
        // 删除第一个空元素
        arr.shift()
        const AscensionMaterialsImg = await item[3]?.findElements(By.css('img'))
        await AscensionMaterialsImg?.map(async (item: any, i: number) => {
          const test = await item.getAttribute('data-src')
          const urlid = test.replace('_35.png', '')
          AscensionMaterials.push({
            name: arr[i],
            urlid
          })
        })
      }
      WeaponsInfo.Level.push(Level)
      WeaponsInfo.BaseAtk.push(BaseAtk)
      WeaponsInfo.none.push(none)
      WeaponsInfo.AscensionMaterials.push(AscensionMaterials)
    }

    console.log({
      WeaponsName,
      WeaponsTypeValue: WeaponsTypeValue[WeaponsTypeKEY],
      rarity,
      WeaponsAttack,
      WeaponsAttr,
      WeaponsAttrInit,
      WeaponsAbility,
      WeaponsAbilityDesc,
      WeaponsDesc,
      WeaponsDesc2: JSON.stringify(WeaponsDesc2),
      WeaponsBack,
      WeaponsInfo: JSON.stringify(WeaponsInfo),
      ImgUrl: JSON.stringify({ icon, AwakenedIcon, GachaIcon })
    })
    return {
      WeaponsName,
      WeaponsTypeValue: WeaponsTypeValue[WeaponsTypeKEY],
      rarity,
      WeaponsAttack,
      WeaponsAttr,
      WeaponsAttrInit,
      WeaponsAbility,
      WeaponsAbilityDesc,
      WeaponsDesc,
      WeaponsDesc2: JSON.stringify(WeaponsDesc2),
      WeaponsBack,
      WeaponsInfo: JSON.stringify(WeaponsInfo),
      ImgUrl: JSON.stringify({ icon, AwakenedIcon, GachaIcon })
    }
  } catch (error) {}
}
