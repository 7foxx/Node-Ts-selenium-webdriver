/*
 * @Author: Any
 * @Date: 2022-05-12 13:22:10
 * @LastEditTime: 2022-06-05 10:59:59
 * @LastEditors: Any
 * @Description: 分布爬取主函数
 * @FilePath: \node-ts\src\controller\Crawl\distribution.ts
 * 版权声明
 */
import { to2DArray } from '@/utils'
import { Errors, Success } from '@/utils/response'
import { Context } from 'koa'
import selenium from 'selenium-webdriver'
const { Builder, By } = selenium

type DistributionType = (data: DistributionData, ctx: Context) => Promise<void>

export type DistributionFn = (
  data: DistributionData,
  ctx: Context
) => Promise<Boolean>

type DistributionData = {
  isName: string | string[]
  path: string
  isAll: boolean
  iupDB: boolean
}

// 分布爬取路由
export const Distribution: DistributionType = async (data, ctx) => {
  try {
    const { isName, path, isAll, iupDB } = data
    const falgFn = await require(path).default(data)
    if (falgFn) {
      Success(ctx, '爬取成功')
    } else {
      Errors(ctx, '爬取失败')
    }
  } catch (error) {
    console.log(error)
    Errors(ctx, '服务器异常')
  }
}

// 分布爬取主函数
export type distributionUtil = (
  Url: string,
  blackList: string[],
  isName: string | string[],
  Theselector: {
    lectorFn: string | 'css' | 'xpath'
    lector: string
  },
  IsNumIndex: number,
  mainFn: MainfnT,
  isEngName?: string[]
) => Promise<boolean>

export type MainfnT = (
  newArr: any[][],
  driver: selenium.WebDriver,
  timer: NodeJS.Timer
) => Promise<Boolean>

/**
 * @description: 分布爬取公用函数
 * @param {string} Url 网站
 * @param {string} blackList 黑名单
 * @param {string} Theselector 选择器
 * @param {bumber}  IsNumIndex 数组切割成几份
 * @param {Function}  mainFn 主体函数
 * @param {string[]} isEngName 是否有英文名
 * @return {any[][]} 返回二维数组
 */
export const distributionUtilFunction: distributionUtil = async (
  Url,
  blackList,
  isName,
  Theselector,
  IsNumIndex = 0,
  mainFn,
  isEngName = []
) => {
  return await new Promise<boolean>(async (resolve, reject) => {
    console.log(isName)

    const { lectorFn, lector } = Theselector
    // 获取一个浏览器
    const driver = new Builder().forBrowser('chrome').build()
    // 先获取所有英文名称
    let EnglishName: string[] = isEngName
    // 打开网页
    driver.get(Url)
    // 获取角色数量
    let getAllBtn: any[] = []
    if (lectorFn === 'css') {
      getAllBtn = await driver.findElements(By.css(lector))
    } else if (lectorFn === 'xpath') {
      getAllBtn = await driver.findElements(By.xpath(lector))
    }
    console.log(getAllBtn.length, '元素总个数')
    // 清理浏览器缓存
    await driver.manage().deleteAllCookies()
    // 每隔10秒清理一次缓存
    const timer = setInterval(async () => {
      await driver.manage().deleteAllCookies()
      console.log('清理缓存')
    }, 10000)
    // 所有角色名称
    const newArrAll: any[] = []
    for (let i = 0; i < getAllBtn.length; i++) {
      const element = getAllBtn[i]
      const names = await element.getText()
      newArrAll.push(names)
      getAllBtn[i] = {
        element,
        name: names,
        EnglishName: EnglishName?.length ? EnglishName[i] : null
      }
      console.log(names);
    }
    // 过滤黑名单
    if (!isName?.length) {
      getAllBtn = getAllBtn.filter(item => !blackList.includes(item.name))
    }
    // 过滤数组
    let newArr: any[][] = []
    // 如果有制定名称
    if (typeof isName === 'string' && isName.length > 0) {
      try {
        const values = getAllBtn.find(
          items => items.name === isName || items.name.search(isName) > -1
        )
        newArr = [[values]]
      } catch (error) {
        console.log('名称不存在')
        // 失败
        resolve(false)
      }
    } else if (Array.isArray(isName) && isName.length > 0) {
      try {
        const arr: any = []
        isName.map(item => {
          const values = getAllBtn.find(
            items => items.name === item || items.name.search(item) > -1
          )
          if (!!item.length) {
            arr.push(values)
          }
        })
        // 将数组切割成几份
        newArr = to2DArray(arr, IsNumIndex)
      } catch (error) {
        console.log('名称不存在')
        // 失败
        resolve(false)
      }
    } else {
      // 将数组切割成几份
      newArr = to2DArray(getAllBtn, IsNumIndex)
    }
    newArr = newArr.filter(item => item.length > 0)
    // 调用主体函数
    const falg = (await mainFn(newArr, driver, timer)) as boolean

    if (falg) {
      resolve(falg)
    }
  })
}
