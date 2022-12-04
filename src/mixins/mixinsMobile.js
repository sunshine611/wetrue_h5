import { getStore } from "@/util/service";
import store from "@/store";
import {
    version,
    compilerUrl,
    source as WeTrueSource,
    shTipContractId
} from "@/config/config";
import {
    Node,
    Crypto,
    Universal,
    Keystore,
    MemoryAccount,
    AmountFormatter,
} from "@aeternity/aepp-sdk/es/index";
import Fungible_Token_Full_Interface from "@/util/contracts/fungible-token-full-interface.aes";
import Migrate_Token_Interface from "@/util/contracts/MigrateTokenInterface.aes";
import Superhero_Tipping_v3_Interface from "@/util/contracts/SuperheroTipping_v3_Interface.aes";
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
    onShow() {
        uni.setTabBarItem({
            index: 0,
            text: this.$t('tabBar.index'),
        });
        uni.setTabBarItem({
            index: 1,
            text: this.$t('tabBar.message'),
        });
        uni.setTabBarItem({
            index: 2,
            text: this.$t('tabBar.chat'),
        });
        uni.setTabBarItem({
            index: 3,
            text: this.$t('tabBar.my'),
        });
    },
    methods: {
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
        //获取账户Token余额
        async getTokenBalance(contractId, address) {
            try {
                let client = await this.client();
                const contract = await client.getContractInstance({
                    source: Fungible_Token_Full_Interface,
                    contractAddress: contractId
                })
                let callResult = await contract.methods.balance(address)
                return callResult.decodedResult;
            } catch (err) {
                console.log(err)
                this.uShowToast(this.$t('mixins.fail'));
            }
        },
        //余额格式化
        balanceFormat(balance, num=4, decimal=18) {
            if (isNaN(balance)) {
                return 0;
            } else {
                return (parseFloat(balance) / Math.pow(10, decimal)).toFixed(
                    num
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
            /* 基于节点方式
            const client = await this.client();
            const sig = await client.signMessage(signText);
            const sigHex = Buffer.from(sig).toString('hex');
            return sigHex;
            */
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
            //let expt = /#([x80-xff\u4e00-\u9fa5\w ,，.。!！-？·\?æÆ](?!<br>#)(?!\[ST\])){1,25}#/g;
            //上方为旧格式，即将放弃
            let expt = /#([\u4e00-\u9fa5a-zA-Z0-9]+)(?!;)/gu;
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
                        title: this.$t('my.copySuccess'),
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
                        title: this.$t('my.copySuccess'),
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
        },
        //处理hash
        postHashToWeTrue(res) {
            res.hash = 'ok';
            return res;
        },
        //提交hash到WeTrueApi
        postHashToWeTrueApi(res) {
            this.uShowLoading(this.$t('mixins.radio'));
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
        //获取服务端版本信息
        getVersionInfo() {
            let system = this.getSystem();
            return new Promise((resolve) => {
                this.$http.post("/Config/version", {
                    system:  system,
                    version: version
                    },{ custom: { isToast: true }
                }).then(
                    (res) => {
                        resolve(res.data);
                    }
                );
            });
        },
        //获取系统
        getSystem() {
            const userAgent = navigator.userAgent;
            let isAndroid = userAgent.indexOf("Android") > -1 || userAgent.indexOf("Linux") > -1;
            let isIOS  = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            let system = "Other";
            if (isAndroid) {
                system = "Android";
            }
            if (isIOS) {
                system = "IOS";
            }
            return system;
        },
        //连接AE网络
        async connectAe() {
            try {
                const secretKey = await this.keystoreToSecretKey(
                    store.state.user.password
                );
                const publicKey = await Crypto.getAddressFromPriv(secretKey);
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
                                publicKey: publicKey,
                            },
                        }),
                    ],
                    address: publicKey,
                });
                store.commit("user/SET_CLIENT", client);
            } catch (error) {
                this.uShowToast(this.$t('mixins.connectionFail'));
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
                    this.uShowToast(this.$t('mixins.lowBalance'));
                    return;
                }
                let amount, content, client, source;

                const thirdPartySource = this.validThirdPartySource();
                const configInfo = getStore("configInfo");
                source = await `${WeTrueSource} ${this.getSystem()}`;
                if (thirdPartySource) source = "Box æpp";

                if (type === "topic") {
                    //发送主贴
                    amount = configInfo.topicAmount;
                    content = {
                        WeTrue: configInfo.WeTrue,
                        source: source,
                        type: type,
                        content: payload.content,
                        //media: payload.media,
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
                        replyType: payload.type,
                        toHash: payload.toHash,
                        toAddress: payload.address,
                        replyHash: payload.replyHash,
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
                    this.uShowToast(this.$t('mixins.amountsAbnormal'));
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
                    this.uShowLoading(this.$t('mixins.inChain'));
                    client = await this.client();
                    let res = await client.spend(
                        amount,
                        configInfo.receivingAccount,
                        {
                            payload: JSON.stringify(content),
                        }
                    );
                    return await this.postHashToWeTrue(res);
                }
            } catch (err) {
                this.uShowToast(this.$t('mixins.fail'));
                console.log(err);
            }
        },
        //合约转账
        async contractTransfer(contractId, receiveId, amount ,payload=false) {
            try {
                this.uShowLoading(this.$t('mixins.readySend'))
                let client = await this.client();
                this.uShowLoading(this.$t('mixins.compileContract'))
                const contract = await client.getContractInstance({
                    source: Fungible_Token_Full_Interface,
                    contractAddress: contractId,
                    gas: 36969
                })
                this.uShowLoading(this.$t('mixins.executeContract'))
                let callResult;
                if(payload) {
                    const configInfo = getStore("configInfo");
                    payload.WeTrue = configInfo.WeTrue; //添加 WeTrue 版本号

                    callResult = await contract.methods.transfer_payload(
                        receiveId, 
                        AmountFormatter.toAettos(amount), 
                        JSON.stringify(payload)
                    )
                } else {
                    callResult = await contract.methods.transfer( receiveId, AmountFormatter.toAettos(amount) )
                }
                uni.hideLoading();
                return callResult;
            } catch (err) {
                console.log(err)
                this.uShowToast(this.$t('mixins.fail'));
            }
        },
        //迁移兑换 (迁移合约, 旧Token, 接收地址, 数量)
        async contractMigrate(migrateContractId, migrateTokenId, receiveId, amount) {
            uni.showLoading({
                title: this.$t('mixins.readySend'),
            });
            let client = await this.client();
            this.uShowLoading(`编译授权...`)
            const allowanceCompiler = await client.getContractInstance({
                source: Fungible_Token_Full_Interface,
                contractAddress: migrateTokenId
            })
            this.uShowLoading(`授权 ${amount} WET`)
            try {
                await allowanceCompiler.methods.create_allowance( "ak" + migrateContractId.slice(2), AmountFormatter.toAettos(amount))
            }
            catch (err) {
                await allowanceCompiler.methods.change_allowance( "ak" + migrateContractId.slice(2), AmountFormatter.toAettos(amount) )
            }
            this.uShowLoading(`编译迁移...`)
            const migrateContract = await client.getContractInstance({
                source: Migrate_Token_Interface, 
                contractAddress: migrateContractId,
                gas: 36969
            })
            this.uShowLoading(`正在迁移...`)
            let params = [migrateTokenId, receiveId, AmountFormatter.toAettos(amount - 0.00009)];
            try{
                let callresult = await migrateContract.methods.migrate_mapping(...params);
                return true;
            } catch (e){
                return true;
            }
        },
        //Superhero_Tipping
        async contractShTip(payload) {
            uni.showLoading({
                title: this.$t('mixins.readySend'),
            });
            let client = await this.client();
            uni.showLoading({
                title: this.$t('mixins.compileContract'),
            });
            const tippingCompiler = await client.getContractInstance(
                {source: Superhero_Tipping_v3_Interface, contractAddress: shTipContractId, gas: 36969}
            )
            this.uShowLoading(`Post Superhero...`)
            let params = [payload, []];
            try{
                let callresult =  await tippingCompiler.methods.post_without_tip(...params);
                let res = {}
                if (callresult.hash) res.hash = callresult.hash
                return res;
            } catch(e) {
                this.uShowToast(this.$t('mixins.fail'));
            }
        },
        //更新AENS
        async aensUpdate(payload) {
            try{
                //WeTrue上链
                this.uShowLoading(this.$t('mixins.inChain'));
                let client = await this.client();
                if ( payload.type == 'extend') {
                    const name = payload.name;
                    const res = await client.aensUpdate(name, {}, { nameTtl: 180000, extendPointers: true })
                    return res;
                }
            } catch(err) {
                this.uShowToast(this.$t('mixins.fail'));
                console.log(err);
            }
        },
    },
};
const mixinsMobile = {
    install: function (Vue, options) {
        Vue.mixin(mixins);
    },
};

export default mixinsMobile;
