/*
 * @Author: Any
 * @Date: 2022-04-25 14:38:19
 * @LastEditTime: 2022-06-05 20:40:00
 * @LastEditors: Any
 * @Description:  YSGW 原神官网网页
 * @FilePath: \node-ts\src\controller\Crawl\MiHoYo\YsGw\role.ts
 * 版权声明
 */

import axios from 'axios'
import download from 'download'
import db from '@/db'
import { YsDataTyoe } from '../type'
import { Errors, Success } from '@/utils/response'
import { MysqlError } from 'mysql'

type ResUserList = {
  title: string
  start_time: string
  voiceNameZ: string
  voiceNameR: string
  synopsis: string
  newItemArr: any[]
}

export const YsData: YsDataTyoe = async (
  { isName, isrRarity, isChanne, isDownload, iupDB },
  ctx
) => {
  await new Promise<string>(async (resolve, reject) => {
    // 角色id
    let unameID: number | null = null
    // 查询角色名称与id
    const getuser = async () => {
      return await new Promise((req, rej) => {
        const sql = `select identUserID,username from identityuser`
        db.query(sql, (err, res) => {
          if (err) return console.log(err)
          req(JSON.parse(JSON.stringify(res)))
        })
      })
    }
    // 获取数据库角色id与name
    const resUser = (await getuser()) as {
      identUserID: number
      username: string
    }[]
    const isLenght = resUser.length
    // console.log(resUser)
    // 原神官网 接口
    // 稻妻 channelId = 324
    // 离月 channelId = 151
    // 蒙德 channelId = 150
    async function getlist(num: 324 | 151 | 150) {
      const {
        data: {
          data: { list }
        }
      } = await axios.get(
        `https://ys.mihoyo.com/content/ysCn/getContentList?pageSize=20&pageNum=1&order=asc&channelId=${num}`
      )

      return list.reduce((acc: ResUserList[], item: any) => {
        acc.push({
          title: item.title,
          start_time: item.start_time,
          voiceNameZ: item.ext[5].value,
          voiceNameR: item.ext[6].value,
          synopsis: item.ext[7].value,
          newItemArr: [...item.ext.slice(8), item.ext[1]]
        })
        return acc
      }, [])
    }

    // 下载资源
    function getfun(diqu: string, unum: 150 | 324 | 151, name: string) {
      getlist(unum).then(async res => {
        const NewRES = res.filter((item: any) => item.title === name)
        await Promise.all(
          NewRES.map((list: ResUserList) => {
            list.newItemArr.forEach((item, i) => {
              const str = item.arrtName.split('-')[1]
              const uname = item.value[0].name
              let unameID = null
              for (let index = 0; index < resUser.length; index++) {
                if (resUser[index].username === list.title) {
                  unameID = resUser[index].identUserID
                }
              }
              // download(item.value[0].url, `./${diqu}/${unameID}-${list.title}`, {
              //   filename: str + '-' + uname
              // })
              download(
                item.value[0].url,
                `./src/assets/AssetsDate/人物/UserAssetsNum/${
                  unameID ? unameID : isLenght
                }`,
                {
                  filename: str + '-' + uname
                }
              )
            })
          })
        )
        console.log('下载完毕')
        return NewRES
      })
    }

    const obj = await getlist(isChanne)
    const NewOBJ = obj.filter((item: any) => item.title === isName)
    // 在官网下载指定角色的资源
    isDownload && getfun('UserAssetsNum', isChanne, isName)
    if (!NewOBJ.length) {
      resolve('数据获取失败')
      Errors(ctx, `没有该-${isName}-角色`)
      return
    }

    // 数据整理函数
    function getUserInfo(reqs: ResUserList[]) {
      const userlist = []
      for (let i = 0; i < reqs.length; i++) {
        const AssetsUrlAll = reqs[i].newItemArr.map(item => {
          const str = item.arrtName.split('-')[1]
          const uname = item.value[0].name
          const name = str + '-' + uname
          for (let index = 0; index < resUser.length; index++) {
            if (resUser[index].username === reqs[i].title) {
              unameID = resUser[index].identUserID
            }
          }
          // return `https://peak-1302703244.cos.ap-nanjing.myqcloud.com/人物/UserAssets/${unameID}-${reqs[i].title}/${name}`
          return `/人物/UserAssetsNum/${unameID}/${name}`
        })
        // console.log(AssetsUrlAll);
        // const toudata = udata.reduce((acc, val) => {
        //   if (val.username === reqs[i].title) {
        //     ;(acc['usrLogoURL'] = val.usrLogoURL),
        //       (acc['rolesLIstURL'] = val.rolesLIstURL),
        //       (acc['paintingURL'] = val.paintingURL),
        //       (acc['BoutiqueURL'] = val.BoutiqueURL),
        //       (acc['HeadLogoURL'] = val.HeadLogoURL),
        //       (acc['PCpicturePNG'] = val.picturePNG)
        //   }
        //   return acc
        // }, {})
        // console.log(toudata)
        const toudata = {
          rarity: isrRarity,
          username: isName,
          // usrLogoURL: `/人物/LOGO/${isLenght}-${isrRarity}-${isName}.png`,
          // rolesLIstURL: `/人物/uList/${isLenght}.png`,
          // paintingURL: `/人物/painting/${isLenght}.png`,
          // BoutiqueURL: `/人物/Boutique/${isLenght}.png`,
          // HeadLogoURL: `/人物/head/${isLenght}.png`,
          PCpicturePNG: `/人物/picturePNG/${unameID}.png`
        }
        userlist.push({
          uanme: reqs[i].title,
          voiceNameZ: reqs[i].voiceNameZ,
          voiceNameR: reqs[i].voiceNameR,
          synopsis: reqs[i].synopsis,
          ...toudata,
          MCpicturePNG: AssetsUrlAll.splice(AssetsUrlAll.length - 2, 1)[0],
          linesPNG: AssetsUrlAll.splice(0, 1)[0],
          AudioUrlAll: (function () {
            AssetsUrlAll.splice(AssetsUrlAll.length - 1)
            return JSON.stringify(AssetsUrlAll)
            // return AssetsUrlAll
          })()
        })
      }
      console.log(userlist)
      // 追加数据库
      // 一次更新多个数据
      if (iupDB) {
        userlist.map(itemv => {
          // console.log(itemv);
          const SQL = `UPDATE identityuser set voiceNameZ='${itemv.voiceNameZ}',voiceNameR='${itemv.voiceNameR}',synopsis='${itemv.synopsis}',PCpicturePNG='${itemv['PCpicturePNG']}',MCpicturePNG='${itemv.MCpicturePNG}',linesPNG='${itemv.linesPNG}',AudioUrlAll='${itemv.AudioUrlAll}' WHERE username='${itemv.uanme}'`
          // 更新到数据库
          db.query(SQL, (err, results) => {
            if (err) return Errors(ctx, '数据库更新失败')
            console.log(results)
          })
        })
      }
    }
    if (NewOBJ.length) {
      getUserInfo(NewOBJ)
    }
    NewOBJ.length ? resolve('数据获取完毕') : resolve('数据获取失败')
    // 爬取成功
    Success(ctx, `数据获取完毕`)
  })
}
