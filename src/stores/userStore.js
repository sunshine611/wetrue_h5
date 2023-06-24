import { defineStore } from "pinia";
import { getStore, setStore } from '@/util/service'
import { nodeUrl } from '@/config/config.js'
import Request from "luch-request";
const http = new Request();

export const useUserStore = defineStore('userStore', {
    state: () => {
        return {
          token: getStore('token') || null, //钱包地址
          password: null, //临时密码
          nodeUrl: getStore('nodeUrl') || nodeUrl, //节点地址
          configInfo: getStore('configInfo') || {}, //后端配置信息
          userInfo: getStore('userInfo') || {}, //用户信息
          keystore: getStore('keystore') || {}, //用户keyStore
          keystoreArr: getStore('keystoreArr') || [], //用户多账户keyStore数组
          client: {}, //主网对象
          thirdPartySource: null, //第三方来源
          language: getStore('language') || 'en', //语言
          networkSetting: getStore('networkSetting') || 'io', //语言
          blacklist: getStore('blacklist') || [], //黑名单
          blacklistState: getStore('blacklistState') || 0, //黑名单状态
        }
    },
    getters: {
      //token:state=>state.user.token,
      //userInfo:state=>state.user.userInfo,
      //configInfo:state=>state.user.configInfo
    },
    actions: {
      //设置多账户
      setKeystoreArr (params) {
        if (this.keystoreArr.length > 0) {
          let isExist = false //不存在
          for (let i = 0; i < this.keystoreArr.length; i++) {
            if (this.keystoreArr[i].public_key == params.public_key) {
              this.keystoreArr[i] = params
              isExist = true //存在
              break
            }
          }
          if (!isExist) {
            //不存在就加上
            this.keystoreArr.push(params)
          }
        } else {
          this.keystoreArr.push(params)
        }
        setStore('keystoreArr', this.keystoreArr)
      },
      //更新多账户
      upKeystoreArr () {
        setStore('keystoreArr', this.keystoreArr)
      },
      //删除或退出某个账户
      deleteKeystoreArr(params) {
        for (let i = 0; i < this.keystoreArr.length; i++) {
          if (this.keystoreArr[i].public_key == params) {
            this.keystoreArr.splice(i, 1)
            break
          }
        }
        if (this.keystore.public_key == params) {
          this.$patch({
            token: null,
            keystore: null,
            userInfo: null,
            configInfo: null,
            password: null,
            client: null,
          })
          setStore('token', null)
          setStore('keystore', {})
          setStore('userInfo', {})
          setStore('configInfo', {})
        }
        setStore('keystoreArr', this.keystoreArr)
        },
      //切换账户
      changeAccount(params) {
        for (let i = 0; i < this.keystoreArr.length; i++) {
          if (this.keystoreArr[i].public_key === params) {
            this.$patch({
              token: this.keystoreArr[i].public_key,
              keystore: this.keystoreArr[i],
              userInfo: {},
              configInfo: {},
              password: null,
              client: {},
            })
            setStore('keystore', this.keystoreArr[i])
            setStore('token', this.keystoreArr[i].public_key)
            setStore('userInfo', {})
            setStore('configInfo', {})
            break
          }
        }
      },
      //设置黑名单状态
      setblacklistState(params) {
        this.blacklistState = params
        setStore("blacklistState", params);
      },
      //设置添加账户到黑名单
      setBlacklist(params) {
        if (this.blacklist.length > 0) {
          let isExist = false //不存在
          for (let i = 0; i < this.blacklist.length; i++) {
            if (this.blacklist[i] === params) {
              this.blacklist[i] = params
              isExist = true //存在
              break
            }
          }
          if (!isExist) {
            //不存在就加上
            this.blacklist.push(params)
          }
        } else {
          this.blacklist.push(params)
        }
        this.setblacklistState(1)
        setStore('blacklist', this.blacklist)
        setStore("blacklistState", 1);
      },
      //删除黑名单某个账户
      deleteBlacklist(params) {
        for (let i = 0; i < this.blacklist.length; i++) {
          if (this.blacklist[i] === params) {
            this.blacklist.splice(i, 1)
            break
          }
        }
        this.setblacklistState(1)
        setStore('blacklist', this.blacklist)
      },
      //设置 Password
      setPassword(params) {
        this.password = params
      },
      //设置 thirdPartySource
      setThirdParty(params) {
        this.thirdPartySource = params
      },
      //设置 client
      setClient(params) {
        this.client = params
      },
      //设置 Keystore
      setKeystore(params) {
        this.keystore = params
        setStore('keystore', params)
      },
      //设置 token
      setToken(params) {
        this.token = params
        setStore('token', params)
      },
      //设置 configInfo
      setConfigInfo(params) {
        this.configInfo = params
        setStore('configInfo', params)
      },
      //设置 userInfo
      setUserInfo(params) {
        this.userInfo = params
        setStore('userInfo', params)
      },
      //设置 language
      setLanguage(params) {
        this.language = params
        setStore('language', params)
      },
      //设置 networkSetting
      setNetwork(params) {
        this.networkSetting = params
        setStore('networkSetting', params)
      },
  },
});