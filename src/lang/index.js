import Vue from 'vue';
import VueI18n from 'vue-i18n';
import enLocale from './en';
import zhLocale from './zh';
import moment from 'moment';
import { getStore } from '@/util/service';
Vue.use(VueI18n);
const messages = {
	en: {
		...enLocale,
	},
	'zh-cn': {
		...zhLocale,
	},
};
//控制时间语言显示
moment.locale(getStore('language') || 'en');
const i18n = new VueI18n({
	locale: getStore('language') || 'en',
	messages,
});

export default i18n;
