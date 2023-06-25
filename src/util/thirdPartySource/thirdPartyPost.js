import { thirdPartyComm } from '@/util/thirdPartySource/comm'

//第三方上链模块
export const thirdPartyPost = function (payload) {
  thirdPartyComm(JSON.stringify(payload))
}
