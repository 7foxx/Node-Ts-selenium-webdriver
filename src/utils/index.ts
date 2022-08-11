/*
 * @Author: Any
 * @Date: 2022-05-10 10:53:32
 * @LastEditTime: 2022-05-20 13:10:45
 * @LastEditors: Any
 * @Description: 工具函数
 * @FilePath: \node-ts\src\utils\index.ts
 * 版权声明
 */

/**
 * @description:  将数组分成几段的二维数组
 * @param {any} arr 数组
 * @param {number} row 分成几段
 * @return {any[][]}
 */
export const to2DArray = (arr: any[], row: number): any[][] => {
  if (row <= 1) return arr
  const newArr: any[][] = []
  const len = arr.length
  const col = Math.ceil(len / row)
  for (let i = 0; i < row; i++) {
    newArr[i] = []
    for (let j = 0; j < col; j++) {
      arr[i * col + j] && (newArr[i][j] = arr[i * col + j])
    }
  }
  return newArr
}

/**
 * @description:  将数组每段分成几个的二维数组
 * @param {any} arr 数组
 * @param {number} n 每段分成几个
 * @return {any[][]}
 */
export const to2DArray2 = (arr: any[], n: number): any[][] => {
  const result: any[][] = []
  let temp: any[] = []
  for (let i = 0; i < arr.length; i++) {
    temp.push(arr[i])
    if (temp.length === n) {
      result.push(temp)
      temp = []
    }
  }
  if (temp.length) {
    result.push(temp)
  }
  return result
}

/**
 * @description: 判断是否为JSON对象
 * @param {string} str
 * @return {boolean}
 */
export const isJSON = (str: string): boolean => {
  if (typeof str === 'string') {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }
  return false
}
