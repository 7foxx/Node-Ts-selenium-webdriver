import jwt from 'jsonwebtoken'

/**
 * @description: jwt 生成 token
 * @param {any} data
 * @return {*}
 */
export function sign<T>(data: T | any): string {
  return jwt.sign(data, 'secret ', { expiresIn: '1h' })
}

/**
 * @description: jwt 认证 解密
 * @param {string} token
 * @return {*}
 */
export function verify(token: string): any {
  try {
    const decoded = jwt.verify(token, 'secret ')
    return {
      token: decoded,
      error: null
    }
  } catch (error) {
    return {
      token: null,
      error
    }
  }
}
