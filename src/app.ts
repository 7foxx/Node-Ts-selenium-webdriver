/*
 * @Author: Any
 * @Date: 2022-04-18 11:12:55
 * @LastEditTime: 2022-04-24 23:15:04
 * @LastEditors: Any
 * @Description: app 启动
 * @FilePath: \node-ts\src\app.ts
 * 版权声明
 */
import Koa from 'koa'
import { YsRouter, CrawlRouter } from '@/router'
import cors from 'koa2-cors'
import bodyParser from 'koa-bodyparser'
import { Server } from 'http'

const app = new Koa()

// 跨域
app.use(cors())

//要解析body里面的json或者urlencoded数据，要依赖第三方库koa-bodyparser
app.use(bodyParser())

// 路由中间件
app.use(YsRouter.routes())
// 爬虫
app.use(CrawlRouter.routes())

const run = (port: any): Server => {
  return app.listen(port)
}

export default run
