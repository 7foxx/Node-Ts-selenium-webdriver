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
export const WeaponAscensionMaterialTpye: any = [
  {
    // 武器突破素材 (Primary)大世界掉落
    Primary: 'db/item/weapon-ascension-material-primary/?lang=CHS'
  },
  // 武器突破素材 (Secondary)副本掉落
  {
    Secondary: 'db/item/weapon-ascension-material-secondary-material/?lang=CHS'
  }
]

// 材料名称 KEY
let roleAscensionMaterialTypeKEY: string = ''

// 已有材料
export const url = 'https://genshin.honeyhunterworld.com/'

// 爆料材料
export const UPurl = 'https://genshin.honeyhunterworld.com/'

// 获取所有材料数量
export const getDataNum: getDataNumType = async (driver, By) => {
  const leng = await driver
    .findElements(By.css('.items_wrap>.itemcont'))
    .catch((err: any) => err)
  return leng.length
}

// 获取材料按钮
export const getDataBtn: getDataBtnType = async (
  driver,
  By,
  index,
  isAll,
  isname
) => {
  try {
    // 所有按钮
    const arr = await driver.findElements(By.css('.items_wrap>a'))
    let btn = null
    // 所有材料
    if (isAll && !isname) {
      btn = arr[index]
    } else if (!!isname) {
      // 材料名称
      const arr = await driver.findElements(By.css('.items_wrap .itemname'))
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i]
        const names = await element.getText()
        if (names === isname) {
          btn = arr[i]
          break
        }
      }
    } else {
      return '材料不存在'
    }
    if (btn) {
      await driver.executeScript('arguments[0].click();', btn)
    } else {
      return '按钮为空'
    }
  } catch (error) {
    return '获取材料按钮失败'
  }
}

