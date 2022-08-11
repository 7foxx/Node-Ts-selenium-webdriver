/*
 * @Author: Any
 * @Date: 2022-05-09 20:01:18
 * @LastEditTime: 2022-05-09 21:15:20
 * @LastEditors: Any
 * @Description: 大世界生物
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\LivingBeings\Wildlife.ts
 * 版权声明
 */
import download from 'download'
import db from '@/db'
import {
  crawlsubjectType,
  getDataBtnType,
  getDataNumType,
  returnpageType,
  UpdbTye
} from '../type'

// 已出大世界生物
export const url = 'https://genshin.honeyhunterworld.com/db/animal/?lang=CHS'
// 爆料大世界生物
export const UPurl = 'https://genshin.honeyhunterworld.com/db/animal/?lang=CHS'
// 获取所有角色数量
export const getDataNum: getDataNumType = async (driver, By) => {
  return 1
}

// 获取角色按钮
export const getDataBtn: getDataBtnType = async (
  driver,
  By,
  index,
  isAll,
  isName
) => {}

// 返回角色详情列表
export const returnpage: returnpageType = async (driver, By, falg) => {}

// 爬取业务逻辑
export const crawlsubject: crawlsubjectType<any> = async (
  driver,
  By,
  ctx,
  falg,
  isName
) => {
  const arrAll = await driver.findElements(By.css('.char_sea_cont'))
  let arr: any = []
  for (let i = 0; i < arrAll.length; i++) {
    const element = arrAll[i]
    const Arr = await element.findElements(By.css('a'))
    const Swname: any = await Arr[1].getText()
    const urlstr = await Arr[0]
      .findElement(By.css('img'))
      .getAttribute('data-src')
    const url = urlstr.replace('_70', '')
    let iconUrl = ''
    try {
      const icon = await Arr[2]
        ?.findElement(By.css('img'))
        .getAttribute('data-src')
      if (icon) {
        iconUrl = icon.replace('_35.png', '')
      }
    } catch (error) {
      continue
    }
    const textsrt = await element
      .findElement(By.css('.sea_dung_desc'))
      .getAttribute('outerHTML')
    const text = textsrt
      .replace('<div class="sea_char_mat_cont sea_dung_desc">', '')
      .replace('</div>', '')
    const obj = {
      name: Swname,
      url,
      iconUrl,
      text
    }
    arr.push(obj)
    if (!!isName && Swname === isName) {
      arr = [obj]
      break
    }
  }
  // 下载
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i]
    download(
      'https://genshin.honeyhunterworld.com' + element.url,
      `./src/assets/AssetsDate/LivingBeings/Wildlife`,
      {
        filename: `${element.name}.png`
      }
    )
    arr[i].url = `/LivingBeings/Wildlife${element.name}.png`
  }
  return arr
}

// 更新数据库
export const Updb: UpdbTye<any> = async ArrLise => {
  if (ArrLise?.length) {
    // 一次插入多个数据
    const SQL = 'insert into Wildlife(`name`,`url`,`iconUrl`,`text`) value ?'
    const list = ArrLise[0].map(
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
