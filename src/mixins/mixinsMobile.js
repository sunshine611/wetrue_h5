import { getStore } from "@/util/service";
import store from "@/store";
import queryParams from "@/uview-ui/libs/function/queryParams";
import {source} from '@/config/config';
import {
    Node,
    Universal,
    Keystore,
    MemoryAccount,
    AmountFormatter,
} from "@aeternity/aepp-sdk/es/index";
import { FungibleTokenFull } from "@/util/FungibleTokenFull";
const mixins = {
    data() {
        return {};
    },
    onLoad() {},
    methods: {
        uShowToast(title, icon,time) {
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
        //余额格式化
        balanceFormat(balance, num) {
            if (isNaN(balance)) {
                return 0;
            } else {
                return (parseFloat(balance) / Math.pow(10, 18)).toFixed(num || 4);
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
                let link = pageObj[0].route + queryParams(pageObj[0].options);
                uni.navigateTo({
                    url: `/pages/login/password?link=${encodeURIComponent(
                        link
                    )}`,
                });
            }
        },
        //验证是否登录
        validLogin() {
            if (getStore("keystore")) {
                return true;
            } else {
                return false;
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
        //AE交易
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
                alert(error);
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
        //发布主贴
        async sendTopic(payload) {
            try {
                let client = await this.client();
                const configInfo = getStore("configInfo");
                let content = {
                    WeTrue: configInfo.WeTrue,
                    source: source,
                    type: "topic",
                    content: payload.content,
                };
                const res = await client.spend(
                    configInfo.topicAmount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                uni.showLoading({
                    title: "Radio",
                });
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast("操作失败！");
            }
        },
        //发送评论
        async sendComment(payload) {
            try {
                let client = await this.client();
                const configInfo = getStore("configInfo");
                let content = {
                    WeTrue: configInfo.WeTrue,
                    type: "comment",
                    toHash: payload.hash,
                    content: payload.content,
                };
                const res = await client.spend(
                    configInfo.commentAmount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                uni.showLoading({
                    title: "Radio",
                });
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast("操作失败！");
            }
        },
        //发送回复
        async sendReply(payload) {
            try {
                let client = await this.client();
                const configInfo = getStore("configInfo");
                let content = {
                    WeTrue: configInfo.WeTrue,
                    type: "reply",
                    reply_type: payload.type,
                    to_hash: payload.hash,
                    to_address: payload.address,
                    reply_hash: payload.replyHash,
                    content: payload.content,
                };
                const res = await client.spend(
                    configInfo.replyAmount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                uni.showLoading({
                    title: "Radio",
                });
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast("操作失败！");
            }
        },
        //发送昵称
        async sendNickname(payload) {
            try {
                let client = await this.client();
                const configInfo = getStore("configInfo");
                let content = {
                    WeTrue: configInfo.WeTrue,
                    type: "nickname",
                    content: payload.content,
                };
                const res = await client.spend(
                    configInfo.nicknameAmount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                uni.showLoading({
                    title: "Radio",
                });
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast("操作失败！");
            }
        },
        //发送性别
        async sendSex(payload) {
            try {
                let client = await this.client();
                const configInfo = getStore("configInfo");
                let content = {
                    WeTrue: configInfo.WeTrue,
                    type: "sex",
                    content: payload.content,
                };
                const res = await client.spend(
                    configInfo.sexAmount,
                    configInfo.receivingAccount,
                    {
                        payload: JSON.stringify(content),
                    }
                );
                uni.showLoading({
                    title: "Radio",
                });
                this.$http.post("/Submit/hash", {
                    hash: res.hash,
                });
                return res;
            } catch (err) {
                this.uShowToast("操作失败！");
            }
        },
        //合约转账
        async contractTransfer(contractId, receiveId, amount) {
            try {
                uni.showLoading({
                    title: "准备发送",
                });
                let client = await this.client();
                uni.showLoading({
                    title: "正在编译合约",
                });
                const callDataCall = await client.contractEncodeCall(
                    FungibleTokenFull,
                    "transfer",
                    [receiveId, AmountFormatter.toAettos(amount)]
                );
                uni.showLoading({
                    title: "正在执行合约",
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
                this.uShowToast("操作失败！");
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