// 返回详情列表
export const returnpage: returnpageType = async (driver, By, falg, IS_URL) => {
  // 返回按钮
  if (IS_URL) {
    try {
      // 获取材料类型
      const arr = await driver.findElements(
        By.css('.widget_menu_item_scrollable')
      )
      const btn = await arr[4].findElements(By.css('a'))
      let isIndex: string = ''
      // 筛选材料类型 key
      for (let i = 0; i < WeaponAscensionMaterialTpye.length; i++) {
        const item = WeaponAscensionMaterialTpye[i]
        if (Object.values(item).includes(IS_URL)) {
          isIndex = i + ''
        }
      }

      await driver.executeScript('arguments[0].click();', btn[isIndex])
    } catch (error) {
      return '返回详情列表失败'
    }
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
  for (let i = 0; i < WeaponAscensionMaterialTpye.length; i++) {
    const item = WeaponAscensionMaterialTpye[i]
    if (Object.values(item).includes(IS_URL)) {
      roleAscensionMaterialTypeKEY = Object.keys(item)[0]
    }
  }
  // 武器突破素材
  if (roleAscensionMaterialTypeKEY === 'Primary') {
    return await Primary(driver, By, falg)
  }
  // 武器突破素材
  else if (roleAscensionMaterialTypeKEY === 'Secondary') {
    return await Secondary(driver, By, falg)
  }
}

// 更新数据库
export const Updb: UpdbTye<DataType[]> = async ArrLise => {
  if (ArrLise?.length) {
    // 一次插入多个数据
    const SQL =
      'insert into breakthrough(`type`,`typesNAme`,`Rarity`,`ImgURL`,`InGameSlang`,`typesURL`,`Obtained`,`Boosdrop`,`Weeklydrop`,`Description`,`Relation`,`Compound`,`CompoundUp`,`UsedtoAscendWeapon`) value ?'
    const list = ArrLise.map(item => Object.values(item))
    // 追加到数据库
    db.query(SQL, [list], (err, results) => {
      if (err) return console.log(err.message)
      console.log(results)
    })
  }
}

type DataType = {
  type: string
  typesNAme: string
  Rarity: string
  ImgURL: string
  InGameSlang: string
  typesURL: string
  Obtained: string | ['测试']
  Boosdrop: string | null
  Weeklydrop: string | null
  Description: string | null
  Relation: string | null
  Compound: string | null
  CompoundUp: string | null
  UsedtoAscendWeapon: string | null
}
// 武器突破素材 大世界掉落
const Secondary: crawlsubjectType<DataType | []> = async (
  driver,
  By,
  ctx,
  falg
) => {
  // 获取材料名称
  const JewelsNAme = await driver
    .findElement(By.css('.wrappercont .custom_title'))
    .getText()
  //  获取 tr
  const JewelsTR = await driver.findElements(
    By.css('.wrappercont .item_main_table tr')
  )

  // 获取稀有的
  const RarityTR = await JewelsTR[1].findElements(By.css('td'))
  const leng = await RarityTR[1].findElements(By.css('div'))
  const Rarity = leng.length

  // 材料用途
  const InGameSlangArr = await JewelsTR[2].findElements(By.css('td'))
  const InGameSlang = await InGameSlangArr[1].getText()

  // 材料描述
  const DescriptionTR = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/table[1]/tbody/tr[4]/td[2]/div')
  )
  const Descriptiontest = await DescriptionTR[0]?.getAttribute('outerHTML')
  const Description = Descriptiontest?.replace(
    /<div class="story_container" style="font-size: 14px; margin-top: 0px; margin-left: 10px">/g,
    ''
  ).replace(/<\/div>/g, '')

  // 获取材料图片标识
  const URLtd = await JewelsTR[0].findElements(By.css('td'))
  const URLstr = await URLtd[0]
    .findElement(By.css('img'))
    .getAttribute('data-src')
  const JewelsURL = URLstr.replace(/\.png/, '')

  // 下载图片
  download(
    `https://genshin.honeyhunterworld.com/${URLstr}`,
    `./src/assets/AssetsDate/AscensionMaterial/Primary`,
    {
      filename: `${JewelsNAme}.png`
    }
  )
  const tableArr = await driver.findElements(
    By.css('.wrappercont .add_stat_table')
  )
  // 获取方式
  let Obtained: string[] | ['测试'] = []
  const ObtainedTRArr = await tableArr[0]?.findElements(By.css('tr'))
  if (ObtainedTRArr?.length) {
    const ObtainedFilter = []
    for (let i = 0; i < ObtainedTRArr.length; i++) {
      const test = await ObtainedTRArr[i].findElement(By.css('td')).getText()
      ObtainedFilter.push(test)
    }
    Obtained = ObtainedFilter.filter(item => !!item.length)
  } else {
    // 如果没有获取方式则为测试材料
    Obtained = ['测试']
  }

  // BOSS 掉落
  let Boosdropindex = 2
  if (Rarity == 3) Boosdropindex = 3
  const BoosdropTR = await tableArr[Boosdropindex]?.findElements(By.css('tr'))
  let Boosdrop: string[] | null = []
  if (BoosdropTR?.length) {
    const BoosdropFilter = []
    for (let i = 0; i < BoosdropTR.length; i++) {
      const test = await BoosdropTR[i]?.findElement(By.css('td')).getText()
      BoosdropFilter.push(test)
    }
    Boosdrop = BoosdropFilter.filter(item => !!item.length)
  }

  // 合成下级
  const CompoundTRArr = await tableArr[1]?.findElements(By.css('tr'))
  const Compound = CompoundTRArr?.length
    ? await CompoundTRArr[0]?.findElement(By.css('td')).getText()
    : null
  // 合成上级
  let CompoundUp = null
  if (Rarity == 3) {
    const CompoundUpTRArr = await tableArr[2]?.findElements(By.css('tr'))
    CompoundUp = CompoundUpTRArr?.length
      ? await CompoundUpTRArr[0]?.findElement(By.css('td')).getText()
      : null
  }

  // 关联角色
  const RelationArr = await driver.findElements(
    By.css('.wrappercont  div.add_stat_cont img')
  )
  const Relation = []
  for (let i = 0; i < RelationArr.length; i++) {
    const text = await RelationArr[i]?.getAttribute('data-src')
    const arr = text.split('/')
    const name = arr[3].replace('.png', '')
    Relation.push(name)
  }

  // 关联武器
  const UsedtoAscendWeaponTR = await tableArr[
    tableArr.length - 1
  ]?.findElements(By.css('tr'))
  let UsedtoAscendWeapon: string[] | null = []
  if (UsedtoAscendWeaponTR?.length) {
    const WeeklydropFilter = []
    for (let i = 0; i < UsedtoAscendWeaponTR.length; i++) {
      const test = await UsedtoAscendWeaponTR[i]
        ?.findElement(By.css('td'))
        .getText()
      WeeklydropFilter.push(test)
    }
    UsedtoAscendWeapon = WeeklydropFilter.filter(item => !!item.length)
  }

  console.log({
    type: roleAscensionMaterialTypeKEY,
    typesNAme: JewelsNAme,
    Rarity,
    ImgURL: `/AscensionMaterial/Primary/${JewelsNAme}.png`,
    InGameSlang,
    typesURL: JewelsURL,
    Obtained: JSON.stringify(Obtained),
    Boosdrop: JSON.stringify(Boosdrop),
    Weeklydrop: JSON.stringify([]),
    Description: JSON.stringify(Description),
    Relation: JSON.stringify(Relation),
    Compound,
    CompoundUp,
    UsedtoAscendWeapon: JSON.stringify(UsedtoAscendWeapon)
  })

  return {
    type: roleAscensionMaterialTypeKEY,
    typesNAme: JewelsNAme,
    Rarity,
    ImgURL: `/AscensionMaterial/Primary/${JewelsNAme}.png`,
    InGameSlang,
    typesURL: JewelsURL,
    Obtained: JSON.stringify(Obtained),
    Boosdrop: JSON.stringify(Boosdrop),
    Weeklydrop: JSON.stringify([]),
    Description: JSON.stringify(Description),
    Relation: JSON.stringify(Relation),
    Compound,
    CompoundUp,
    UsedtoAscendWeapon: JSON.stringify(UsedtoAscendWeapon)
  }
}
// 武器突破素材 副本掉落
const Primary: crawlsubjectType<DataType> = async (driver, By, ctx, falg) => {
  // 获取材料名称
  const JewelsNAme = await driver
    .findElement(By.css('.wrappercont .custom_title'))
    .getText()
  //  获取 tr
  const JewelsTR = await driver.findElements(
    By.css('.wrappercont .item_main_table tr')
  )

  // 获取稀有的
  const RarityTR = await JewelsTR[1].findElements(By.css('td'))
  const leng = await RarityTR[1].findElements(By.css('div'))
  const Rarity = leng.length

  // 材料用途
  const InGameSlangArr = await JewelsTR[2].findElements(By.css('td'))
  const InGameSlang = await InGameSlangArr[1].getText()

  // 材料描述
  const DescriptionTR = await driver.findElements(
    By.xpath('//*[@class="wrappercont"]/table[1]/tbody/tr[4]/td[2]/div')
  )
  const Descriptiontest = await DescriptionTR[0]?.getAttribute('outerHTML')
  const Description = Descriptiontest?.replace(
    /<div class="story_container" style="font-size: 14px; margin-top: 0px; margin-left: 10px">/g,
    ''
  ).replace(/<\/div>/g, '')

  // 获取材料图片标识
  const URLtd = await JewelsTR[0].findElements(By.css('td'))
  const URLstr = await URLtd[0]
    .findElement(By.css('img'))
    .getAttribute('data-src')
  const JewelsURL = URLstr.replace(/\.png/, '')

  // 下载图片
  download(
    `https://genshin.honeyhunterworld.com/${URLstr}`,
    `./src/assets/AssetsDate/AscensionMaterial/Secondary`,
    {
      filename: `${JewelsNAme}.png`
    }
  )
  const tableArr = await driver.findElements(
    By.css('.wrappercont .add_stat_table')
  )
  // 获取方式
  let Obtained: string[] | ['测试'] = []
  let Obtainedindex = 1
  if (Rarity == 3 || Rarity == 4) Obtainedindex = 2
  const ObtainedTRArr = await tableArr[Obtainedindex]?.findElements(
    By.css('tr')
  )
  if (ObtainedTRArr?.length) {
    const ObtainedFilter = []
    for (let i = 0; i < ObtainedTRArr.length; i++) {
      const test = await ObtainedTRArr[i].findElement(By.css('td')).getText()
      ObtainedFilter.push(test)
    }
    Obtained = ObtainedFilter.filter(item => !!item.length)
  } else {
    // 如果没有获取方式则为测试材料
    Obtained = ['测试']
  }

  // 合成下级
  const CompoundTRArr = await tableArr[0]?.findElements(By.css('tr'))
  const Compound = CompoundTRArr?.length
    ? await CompoundTRArr[0]?.findElement(By.css('td')).getText()
    : null
  // 合成上级
  let CompoundUp = null
  if (Rarity == 3 || Rarity == 4) {
    const CompoundUpTRArr = await tableArr[1]?.findElements(By.css('tr'))
    CompoundUp = CompoundUpTRArr?.length
      ? await CompoundUpTRArr[0]?.findElement(By.css('td')).getText()
      : null
  }

  // BOSS 掉落
  let Boosdropindx = 1
  if (Rarity == 3 || Rarity == 4) Boosdropindx = 2
  const BoosdropTR = await tableArr[Boosdropindx]?.findElements(By.css('tr'))
  let Boosdrop: string[] | null = []
  if (BoosdropTR?.length) {
    const BoosdropFilter = []
    for (let i = 0; i < BoosdropTR.length; i++) {
      const test = await BoosdropTR[i]?.findElement(By.css('td')).getText()
      BoosdropFilter.push(test)
    }
    Boosdrop = BoosdropFilter.filter(item => !!item.length)
  }

  // 关联武器
  const UsedtoAscendWeaponTR = await tableArr[
    tableArr.length - 1
  ]?.findElements(By.css('tr'))
  let UsedtoAscendWeapon: string[] | null = []
  if (UsedtoAscendWeaponTR?.length) {
    const WeeklydropFilter = []
    for (let i = 0; i < UsedtoAscendWeaponTR.length; i++) {
      const test = await UsedtoAscendWeaponTR[i]
        ?.findElement(By.css('td'))
        .getText()
      WeeklydropFilter.push(test)
    }
    UsedtoAscendWeapon = WeeklydropFilter.filter(item => !!item.length)
  }

  console.log({
    type: roleAscensionMaterialTypeKEY,
    typesNAme: JewelsNAme,
    Rarity,
    ImgURL: `/AscensionMaterial/Secondary/${JewelsNAme}.png`,
    InGameSlang,
    typesURL: JewelsURL,
    Obtained: JSON.stringify(Obtained),
    Boosdrop: JSON.stringify(Boosdrop),
    Weeklydrop: null,
    Description: JSON.stringify(Description),
    Relation: JSON.stringify([]),
    Compound,
    CompoundUp,
    UsedtoAscendWeapon: JSON.stringify(UsedtoAscendWeapon)
  })

  return {
    type: roleAscensionMaterialTypeKEY,
    typesNAme: JewelsNAme,
    Rarity,
    ImgURL: `/AscensionMaterial/Secondary/${JewelsNAme}.png`,
    InGameSlang,
    typesURL: JewelsURL,
    Obtained: JSON.stringify(Obtained),
    Boosdrop: JSON.stringify(Boosdrop),
    Weeklydrop: null,
    Description: JSON.stringify(Description),
    Relation: JSON.stringify([]),
    Compound,
    CompoundUp,
    UsedtoAscendWeapon: JSON.stringify(UsedtoAscendWeapon)
  }
}
