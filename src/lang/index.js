import { createI18n } from 'vue-i18n'
import enLocale from './en'
import zhLocale from './zh'
import pinia from "@/stores/store";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore(pinia);

const messages = {
  en: enLocale,
  'zh-cn': zhLocale,
}

const i18n = createI18n({
  globalInjection: true, //全局生效$t
  locale: userStore.language || 'en',
  messages,
  legacy: false,
})

export default i18n;