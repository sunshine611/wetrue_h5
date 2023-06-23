import shajs from 'sha.js'
import http from '@/util/request.js'
import pinia from "@/stores/store";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore(pinia);

export const mixinUtils = {
  //获取后端信息
  getConfigInfo() {
    return new Promise((resolve) => {
      http.post('/Config/info').then( (res) => {
        userStore.setConfigInfo(res.data)
        resolve(res.data)
      })
    })
  },
  //加密密码
  cryptoPassword(password) {
    let first,
      second,
      third,
      fourth,
      fifth = ''
    first = shajs('sha256')
      .update('WeTrue' + password)
      .digest('hex')
    second = ''
    for (let i = 0; i < first.length; i++) {
      second += first[i]
      i++
    }
    third = shajs('sha256').update(second).digest('hex')
    fourth = ''
    for (let i = 0; i < third.length; i++) {
      i++
      fourth += third[i]
    }
    fifth = new Buffer(fourth).toString('base64')
    return fifth
  },
  //苹果刘海屏顶部兼容性调整
  iphoneTop() {
    let iphones = [
      'iPhone X',
      'iPhone Xs',
      'iPhone XS Max',
      'iPhone Xr',
      'iPhone 11',
      'iPhone 11 Pro',
      'iPhone 11 Pro Max',
    ]
    let result
    uni.getSystemInfo({
      success(res) {
        if (iphones.includes(res.model)) {
          result = true
        } else {
          result = false
        }
      },
    })
    return result
  },
  //ipfs转纯CID
  ipfsUrltoCid(value) {
    return value.replace(
      'ipfs://',
      'https://dweb.link/ipfs/' // use default ipfs gateway to display images
    )
  }

}
