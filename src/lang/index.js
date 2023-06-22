import { createI18n } from 'vue-i18n'
import { getStore } from '@/util/service'
import moment from 'moment'
import enLocale from './en'
import zhLocale from './zh'

const messages = {
  en: enLocale,
  'zh-cn': zhLocale,
}


moment.locale(getStore('language') || 'zh-cn') //控制时间语言显示

const i18n = createI18n({
  globalInjection: true, //全局生效$t
  locale: getStore('language') || 'zh-cn',
  messages,
  legacy: false,
})

export default i18n;