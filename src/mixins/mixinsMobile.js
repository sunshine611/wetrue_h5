import { getStore } from "@/util/service";
import store from "@/store";
import queryParams from "@/uview-ui/libs/function/queryParams";
import { sha256 } from "js-sha256";
import { source } from "@/config/config";
import {
    Node,
    Universal,
    Keystore,
    MemoryAccount,
    AmountFormatter,
} from "@aeternity/aepp-sdk/es/index";
import { FungibleTokenFull } from "@/util/FungibleTokenFull";
import Request from "luch-request";
const http = new Request();
import { nodeUrl } from "@/config/config.js";
const mixins = {
    data() {
        return {};
    },
    onLoad() {},
    onShow() {
        const { tabBar } = this.$_i18n.messages[this.$_i18n.locale];
        uni.setTabBarItem({
            index:0,
            text:tabBar.index
        })
        uni.setTabBarItem({
            index:1,
            text:tabBar.message
        })
        uni.setTabBarItem({
            index:2,
            text:tabBar.my
        })
    },
    methods: {
        uShowToast(title, icon, time) {
            uni.showToast({
                icon: icon == null ? "none" : icon,
                title: title,
                duration: time || 2000,
            });
        },
        uHideToast() {
            uni.hideToast();
        },
        uShowLoading(title) {
            uni.showLoading({
                title: title,
            });
        },
        uHideLoading() {
            uni.hideLoading();
        },
        uShowModel(title, content, callback) {
            uni.showModal({
                title: title,
                content: content,
                success: function(res) {
                    if (res.confirm) {
                        callback();
                        // console.log('用户点击确定');
                    } else if (res.cancel) {
                        // console.log('用户点击取消');
                    }
                },
            });
        },
        goUrl(url) {
            uni.navigateTo({
                url: url,
            });
        },
        redirectUrl(url) {
            uni.redirectTo({
                url: url,
            });
        },
        reLaunchUrl(url) {
            uni.reLaunch({
                url: url,
            });
        },
        switchTabUrl(url) {
            uni.switchTab({
                url: url,
            });
        },
        goBackUrl(delta) {
            // let current = getCurrentPages();
            uni.navigateBack({
                delta: delta,
            });
        },
        //获取未读消息数
        getUnreadMsg() {
            this.$http.post("/Message/stateSize").then((res) => {
                if (res.code === 200) {
                    if (res.data.stateSize > 0) {
                        uni.setTabBarBadge({
                            index: 1,
                            text: `${res.data.stateSize}`,
                        });
                    } else {
                        uni.hideTabBarRedDot({
                            index: 1,
                        });
                    }
                }
            });
        },
        //获取账户AE余额
        async getAccount() {
            return new Promise((resolve) => {
                http.get(nodeUrl + "/v3/accounts/" + getStore("token")).then((res) => {
                    resolve(this.balanceFormat(res.data.balance));
                });
            });
        },
        //余额格式化
        balanceFormat(balance, num) {
            if (isNaN(balance)) {
                return 0;
            } else {
                return (parseFloat(balance) / Math.pow(10, 18)).toFixed(
                    num || 4
                );
            }
        },
        //获取后端信息
        getConfigInfo() {
            this.$http.post("/Config/info").then((res) => {
                if (res.code === 200) {
                    store.commit("user/SET_CONFIGINFO", res.data);
                }
            });
        },
        //加密密码
        cryptoPassword(password) {
            let first,
                second,
                third,
                fourth,
                fifth = "";
            first = sha256("WeTrue" + password);
            second = "";
            for (let i = 0; i < first.length; i++) {
                second += first[i];
                i++;
            }
            third = sha256(second);
            fourth = "";
            for (let i = 0; i < third.length; i++) {
                i++;
                fourth += third[i];
            }
            fifth = new Buffer(fourth).toString("base64");
            return fifth;
        },
        //keystore通过密码转换成私钥
        keystoreToSecretKey(password) {
            const keystore = getStore("keystore");
            return Keystore.recover(password, keystore).then((strhex) => {
                return strhex;
            });
        },
        //验证密码是否存在
        isPassword() {
            if (!store.state.user.password) {
                let pageObj = getCurrentPages(); //实例化页面栈
                if (pageObj[0]) {
                    let link =
                        pageObj[0].route + queryParams(pageObj[0].options);
                    uni.navigateTo({
                        url: `/pages/login/password?link=${encodeURIComponent(
                            link
                        )}`,
                    });
                }
            }
        },
        //验证是否登录
        validLogin() {
            if (
                JSON.stringify(getStore("keystore")) === "{}" ||
                !getStore("keystore")
            ) {
                return false;
            } else {
                return true;
            }
        },
        //话题高亮
        topicHighlight(value) {
            var exp;
            exp = /#[x80-xff\u4e00-\u9fa5\w ,，.。!！-]{1,25}#/g;
            value = value.replace(exp, (item) => {
                let newVal = `<text class="topic-text">${item}</text>`;
                return newVal;
            });
            return value;
        },
        //连接AE网络
        async connectAe() {
            try {
                const secretKey = await this.keystoreToSecretKey(
                    store.state.user.password
                );
                const node = await Node({
                    url: store.state.user.nodeUrl,
                });
                const client = await Universal({
                    compilerUrl: "https://compiler.aepps.com",
                    nodes: [
                        {
                            name: "WeTrue",
                            instance: node,
                        },
                    ],
                    accounts: [
                        MemoryAccount({
                            keypair: {
                                secretKey: secretKey,
                                publicKey: getStore("keystore").public_key,
                            },
                        }),
                    ],
                    address: getStore("keystore").public_key,
                });
                store.commit("user/SET_CLIENT", client);
            } catch (error) {
                this.uShowToast(this.i18n.mixins.connectionFail);
            }
        },
        //判断是否已连接AE网络
        async client() {
            var client;
            if (JSON.stringify(store.state.user.client) === "{}") {
                await this.connectAe();
                client = store.state.user.client;
            } else {
                client = store.state.user.client;
            }
            return client;
        },
        //wetrue上链发送操作
        async wetrueSend(type, payload) {
            try {
                let account = 0;
                await this.getAccount().then((res) => {
                    account = res;
                });
                if (account < 1) {
                    this.uShowToast(this.i18n.mixins.lowBalance);
                    return;
                }
                const configInfo = getStore("configInfo");
                let amount, content, client;
                if (type === "topic") {
                    //发送主贴
                    amount = configInfo.topicAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        source: source,
                        type: "topic",
                        content: payload.content,
                    };
                } else if (type === "comment") {
                    //发送评论
                    amount = configInfo.commentAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: "comment",
                        source: source,
                        toHash: payload.hash,
                        content: payload.content,
                    };
                } else if (type === "reply") {
                    //发送回复
                    amount = configInfo.replyAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: "reply",
                        source: source,
                        reply_type: payload.type,
                        to_hash: payload.hash,
                        to_address: payload.address,
                        reply_hash: payload.replyHash,
                        content: payload.content,
                    };
                } else if (type === "nickname") {
                    //修改昵称
                    amount = configInfo.nicknameAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: "nickname",
                        content: payload.content,
                    };
                } else if (type === "sex") {
                    //修改性别
                    amount = configInfo.sexAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: "sex",
                        content: payload.content,
                    };
                }
                if (this.balanceFormat(amount) > 10) {
                    this.uShowToast(this.i18n.mixins.amountsAbnormal);
                    return;
                }
                this.uShowLoading(this.i18n.mixins.inChain);
                client = await this.client();
                const res = await client.spend(
                    amount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                this.uShowLoading(this.i18n.mixins.radio);
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast(this.i18n.mixins.fail);
            }
        },
        //合约转账
        async contractTransfer(contractId, receiveId, amount) {
            try {
                uni.showLoading({
                    title: this.i18n.mixins.readySend,
                });
                let client = await this.client();
                uni.showLoading({
                    title: this.i18n.mixins.compileContract,
                });
                const callDataCall = await client.contractEncodeCall(
                    FungibleTokenFull,
                    "transfer",
                    [receiveId, AmountFormatter.toAettos(amount)]
                );
                uni.showLoading({
                    title: this.i18n.mixins.executeContract,
                });
                const callResult = await client.contractCall(
                    FungibleTokenFull,
                    contractId,
                    "transfer",
                    callDataCall
                );
                uni.hideLoading();
                return callResult;
            } catch (err) {
                this.uShowToast(this.i18n.mixins.fail);
            }
        },
    },
};
const mixinsMobile = {
    install: function(Vue, options) {
        Vue.mixin(mixins);
    },
};

export default mixinsMobile;
