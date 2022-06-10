import { getStore, setStore } from "@/util/service";
import moment from "moment";
import shajs from 'sha.js'

const mixins = {
    onLoad() {
        if (!getStore("language")) {
            setStore("language", "en");
        }
        if (!getStore("networkSetting")) {
            setStore("networkSetting", "io");
        }
        this.getSystemStatusBarHeight(); //状态栏高度
    },
    methods: {
        //加密密码
        cryptoPassword(password) {
            let first,
                second,
                third,
                fourth,
                fifth = "";
            first = shajs('sha256').update("WeTrue" + password).digest('hex');
            second = "";
            for (let i = 0; i < first.length; i++) {
                second += first[i];
                i++;
            }
            third = shajs('sha256').update(second).digest('hex');
            fourth = "";
            for (let i = 0; i < third.length; i++) {
                i++;
                fourth += third[i];
            }
            fifth = new Buffer(fourth).toString("base64");
            return fifth;
        },
        //获取状态栏高度
        getSystemStatusBarHeight(){
            let _that = this;
            uni.getSystemInfo({
                success(e) {
                    _that.statusBarHeight = e.statusBarHeight;
                }
            })
        },
        //苹果刘海屏顶部兼容性调整
        iphoneTop() {
            let iphones = ["iPhone X","iPhone Xs","iPhone XS Max","iPhone Xr","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max"];
            let result;
            uni.getSystemInfo({
                success(res) {
                    if (iphones.includes(res.model)) {
                        result = true;
                    } else {
                        result = false;
                    }
                },
            });
            return result;
        },
        //切换语言
        selectLanguage() {
            if (getStore("language") === "zh-cn") {
                setStore("language", "en");
            } else if (getStore("language") === "en") {
                setStore("language", "zh-cn");
            }
            //控制语言显示
            this.language = getStore("language");
            moment.locale(this.language);
            this.$_i18n.locale = this.language;
        },
    },
};
const mixinsUtils = {
    install: function (Vue, options) {
        Vue.mixin(mixins);
    },
};

export default mixinsUtils;
