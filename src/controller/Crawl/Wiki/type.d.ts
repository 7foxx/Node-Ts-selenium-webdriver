import { Context } from 'koa'

// 角色
export type WikiType = (
  isUserName: string,
  iupDB: boolean,
  ctx: Context
) => Promise<any>
