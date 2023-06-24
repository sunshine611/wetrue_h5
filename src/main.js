import App from '@/App'
import { createApp } from 'vue'
import i18n from '@/lang'
import moment from 'moment'
import * as buffer from "buffer";
import pinia from "@/stores/store";
import http from '@/util/request'
import uView from '@/components/vk-uview-ui'
import { mixinGlobal } from'@/mixins/mixinGlobal'
import { mixinMobile } from'@/mixins/mixinMobile'
import 'default-passive-events'
const app = createApp(App)

app.config.globalProperties.$http = http
app.config.globalProperties.$moment = moment
app
.use(uView)
.use(i18n)
.use(pinia)
.mixin(mixinGlobal)
.mixin(mixinMobile)

//解决vite global is not defined
if (typeof window.global == "undefined" || typeof window.global == undefined){  
    window.global = window;
}
//解决vite Buffer is not defined
if (typeof window.Buffer == "undefined" || typeof window.Buffer == undefined){  
    window.Buffer = buffer.Buffer;
}

app.mount('#app')
