/*
 * @Author: Any
 * @Date: 2022-04-24 21:58:58
 * @LastEditTime: 2022-06-05 20:32:13
 * @LastEditors: Any
 * @Description: Honeyhunterworld 单个爬取
 * @FilePath: \node-ts\src\controller\Crawl\Honeyhunterworld\selenium.ts
 * 版权声明
 */
import selenium from 'selenium-webdriver'
import { seleniumType } from './type'
import { Errors, Success } from '@/utils/response'
const { Builder, By } = selenium

/**
 * @description:爬虫框架
 * @param {*} data
 * @param {*} index
 */
export const TheCrawlerMethod: seleniumType = async (data, ctx, index) => {
  await new Promise((resolve, reject) => {
    try {
      // 爬取网页地址
      let url = '' as string
      if (!!data?.isAll) {
        //? 所有
        url = data.url + data.IS_URL
      } else {
        //! 爆料
        url = data.UPurl + data.IS_URL
      }
      // 获取一个浏览器
      const driver = new Builder().forBrowser('chrome').build()
      // 打开网页
      driver.get(url)
      // 所有元素数量
      let RoedAlls: number = 0
      // 元素计数器
      let idindex = 0
      ;(async () => {
        // 如果传入 索引则只执行一次
        if (!!index) {
          RoedAlls = 1
          idindex = index
        } else if (data.isName) {
          RoedAlls = 1
          idindex = 1
        } else {
          // 所有元素数量
          RoedAlls = await data.getDataNum(driver, By)
        }
        if (!RoedAlls) {
          // 关闭浏览器
          driver.quit()
          Errors(ctx, '所有元素数量不能为空')
          resolve('所有元素数量不能为空')
          return
        }
        // 开始爬取
        strt(idindex)
      })()

      // 存储数据
      const UPdataAll: any[] = []

      // 爬取主函数
      async function strt(i: number) {
        // 等待
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            console.log('已进入详情页')
            res()
          }, 3000)
        })
        // 获取元素 按钮
        const getDataBtnErr = await data.getDataBtn(
          driver,
          By,
          i,
          data.isAll,
          data.isName
        )
        //  判断中通是否有错误
        if (typeof getDataBtnErr === 'string') {
          // 关闭浏览器
          driver.quit()
          Errors(ctx, getDataBtnErr)
          resolve(getDataBtnErr)
          return
        }
        
        // 等待
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            console.log('开始爬取信息')
            res()
          }, 3000)
        })

        // 模块业务逻辑-------
        const UPdata = await data.crawlsubject(
          driver,
          By,
          data.isAll,
          data.IS_URL,
          data.isName
        )

        UPdataAll.push(UPdata)

        // 爬虫成功跳转 页面
        const returnpageErr = await data.returnpage(
          driver,
          By,
          data.isAll,
          data.IS_URL
        )
        //  判断中通是否有错误
        if (typeof returnpageErr === 'string') {
          // 关闭浏览器
          driver.quit()
          resolve(returnpageErr)
          Errors(ctx, returnpageErr)
          return
        }
        // 递归爬取
        if (i < RoedAlls - 1) {
          ++idindex
          strt(idindex)
        } else {
          console.log('数据爬取成功-------')
          // 关闭当前一个窗口
          // driver.close()
          // 关闭浏览器
          driver.quit()
          if (data.iupDB) {
            //!更新数据库
            console.log('--------开始更新数据库--------')
            await data.Updb(UPdataAll)
          }
          Success(ctx, UPdataAll)
          resolve('数据爬取成功')
          return
        }
      }
    } catch (error) {
      Errors(ctx, error)
      resolve('数据爬取失败')
    }
  })
}
