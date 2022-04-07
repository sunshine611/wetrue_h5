import { getStore, setStore } from "@/util/service";
import store from "@/store";
import { compilerUrl, source as WeTrueSource } from "@/config/config";
import {
    Node,
    Crypto,
    Universal,
    Keystore,
    MemoryAccount,
    AmountFormatter,
} from "@aeternity/aepp-sdk/es/index";
import shajs from 'sha.js'
import Fungible_Token_Full from "@/util/contracts/fungible-token-full.aes";
import Fungible_Token_Full_Interface from "@/util/contracts/fungible-token-full-interface.aes";
import Migrate_Token_Interface from "@/util/contracts/MigrateTokenInterface.aes";
import Request from "luch-request";
const http = new Request();
import Clipboard from "clipboard";
import Backend from "@/util/backend";
import { thirdPartyPost } from "@/util/thirdPartySource/thirdPartyPost";
import queryParams from "uview-ui/libs/function/queryParams";

const mixins = {
    data() {
        return {};
    },
    onLoad() {
        if (!getStore("language")) {
            setStore("language", "zh-cn");
        }
    },
    onShow() {
        const { tabBar } = this.$_i18n.messages[this.$_i18n.locale];
        uni.setTabBarItem({
            index: 0,
            text: tabBar.index,
        });
        uni.setTabBarItem({
            index: 1,
            text: tabBar.message,
        });
        uni.setTabBarItem({
            index: 2,
            text: tabBar.chat,
        });
        uni.setTabBarItem({
            index: 3,
            text: tabBar.my,
        });
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
                success: function (res) {
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
                http.get(Backend.nodeApiAccounts(getStore("token"))).then(
                    (res) => {
                        resolve(this.balanceFormat(res.data.balance));
                    }
                );
            });
        },
        //余额格式化
        balanceFormat(balance, num, decimal=18) {
            if (isNaN(balance)) {
                return 0;
            } else {
                return (parseFloat(balance) / Math.pow(10, decimal)).toFixed(
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
        //keystore通过密码转换成私钥
        keystoreToSecretKey(password) {
            const keystore = getStore("keystore");
            return Keystore.recover(password, keystore).then((str) => {
                return str;
            });
        },
        //签名文本等消息
        async signMessage(signText) {
            const secretKey = await this.keystoreToSecretKey(store.state.user.password)
            const secretKeyHex = Buffer.from(secretKey, 'hex')
            const signArray = Crypto.signMessage(signText, secretKeyHex)
            const signHex = Buffer.from(signArray).toString('hex');
            return signHex;
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
        //验证是否管理员
        validAdmin() {
            let userInfo = getStore("userInfo");
            if (userInfo.isAdmin) {
                return true;
            } else {
                return false;
            }
        },
        //话题及@高亮
        topicHighlight(value) {
            let expt = /#([x80-xff\u4e00-\u9fa5\w ,，.。!！-？·\?æÆ](?!<br>#)(?!\[ST\])){1,25}#/g;
            value = value.replace(expt, (item) => {
                let newVal = `<text class="topic-text">${item}</text>`;
                return newVal;
            });
            let expm = /@[\p{L}\d]+.chain/gu;
            value = value.replace(expm, (item) => {
                let newVal = `<text class="mentions-text">${item}</text>`;
                return newVal;
            });
            //let exps = /#([^#]*)(\[ST\])#/g;
            //value = value.replace(exps, `<text class="topic-text">⚡$1</text>`);
            return value;
        },
        //复制粘贴板
        copyContent(content,divId) {
            // #ifdef H5
            let clipboard = new Clipboard(divId || "#copy", {
                text: (trigger) => {
                    uni.showToast({
                        title: this.i18n.my.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                    return content;
                },
            });
            // #endif
            // #ifndef H5
            uni.setClipboardData({
                data: content,
                success: function () {
                    uni.showToast({
                        title: this.i18n.my.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
        },
        //提交hash到WeTrue
        postHashToWeTrue(res, opt) {
            this.uShowLoading(this.i18n.mixins.radio);
            if (opt) {
                return Promise.resolve(
                    this.$http.post(
                        "/Submit/hash", 
                        {
                            hash: res.hash,
                            await: true,
                        }
                    )
                );
            }
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
                    compilerUrl: compilerUrl,
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
                let opt = false;
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
                        type: type,
                        content: payload.content,
                        media: payload.media,
                    };
                } else if (type === "comment") {
                    //发送评论
                    amount = configInfo.commentAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: type,
                        source: source,
                        toHash: payload.hash,
                        content: payload.content,
                    };
                } else if (type === "reply") {
                    //发送回复
                    amount = configInfo.replyAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: type,
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
                        type: type,
                        content: payload.content,
                    };
                } else if (type === "sex") {
                    //修改性别
                    amount = configInfo.sexAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: type,
                        content: payload.content,
                    };
                } else if (type === "focus" || type === "star") {
                    //关注或收藏
                    opt = true;
                    amount = configInfo.focusAmount;
                    if(type === "star") amount = configInfo.starAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        type: type,
                        action: payload.action,
                        content: payload.content,
                    };
                }
                if (this.balanceFormat(amount) > 10) {
                    this.uShowToast(this.i18n.mixins.amountsAbnormal);
                    return;
                }
                if (thirdPartySource) {
                    //第三方来源上链
                    let postPayload = {
                        type: "send_AE",
                        amount: amount,
                        receivingAccount: configInfo.receivingAccount,
                        contractAddress: "",
                        payload: content,
                    };
                    return thirdPartyPost(postPayload);
                } else {
                    //WeTrue上链
                    this.uShowLoading(this.i18n.mixins.inChain);
                    client = await this.client();
                    let res = await client.spend(
                        amount,
                        configInfo.receivingAccount,
                        {
                            payload: JSON.stringify(content),
                        }
                    );
                    return await this.postHashToWeTrue(res, opt);
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
                const contract = await client.getContractInstance(
                    { source: Fungible_Token_Full_Interface, contractAddress: contractId }
                )
                uni.showLoading({
                    title: this.i18n.mixins.executeContract,
                });
                const callResult = await contract.methods.transfer( receiveId, AmountFormatter.toAettos(amount) )
                //const callResult = await contract.methods.transfer_payload(receiveId, AmountFormatter.toAettos(amount), "Test Payload")
                uni.hideLoading();
                return callResult;
            } catch (err) {
                this.uShowToast(this.i18n.mixins.fail);
            }
        },
        //迁移兑换 (迁移合约, 旧Token, 接收地址, 数量)
        async contractMigrate(migrateContractId, migrateTokenId, receiveId, amount) {
            uni.showLoading({
                title: this.i18n.mixins.readySend,
            });
            let client = await this.client();
            uni.showLoading({
                title: `编译授权...`,
            });
            const allowanceCompiler = await client.getContractInstance(
                { source: Fungible_Token_Full_Interface, contractAddress: migrateTokenId }
            )
            uni.showLoading({
                title: `授权 ${amount} WET`,
            });
            try {
                await allowanceCompiler.methods.create_allowance( "ak" + migrateContractId.slice(2), AmountFormatter.toAettos(amount + 0.00001))
                console.log(AmountFormatter.toAettos(amount))
                console.log(create_allowance)
            }
            catch (err) {
                await allowanceCompiler.methods.change_allowance( "ak" + migrateContractId.slice(2), AmountFormatter.toAettos(amount + 0.00001) )
            }
            uni.showLoading({
                title: `编译迁移...`,
            });
            const migrateContract = await client.getContractInstance(
                { source: Migrate_Token_Interface, contractAddress: migrateContractId, gas: 36969}
            )
            uni.showLoading({
                title: `正在迁移...`,
            });
            let params = [migrateTokenId, receiveId, AmountFormatter.toAettos(amount - 0.00009)];
            try{
                let callresult = await migrateContract.methods.migrate_mapping(...params);
                console.log("Transaction ID: ", callresult);
                return true;
              } catch (e){
                console.log("Calling your function errored: ", e)
                return true;
              }

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
        //获取状态栏高度
        getSystemStatusBarHeight(){
             let _that = this;
             uni.getSystemInfo({
                 success(e) {
                    _that.statusBarHeight = e.statusBarHeight;
                 }
             })
         },
    },
};
const mixinsMobile = {
    install: function (Vue, options) {
        Vue.mixin(mixins);
    },
};

export default mixinsMobile;
