/*
 * @Author: Any
 * @Date: 2022-05-19 12:42:40
 * @LastEditTime: 2022-05-19 14:55:30
 * @LastEditors: Any
 * @Description:
 * @FilePath: \node-ts\src\controller\Crawl\GenshinImpactWiki\Role\jj.ts
 * 版权声明
 */
const download = require('download')
const arr = [
  `https://static.wikia.nocookie.net/gensin-impact/images/2/27/Outfit_Summertime_Sparkle_Portrait.png/revision/latest?cb=20210715021028`
]

arr.map(item => {
  download(item, '../Role')
})
