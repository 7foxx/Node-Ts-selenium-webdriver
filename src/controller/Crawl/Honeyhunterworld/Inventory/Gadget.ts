/*
 * @Author: Any
 * @Date: 2022-05-09 21:46:56
 * @LastEditTime: 2022-05-09 22:35:37
 * @LastEditors: Any
 * @Description: 小道具
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\Inventory\Gadget.ts
 * 版权声明
 */
import selenium from 'selenium-webdriver'
import download from 'download'
import db from '@/db'
import {
  crawlsubjectType,
  getDataBtnType,
  getDataNumType,
  returnpageType,
  UpdbTye
} from '../type'
const { Builder, By } = selenium

// 已出大世界生物
export const url = 'https://genshin.honeyhunterworld.com/db/animal/?lang=CHS'
// 爆料大世界生物
export const UPurl = 'https://genshin.honeyhunterworld.com/db/animal/?lang=CHS'
// 获取所有角色数量
export const getDataNum: getDataNumType = async (driver, By) => {
  return 1
}
let srt: any = []
// 获取角色按钮
export const getDataBtn: getDataBtnType = async (
  driver,
  By,
  index,
  isAll,
  isName
) => {
  srt = [
    'https://genshin.honeyhunterworld.com/db/item/i_3001/?lang=CHS',
    'https://genshin.honeyhunterworld.com/db/item/i_3002/?lang=CHS',
    'https://genshin.honeyhunterworld.com/db/item/i_3003/?lang=CHS'
  ]
}

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
