import Backend from '@/util/backend'
import pinia from "@/stores/store";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore(pinia);

export const setThirdPartySource = (option) => {
  //设置第三方来源
  // #ifdef H5
  if (option.source === 'box' && !!option.userAddress) {
    if (option.language === 'en') {
      //设置语言
      userStore.language = 'en'
    } else {
      userStore.language = 'zh-cn'
    }
    userStore.token = option.userAddress //设置token
    userStore.thirdPartySource = option.source //标记第三方来源
    userStore.password = option.source //伪装存在密码
    Backend.setConfigInfo(option.userAddress) //设置 configInfo
  }
  // #endif
}
