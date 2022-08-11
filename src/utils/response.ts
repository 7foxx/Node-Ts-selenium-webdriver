/*
 * @Author: Any
 * @Date: 2022-04-25 10:20:52
 * @LastEditTime: 2022-06-05 19:46:05
 * @LastEditors: Any
 * @Description: 统一消息处理
 * @FilePath: \node-ts\src\utils\response.ts
 * 版权声明
 */
import { Context } from 'koa'

/**
 * @description: 成功
 * @param {Context} ctx
 * @param {T} data
 */
export async function Success<T>(ctx: Context, data?: T) {
  ctx.body = {
    code: 200,
    data,
    message: 'success',
    falg: true
  }
}

/**
 * @description: 失败
 * @param {Context} ctx
 * @param {T} message
 */
export async function Errors<T>(ctx: Context, message: T, code: number = 401) {
  ctx.body = {
    code,
    message,
    falg: false
  }
}
