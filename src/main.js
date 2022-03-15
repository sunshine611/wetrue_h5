import Vue from 'vue';
import App from './App';
import uView from 'uview-ui';
import i18n from './lang'; // Internationalization
import http from '@/util/request.js';
import store from 'store';
import moment from 'moment';
import './mixins/install';
import 'default-passive-events';

Vue.prototype.$http = http;
Vue.prototype.$store = store;
Vue.prototype.$moment = moment;
Vue.use(uView);
Vue.config.productionTip = false;
Vue.prototype.$_i18n = i18n;

uni.$u.setConfig({
	config: { //修改$u.config对象的属性
		unit: 'rpx' //修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
	}
});

App.mpType = 'app';
const app = new Vue({
	i18n,
	...App,
});

app.$mount();