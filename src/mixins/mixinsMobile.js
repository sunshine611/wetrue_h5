import { getStore } from "@/util/service";
import store from "@/store";
import queryParams from "@/uview-ui/libs/function/queryParams";
import { sha256 } from "js-sha256";
import { source as WeTrueSource } from "@/config/config";
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
import Clipboard from "clipboard";
import Backend from "@/util/backend";
import { thirdPartyPost } from "@/util/thirdPartySource/thirdPartyPost";

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
        uSetBarTitle(title) {
            uni.setNavigationBarTitle({
                title: title,
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
                http.get(
                        Backend.nodeApiAccounts(getStore("token"))
                    ).then((res) => {
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
            return Keystore.recover(password, keystore).then((str) => {
                return str;
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
        //验证是否keystore登录
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
        //验证是否token存在
        validToken() {
            if (
                JSON.stringify(getStore("token")) === "" ||
                !getStore("token")
            ) {
                return false;
            } else {
                return true;
            }
        },
        //话题及@高亮
        topicHighlight(value) {
            let expt, expm;
            expt = /#[x80-xff\u4e00-\u9fa5\w ,，.。!！-？·\?æÆ][^(?!#@)]{1,25}#/g;
            expm = /@[\p{L}\d]+.chain/gu;
            value = value.replace(expt, (item) => {
                let newVal = `<text class="topic-text">${item}</text>`;
                return newVal;
            });
            value = value.replace(expm, (item) => {
                let newVal = `<text class="mentions-text">${item}</text>`;
                return newVal;
            });
            return value;
        },
        //复制粘贴板
        copyContent(content) {
            let clipboard = new Clipboard("#copy", {
                text: (trigger) => {
                    uni.showToast({
                        title: this.i18n.my.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                    return content;
                },
            });
            uni.setClipboardData({
                data: content,
                success: function() {
                    uni.showToast({
                        title: this.i18n.my.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                },
            });
        },
        //提交hash到WeTrue
        postHashToWeTrue(res) {
            this.uShowLoading(this.i18n.mixins.radio);
            this.$http.post("/Submit/hash", {
                hash: res.hash,
            });
            return res;
        },
        //验证第三方来源
        validThirdPartySource() {
            const thirdPartySource = getStore("thirdPartySource");
            if (thirdPartySource === "box") {
                return true;
            } else {
                return false;
            }
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
                    compilerUrl: "https://compiler.aeasy.io",
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
        //WeTrue上链发送操作
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
                let amount, content, client, source;

                const thirdPartySource = this.validThirdPartySource();
                const configInfo = getStore("configInfo");
                source = WeTrueSource;
                if (thirdPartySource) source = "Box æpp";

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
                        to_hash: payload.toHash,
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
                if (thirdPartySource) {
                    //第三方来源上链
                    let postPayload = {
                            type: "send_AE",
                            amount: amount,
                            receivingAccount: configInfo.receivingAccount,
                            contractAddress: "",
                            payload: content,
                    };
                    thirdPartyPost(postPayload);
                    //后续等暴露方法要求
                } else {
                    //WeTrue上链
                    client = await this.client();
                    const res = await client.spend(
                            amount,
                            configInfo.receivingAccount,
                            {
                                payload: JSON.stringify(content),
                            }
                        );
                    return await this.postHashToWeTrue(res);
                }
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
