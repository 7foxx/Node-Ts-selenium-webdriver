/*
 * @Author: Any
 * @Date: 2022-05-08 18:11:42
 * @LastEditTime: 2022-05-09 20:01:39
 * @LastEditors: Any
 * @Description: 圣遗物
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\ArtifactSet\ArtifactSet.ts
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

// 已出圣遗物
export const url = 'https://genshin.honeyhunterworld.com/db/artifact/?lang=CHS'
// 爆料圣遗物
export const UPurl =
  'https://genshin.honeyhunterworld.com/db/artifact/?lang=CHS'
// 圣遗物名
let name: string = ''

// 稀有度
let Quality: number[] = []

// 获取所有角色数量
export const getDataNum: getDataNumType = async (driver, By) => {
  const lengarr = await driver
    .findElements(By.css('.art_stat_table_new'))
    .catch((err: any) => err)
  const leng = []
  for (let i = 0; i < lengarr.length; i++) {
    const element = lengarr[i]
    const tr = await element.findElements(By.css('tr'))
    // 删除表头
    tr.shift()
    const index: null[] = []
    const newTR = tr.reduce((accB: any, itemB: any, iB: number) => {
      if (iB % 2 != 0) {
        index.push(null)
        accB[index.length - 1].push(itemB)
      } else {
        accB.push([itemB])
      }
      return accB
    }, [])
    leng.push(...newTR)
  }
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
    const lengarr = await driver
      .findElements(By.css('.art_stat_table_new'))
      .catch((err: any) => err)
    // 按钮连接
    const trArr = []
    for (let i = 0; i < lengarr.length; i++) {
      const element = lengarr[i]
      const tr = await element.findElements(By.css('tr'))
      // 删除表头
      tr.shift()
      const index: null[] = []
      const newTR = tr.reduce((accB: any, itemB: any, iB: number) => {
        if (iB % 2 != 0) {
          index.push(null)
          accB[index.length - 1].push(itemB)
        } else {
          accB.push([itemB])
        }
        return accB
      }, [])
      trArr.push(...newTR)
    }
    // 筛选出a连接
    const btnarr = trArr.map(e => e[0])
    // 按钮
    let btn = null
    if (!!isName) {
      for (let i = 0; i < btnarr.length; i++) {
        const element = btnarr[i]
        const btnttdarr = await element.findElements(By.css('td'))
        // 名称
        name = await btnttdarr[2].findElement(By.css('a')).getText()
        // 稀有度
        const Qualityarr = await btnttdarr[3].findElements(
          By.css('.star_art_wrap_cont')
        )
        const Q1arr = await Qualityarr[0].findElements(By.css('div'))
        const Q2arr = await Qualityarr[1].findElements(By.css('div'))
        Quality = [Q1arr.length, Q2arr.length]
        if (isName === name) {
          btn = await btnttdarr[2].findElement(By.css('a'))
          break
        }
      }
    } else if (!isName) {
      const btnttdarr = await btnarr[index].findElements(By.css('td'))
      btn = await btnttdarr[2].findElement(By.css('a'))
      name = await btnttdarr[2].findElement(By.css('a')).getText()
      // 稀有度
      const Qualityarr = await btnttdarr[3].findElements(
        By.css('.star_art_wrap_cont')
      )
      const Q1arr = await Qualityarr[0].findElements(By.css('div'))
      const Q2arr = await Qualityarr[1].findElements(By.css('div'))
      Quality = [Q1arr.length, Q2arr.length]
    }
    if (btn) {
      await driver.executeScript('arguments[0].click();', btn)
    } else {
      return '按钮为空'
    }
  } catch (error) {
    return '获取按钮失败'
  }
}

// 返回角色详情列表
export const returnpage: returnpageType = async (driver, By, falg) => {
  try {
    const btn = await driver.findElement(
      By.xpath('//*[@id="custom_html-2"]/div/a[2]')
    )
    await driver.executeScript('arguments[0].click();', btn)
    // await driver.executeScript(
    //   `window.open("https://genshin.honeyhunterworld.com/db/art/family/a_15007/?lang=CHS","_self")`
    // )
  } catch (error) {
    return '返回角色详情列表失败'
  }
}

// 爬取业务逻辑
export const crawlsubject: crawlsubjectType<any> = async (
  driver,
  By,
  ctx,
  falg
) => {
  // 黑名单
  const Blacklist = ['祭火之人', '祭水之人', '祭雷之人', '祭冰之人', '祭风之人']
  // 两件套
  const PieceBonus2 = await driver
    .findElement(
      By.xpath(`/\/*[@class="wrappercont"]/table[1]/tbody/tr[4]/td[2]`)
    )
    .getText()
  let PieceBonus4 = ''
  if (!Blacklist.includes(name)) {
    // 四件套
    PieceBonus4 = await driver
      .findElement(
        By.xpath(`/\/*[@class="wrappercont"]/table[1]/tbody/tr[5]/td[2]`)
      )
      .getText()
  }
  // 下载图片
  let ArtifactSetObj = {}
  if (Blacklist.includes(name)) {
    try {
      if (name !== '祭风之人') {
        // 头
        const Circlet = await driver.findElement(
          By.xpath(
            `/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[2]/td[1]/a`
          )
        )
        const Circleturl = await Circlet.findElement(
          By.css('img')
        )?.getAttribute('data-src')
        const Circletname = await Circlet.getText()
        const url = Circleturl.replace(/_35|_50/, '')
        download(
          `https://genshin.honeyhunterworld.com/${url}`,
          `./src/assets/AssetsDate/ArtifactSet`,
          {
            filename: `${Circletname}.png`
          }
        )
        ArtifactSetObj = {
          Flower: ``,
          Plume: ``,
          Sands: ``,
          Goblet: ``,
          Circlet: `/ArtifactSet${Circletname}.png`
        }
      }
    } catch (error) {}
  } else if (!Blacklist.includes(name)) {
    try {
      // 花
      const Flower = await driver.findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[2]/td[1]/a`)
      )
      const Flowerurl = await Flower.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Flowername = await Flower.getText()
      // 羽毛
      const Plume = await driver.findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[3]/td[1]/a`)
      )
      const Plumeurl = await Plume.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Plumename = await Plume.getText()
      // 沙漏
      const Sands = await driver.findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[4]/td[1]/a`)
      )
      const Sandsurl = await Sands.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Sandsname = await Sands.getText()
      // 杯子
      const Goblet = await driver.findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[5]/td[1]/a`)
      )
      const Gobleturl = await Goblet.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Gobletname = await Goblet.getText()
      // 头
      const Circlet = await driver.findElement(
        By.xpath(`/\/*[@class="wrappercont"]/div[3]/table/tbody/tr[6]/td[1]/a`)
      )
      const Circleturl = await Circlet.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Circletname = await Circlet.getText()
      // 下载
      const dowarr = [
        [Flowerurl, Flowername],
        [Plumeurl, Plumename],
        [Sandsurl, Sandsname],
        [Gobleturl, Gobletname],
        [Circleturl, Circletname]
      ]
      for (let i = 0; i < dowarr.length; i++) {
        const element = dowarr[i]
        const url = element[0].replace(/_35|_50/, '')
        const name = element[1]
        download(
          `https://genshin.honeyhunterworld.com/${url}`,
          `./src/assets/AssetsDate/ArtifactSet`,
          {
            filename: `${name}.png`
          }
        )
      }
      ArtifactSetObj = {
        Flower: `/ArtifactSet${Flowername}.png`,
        Plume: `/ArtifactSet${Plumename}.png`,
        Sands: `/ArtifactSet${Sandsname}.png`,
        Goblet: `/ArtifactSet${Gobletname}.png`,
        Circlet: `/ArtifactSet${Circletname}.png`
      }
    } catch (error) {
      // 如果出错这是爆料
      // 花
      const Flower = await driver.findElement(
        By.xpath(`//*[@class="wrappercont"]/table[2]/tbody/tr[1]/td/a`)
      )
      const Flowerurl = await Flower.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Flowername = await Flower.getText()
      // 羽毛
      const Plume = await driver.findElement(
        By.xpath(`//*[@class="wrappercont"]/table[2]/tbody/tr[2]/td/a`)
      )
      const Plumeurl = await Plume.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Plumename = await Plume.getText()
      // 沙漏
      const Sands = await driver.findElement(
        By.xpath(`//*[@class="wrappercont"]/table[2]/tbody/tr[3]/td/a`)
      )
      const Sandsurl = await Sands.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Sandsname = await Sands.getText()
      // 杯子
      const Goblet = await driver.findElement(
        By.xpath(`//*[@class="wrappercont"]/table[2]/tbody/tr[4]/td/a`)
      )
      const Gobleturl = await Goblet.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Gobletname = await Goblet.getText()
      // 头
      const Circlet = await driver.findElement(
        By.xpath(`//*[@class="wrappercont"]/table[2]/tbody/tr[5]/td/a`)
      )
      const Circleturl = await Circlet.findElement(By.css('img')).getAttribute(
        'data-src'
      )
      const Circletname = await Circlet.getText()
      // 下载
      const dowarr = [
        [Flowerurl, Flowername],
        [Plumeurl, Plumename],
        [Sandsurl, Sandsname],
        [Gobleturl, Gobletname],
        [Circleturl, Circletname]
      ]
      for (let i = 0; i < dowarr.length; i++) {
        const element = dowarr[i]
        const url = element[0].replace(/_35|_50/, '')
        const name = element[1]
        download(
          `https://genshin.honeyhunterworld.com/${url}`,
          `./src/assets/AssetsDate/ArtifactSet`,
          {
            filename: `${name}.png`
          }
        )
      }
      ArtifactSetObj = {
        Flower: `/ArtifactSet${Flowername}.png`,
        Plume: `/ArtifactSet${Plumename}.png`,
        Sands: `/ArtifactSet${Sandsname}.png`,
        Goblet: `/ArtifactSet${Gobletname}.png`,
        Circlet: `/ArtifactSet${Circletname}.png`
      }
    }
  }

  // 副本
  const DropsInArr = await driver.findElements(
    By.xpath(`//*[@class="wrappercont"]/table[3]/tbody/tr`)
  )
  const DropsIn = []
  for (let i = 0; i < DropsInArr.length; i++) {
    const element = DropsInArr[i]
    const test = await element.getText()
    DropsIn.push(test)
  }

  // 大世界掉了
  let DropsOut = []
  try {
    const DropsOutArr = await driver.findElements(
      By.xpath(`//*[@class="wrappercont"]/table[4]/tbody/tr`)
    )
    for (let i = 0; i < DropsOutArr.length; i++) {
      const element = DropsOutArr[i]
      const test = await element.getText()
      DropsOut.push(test)
    }
  } catch (error) {}

  console.log({
    ArtifactName: name,
    Quality: JSON.stringify(Quality),
    PieceBonus2,
    PieceBonus4,
    DropsIn: JSON.stringify(DropsIn),
    DropsOut: JSON.stringify(DropsOut),
    ArtifactSetObj: JSON.stringify(ArtifactSetObj)
  })
  return {
    ArtifactName: name,
    Quality: JSON.stringify(Quality),
    PieceBonus2,
    PieceBonus4,
    DropsIn: JSON.stringify(DropsIn),
    DropsOut: JSON.stringify(DropsOut),
    ArtifactSetObj: JSON.stringify(ArtifactSetObj)
  }
}

// 更新数据库
export const Updb: UpdbTye<any> = async ArrLise => {
  if (ArrLise?.length) {
    // 一次插入多个数据
    const SQL =
      'insert into artifactset(`ArtifactName`,`Quality`,`PieceBonus2`,`PieceBonus4`,`DropsIn`,`DropsOut`,`ArtifactSetObj`) value ?'
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
