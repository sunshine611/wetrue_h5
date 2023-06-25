import pinia from "@/stores/store";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore(pinia);

import {
  version,
  source as WeTrueSource,
  shTipContractId,
  diceContractId,
  rptContractId,
} from '@/config/config'
import {
  AeSdk,
  Node,
  MemoryAccount,
  recover as KS_recover,
  AE_AMOUNT_FORMATS,
  toAe,
  toAettos,
  encode,
  Encoding,
  signMessage,
} from '@aeternity/aepp-sdk'

import Fungible_Token_Full_Aci from '@/util/contracts/FungibleTokenFull'
import Migrate_Token_Aci from '@/util/contracts/MigrateToken'
import Superhero_Tipping_v3_Aci from '@/util/contracts/SuperheroTipping_v3'
import SpaceDice_Aci from '@/util/contracts/SpaceDice'
import Request from 'luch-request'
const http = new Request()
import Clipboard from 'clipboard'
import Backend from '@/util/backend'
import { thirdPartyPost } from '@/util/thirdPartySource/thirdPartyPost'
import queryParams from '@/components/vk-uview-ui/libs/function/queryParams'

export const mixinMobile = {
  data() {
    return {
      userStore: userStore,
    }
  },
  methods: {
    getUserInfo() {
      let params = {
          userAddress: userStore.token,
          type: "login",
      };
      this.$http.post("/User/info", params).then((res) => {
          if (res.code === 200) {
              userStore.setUserInfo(res.data)
          }
      }).catch((err) => {
          console.log("getUserInfo Error",err)
      });
    },
    //获取未读消息数
    getUnreadMsg() {
      this.$http.post('/Message/stateSize').then((res) => {
        if (res.code === 200) {
          if (res.data.stateSize > 0) {
            uni.setTabBarBadge({
              index: 1,
              text: `${res.data.stateSize}`,
            })
          } else {
            uni.hideTabBarRedDot({
              index: 1,
            })
          }
        }
      })
    },
    //获取账户AE余额
    async getAeBalance() {
      return new Promise((resolve) => {
        http.get(Backend.nodeApiAccounts(userStore.token)).then((res) => {
          resolve(this.balanceFormat(res.data.balance))
        }).catch((err) => {
          resolve(this.balanceFormat(0))
        });
      })
    },
    //获取账户Token余额
    async getTokenBalance(contractId, account) {
      try {
        const aeSdk = await this.initSdk()
        const contract = await aeSdk.initializeContract({
          aci: Fungible_Token_Full_Aci,
          address: contractId,
        })
        const callResult = await contract.balance(account)
        return callResult.decodedResult
      } catch (err) {
        console.log(err)
        this.uShowToast('getTokenBalance fail')
      }
    },
    //余额格式化
    balanceFormat(balance, num = 4) {
      const newBalance = toAe(balance, {
        denomination: AE_AMOUNT_FORMATS.AETTOS,
      })
      return parseFloat(newBalance).toFixed(num)
    },
    //keystore通过密码转换成私钥
    async keystoreToSecretKey(password) {
      const ks = await userStore.keystore
      return KS_recover(password, ks).then((str) => {
        return str
      })
    },
    //签名文本等消息
    async signMessage(signText) {
      const secretKey = await this.keystoreToSecretKey(
        userStore.password
      )
      const secretKeyHex = Buffer.from(secretKey, 'hex')
      const signArray = signMessage(signText, secretKeyHex)
      const signHex = Buffer.from(signArray).toString('hex')
      return signHex
    },
    //验证密码是否存在
    isPassword() {
      if (!userStore.password) {
        let pageObj = getCurrentPages() //实例化页面栈
        if (pageObj[0]) {
          let link = pageObj[0].route + queryParams(pageObj[0].$page.options)
          uni.navigateTo({
            url: `/pages/login/password?link=${encodeURIComponent(link)}`,
            success: res => {console.log(res)},
            fail: (res) => {console.log(res)},
            complete: () => {}
          })
        }
      }
    },
    //验证是否keystore登录
    validLogin() {
      if (
        JSON.stringify(userStore.keystore) === '{}' || !userStore.keystore) {
        return false
      } else {
        return true
      }
    },
    //验证是否token存在
    validToken() {
      if (JSON.stringify(userStore.token) === '' || !userStore.token) {
        return false
      } else {
        return true
      }
    },
    //验证是否管理员
    validAdmin() {
      if (userStore.userInfo?.isAdmin) {
        return true
      } else {
        return false
      }
    },
    //话题及@高亮
    topicHighlight(value) {
      //let expt = /#([x80-xff\u4e00-\u9fa5\w ,，.。!！-？·\?æÆ](?!<br>#)(?!\[ST\])){1,25}#/g;
      //上方为旧格式，即将放弃
      let expt = /#([\u4e00-\u9fa5a-zA-Z0-9]+)(?!;)/gu
      value = value.replace(expt, (item) => {
        let newVal = `<text class="topic-text">${item}</text>`
        return newVal
      })
      let expm = /@[\p{L}\d]+.chain/gu
      value = value.replace(expm, (item) => {
        let newVal = `<text class="mentions-text">${item}</text>`
        return newVal
      })
      //let exps = /#([^#]*)(\[ST\])#/g;
      //value = value.replace(exps, `<text class="topic-text">⚡$1</text>`);
      return value
    },
    //复制粘贴板
    copyContent(content, divId) {
      // #ifdef H5
      let clipboard = new Clipboard(divId || '#copy', {
        text: (trigger) => {
          uni.showToast({
            title: this.$t('my.copySuccess'),
            icon: 'none',
            duration: 600,
          })
          return content
        },
      })
      // #endif
      // #ifndef H5
      uni.setClipboardData({
        data: content,
        success: function () {
          uni.showToast({
            title: this.$t('my.copySuccess'),
            icon: 'none',
            duration: 600,
          })
        },
      })
      // #endif
    },
    //处理hash
    postHashToWeTrue(res) {
      res.hash = 'ok'
      return res
    },
    //提交hash到WeTrueApi
    postHashToWeTrueApi(res) {
      this.uShowLoading(this.$t('mixins.radio'))
      this.$http.post('/Submit/hash', {
        hash: res.hash,
      })
      this.uHideLoading();
      return res
    },
    //获取服务端版本信息
    getVersionInfo() {
      let system = this.getSystem()
      let postInfo = { system: system, version: version, }
      let custom = { system: system, version: version, }
      return new Promise((resolve) => {
        this.$http.post('/Config/version',postInfo, custom).then((res) => {
            resolve(res.data)
        })
      })
    },
    //获取系统
    getSystem() {
      const userAgent = navigator.userAgent
      let isAndroid =
        userAgent.indexOf('Android') > -1 || userAgent.indexOf('Linux') > -1
      let isIOS = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      let system = 'Other'
      if (isAndroid) {
        system = 'Android'
      }
      if (isIOS) {
        system = 'IOS'
      }
      return system
    },
    //初始化连接
    async createNodeInstance(url) {
      let nodeInstance
      try {
        nodeInstance = new Node(url, { ignoreVersion: true })
        await nodeInstance.getStatus()
      } catch (error) {
        this.uShowToast(this.$t('mixins.connectionFail'))
        return null
      }
      return nodeInstance
    },
    //连接AE网络
    async connectAe() {
      try {
        const secretKey = await this.keystoreToSecretKey(
          userStore.password
        )
        const senderAccount = new MemoryAccount(secretKey)
        const node = await this.createNodeInstance(userStore.nodeUrl)
        const aeSdk = new AeSdk({
          nodes: [
            {
              name: 'WeTrue',
              instance: node,
            },
          ],
          accounts: [senderAccount],
        })
        return aeSdk;
      } catch (error) {
        this.uShowToast(this.$t('mixins.connectionFail'))
      }
    },
    //判断是否已连接AE网络
    async initSdk() {
      let client = await this.connectAe()
      return client
    },
    //WeTrue上链发送操作
    async wetrueSend(type, payload) {
      try {
        let account = 0
        await this.getAeBalance().then((res) => {
          account = res
        })
        if (account < 1) {
          this.uShowToast(this.$t('mixins.lowBalance'))
          return
        }
        let amount, content, aeSdk, source

        const thirdPartySource = this.validThirdPartySource()
        const configInfo = userStore.configInfo
        source = await `${WeTrueSource} ${this.getSystem()}`
        if (thirdPartySource) source = 'Box æpp'

        if (type === 'topic') {
          //发送主贴
          amount = configInfo.topicAmount
          content = {
            WeTrue: configInfo.WeTrue,
            source: source,
            type: type,
            content: payload.content,
            media: payload.media,
          }
        } else if (type === 'comment') {
          //发送评论
          amount = configInfo.commentAmount
          content = {
            WeTrue: configInfo.WeTrue,
            type: type,
            source: source,
            toHash: payload.hash,
            content: payload.content,
          }
        } else if (type === 'reply') {
          //发送回复
          amount = configInfo.replyAmount
          content = {
            WeTrue: configInfo.WeTrue,
            type: type,
            source: source,
            replyType: payload.type,
            toHash: payload.toHash,
            toAddress: payload.address,
            replyHash: payload.replyHash,
            content: payload.content,
          }
        } else if (type === 'nickname') {
          //修改昵称
          amount = configInfo.nicknameAmount
          content = {
            WeTrue: configInfo.WeTrue,
            type: type,
            content: payload.content,
          }
        } else if (type === 'sex') {
          //修改性别
          amount = configInfo.sexAmount
          content = {
            WeTrue: configInfo.WeTrue,
            type: type,
            content: payload.content,
          }
        } else if (type === 'focus' || type === 'star') {
          //关注或收藏
          amount = configInfo.focusAmount
          if (type === 'star') amount = configInfo.starAmount
          content = {
            WeTrue: configInfo.WeTrue,
            type: type,
            action: payload.action,
            content: payload.content,
          }
        }
        if (this.balanceFormat(amount) > 10) {
          this.uShowToast(this.$t('mixins.amountsAbnormal'))
          return
        }
        if (thirdPartySource) {
          //第三方来源上链
          let postPayload = {
            type: 'send_AE',
            amount: amount,
            receivingAccount: configInfo.receivingAccount,
            contractAddress: '',
            payload: content,
          }
          return await thirdPartyPost(postPayload)
        } else {
          //WeTrue上链
          this.uShowLoading(this.$t('mixins.inChain'))
          aeSdk = await this.initSdk()
          const option = {
            denomination: AE_AMOUNT_FORMATS.AETTOS,
            payload: encode(
              new TextEncoder().encode(JSON.stringify(content)),
              Encoding.Bytearray
            ),
          }
          const res = await aeSdk.spend(
            amount,
            configInfo.receivingAccount,
            option
          )
          this.uHideLoading();
          const postRes = await this.postHashToWeTrueApi(res)
          return postRes;
        }
      } catch (err) {
        this.uShowToast(this.$t('mixins.fail') + ' ' + err)
        this.uHideLoading();
        console.log(err)
        return false;
      }
    },
    //合约转账
    async contractTransfer(contractId, receiveId, amount, payload = false) {
      try {
        this.uShowLoading(this.$t('mixins.readySend'))
        let aeSdk = await this.initSdk()
        const contract = await aeSdk.initializeContract({
          aci: Fungible_Token_Full_Aci,
          address: contractId,
        })
        this.uShowLoading(this.$t('mixins.executeContract'))
        let callResult
        if (payload) {
          const configInfo = userStore.configInfo
          payload.WeTrue = configInfo.WeTrue //添加 WeTrue 版本号

          callResult = await contract.transfer_payload(
            receiveId,
            toAettos(amount),
            JSON.stringify(payload)
          )
        } else {
          callResult = await contract.transfer(receiveId, toAettos(amount))
        }
        uni.hideLoading()
        return callResult
      } catch (err) {
        console.log(err)
        this.uShowToast(this.$t('mixins.fail'))
      }
    },
    //迁移兑换 (迁移合约, 旧Token, 接收地址, 数量)
    async contractMigrate(
      migrateContractId,
      migrateTokenId,
      receiveId,
      amount
    ) {
      uni.showLoading({
        title: this.$t('mixins.readySend'),
      })
      let aeSdk = await this.initSdk()
      this.uShowLoading(`编译授权...`)
      const allowanceCompiler = await aeSdk.initializeContract({
        aci: Fungible_Token_Full_Aci,
        address: migrateTokenId,
      })
      this.uShowLoading(`授权 ${amount} WET`)
      try {
        await allowanceCompiler.create_allowance(
          'ak' + migrateContractId.slice(2),
          toAettos(amount)
        )
      } catch (err) {
        await allowanceCompiler.change_allowance(
          'ak' + migrateContractId.slice(2),
          toAettos(amount)
        )
      }
      this.uShowLoading(`编译迁移...`)
      const migrateContract = await aeSdk.initializeContract({
        aci: Migrate_Token_Aci,
        address: migrateContractId,
      })
      this.uShowLoading(`正在迁移...`)
      let params = [migrateTokenId, receiveId, toAettos(amount)]
      try {
        let callresult = await migrateContract.migrate_mapping(...params)
        return true
      } catch (e) {
        return true
      }
    },
    //Superhero_Tipping
    async contractShTip(payload) {
      uni.showLoading({
        title: this.$t('mixins.readySend'),
      })
      let aeSdk = await this.initSdk()
      const tippingCompiler = await aeSdk.initializeContract({
        aci: Superhero_Tipping_v3_Aci,
        address: shTipContractId,
      })
      this.uShowLoading(`Post Superhero...`)
      let params = [payload, []]
      try {
        let callresult = await tippingCompiler.post_without_tip(...params)
        let res = {}
        if (callresult.hash) res.hash = callresult.hash
        return res
      } catch (e) {
        this.uShowToast(this.$t('mixins.fail'))
      }
    },
    //更新AENS
    async aensUpdate(payload) {
      try {
        //WeTrue上链
        this.uShowLoading(this.$t('mixins.inChain'))
        let aeSdk = await this.initSdk()
        if (payload.type == 'extend') {
          const name = payload.name
          const res = await aeSdk.aensUpdate(
            name,
            {},
            { nameTtl: 180000, extendPointers: true }
          )
          return res
        }
      } catch (err) {
        this.uShowToast(this.$t('mixins.fail'))
        console.log(err)
      }
    },
    //Dice 合约呼叫
    async callDiceContract(payload = null, event) {
      try {
        let postPayload = {
          type: 'betState',
          event: 'Info',
          payload: this.$t('mixins.readySend'),
        }
        event.source.postMessage(JSON.stringify(postPayload), '*')

        let aeSdk = await this.initSdk()
        const contract = await aeSdk.initializeContract({
          aci: SpaceDice_Aci,
          address: diceContractId,
        })
        postPayload.payload = this.$t('mixins.inChain')
        event.source.postMessage(JSON.stringify(postPayload), '*')
        let params = payload
        let callresult = await contract.bet(...params, { omitUnknown: true })
        let Result = callresult.decodedResult
        Result.type = 'diceGame'
        Result.event = 'betResult'
        uni.hideLoading()
        return Result
      } catch (err) {
        console.log(err)
        this.uShowToast(this.$t('mixins.fail'))
        let postPayload = {
          type: 'Error',
          event: 'betCallError',
          payload: this.$t('mixins.fail'),
        }
        event.source.postMessage(JSON.stringify(postPayload), '*')
      }
    },
    //创建授权
    async createAllowance(payload = null, event) {
      try {
        uni.showLoading({
          title: this.$t('mixins.readySend'),
        })
        this.uShowLoading(`编译授权...`)
        let aeSdk = await this.initSdk()
        const contract = await aeSdk.initializeContract({
          aci: Fungible_Token_Full_Aci,
          address: rptContractId,
        })
        this.uShowLoading(`正在授权...`)

        let callResult
        try {
          callResult = await contract.create_allowance(
            payload.for_account,
            payload.amount
          )
        } catch (err) {
          callResult = await contract.change_allowance(
            payload.for_account,
            payload.amount
          )
        }
        let Result = callresult.decodedResult
        Result.type = 'diceGame'
        Result.event = 'allowanceResult'
        uni.hideLoading()
        return Result
      } catch (err) {
        console.log(err)
        this.uShowToast(this.$t('mixins.fail'))
        let postPayload = {
          type: 'Error',
          event: 'allowanceError',
          payload: this.$t('mixins.fail'),
        }
        event.source.postMessage(JSON.stringify(postPayload), '*')
      }
    },
  },
}