import Vue from 'vue';
import App from './App';
import uView from 'uview-ui';
import i18n from './lang'; // Internationalization
import http from '@/util/request.js';
import store from 'store';
import moment from 'moment';
import {create} from 'ipfs-http-client'
import './mixins/install';
import 'default-passive-events';
Vue.prototype.$http = http;
Vue.prototype.$store = store;
Vue.prototype.$moment = moment;
Vue.prototype.$ipfs = create({ host: 'liushao.cc', port: '15501', apiPath: '/api/v0', protocol: 'https' });
Vue.use(uView);
Vue.config.productionTip = false;
Vue.prototype.$_i18n = i18n;
App.mpType = 'app';

const app = new Vue({
	i18n,
	...App,
});
app.$mount();