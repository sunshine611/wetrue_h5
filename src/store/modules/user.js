import { getStore, setStore } from "@/util/service";
import { nodeUrl } from "@/config/config.js";
const login = {
    namespaced: true,
    state: {
        token: getStore("token"), //钱包地址
        password: "", //临时密码
        nodeUrl: getStore("nodeUrl") || nodeUrl, //节点地址
        configInfo: getStore("configInfo") || {}, //后端配置信息
        userInfo: getStore("userInfo") || {}, //用户信息
        keystore: getStore("keystore") || {}, //用户keyStore
        keystoreArr: getStore("keystoreArr") || [], //用户多账户keyStore数组
        client: {}, //主网对象
        thirdPartySource: "", //第三方来源
        language: "", //语言
        blacklist: getStore("blacklist") || [], //黑名单
    },
    getters: {},
    mutations: {
        SET_TOKEN: (state, params) => {
            state.token = params;
            setStore("token", params);
        },
        SET_PASSWORD: (state, params) => {
            state.password = params;
        },
        SET_NODEURL: (state, params) => {
            state.nodeUrl = params;
            setStore("nodeUrl", params);
        },
        SET_CONFIGINFO: (state, params) => {
            state.configInfo = params;
            setStore("configInfo", params);
        },
        SET_USERINFO: (state, params) => {
            state.userInfo = params;
            setStore("userInfo", params);
        },
        SET_KEYSTORE: (state, params) => {
            state.keystore = params;
            setStore("keystore", params);
        },
        SET_CLIENT: (state, params) => {
            state.client = params;
        },
        SET_TPSOURCE: (state, params) => {
            state.thirdPartySource = params;
            setStore ("thirdPartySource", params);
        },
        SET_LANGUAGE: (state, params) => {
            state.language = params;
            setStore ("language", params);
        },
        
    },
    actions: {
        //设置多账户
        setKeystoreArr({ state }, params) {
            if (state.keystoreArr.length > 0) {
                let isExist = false; //不存在
                for (let i = 0; i < state.keystoreArr.length; i++) {
                    if (state.keystoreArr[i].public_key === params.public_key) {
                        state.keystoreArr[i] = params;
                        isExist = true; //存在
                        break;
                    }
                }
                if (!isExist) {
                    //不存在就加上
                    state.keystoreArr.push(params);
                }
            } else {
                state.keystoreArr.push(params);
            }
            setStore("keystoreArr", state.keystoreArr);
        },
        //删除或退出某个账户
        deleteKeystoreArr({ commit, state }, params) {
            for (let i = 0; i < state.keystoreArr.length; i++) {
                if (state.keystoreArr[i].public_key === params) {
                    state.keystoreArr.splice(i, 1);
                    break;
                }
            }
            if (state.keystore.public_key === params) {
                commit("SET_KEYSTORE", {});
                commit("SET_TOKEN", "");
                commit("SET_USERINFO", {});
                commit("SET_CONFIGINFO", {});
                commit("SET_PASSWORD", "");
                commit("SET_CLIENT", {});
            }
            setStore("keystoreArr", state.keystoreArr);
        },
        //切换账户
        switchAccount({ commit, state }, params) {
            for (let i = 0; i < state.keystoreArr.length; i++) {
                if (state.keystoreArr[i].public_key === params) {
                    commit("SET_KEYSTORE", state.keystoreArr[i]);
                    commit("SET_TOKEN", state.keystoreArr[i].public_key);
                    commit("SET_PASSWORD", "");
                    commit("SET_USERINFO", {});
                    commit("SET_CONFIGINFO", {});
                    commit("SET_CLIENT", {});
                    break;
                }
            }
        },
        //设置添加账户到黑名单
        setBlacklist({ state }, params) {
            if (state.blacklist.length > 0) {
                let isExist = false; //不存在
                for (let i = 0; i < state.blacklist.length; i++) {
                    if (state.blacklist[i] === params) {
                        state.blacklist[i] = params;
                        isExist = true; //存在
                        break;
                    }
                }
                if (!isExist) {
                    //不存在就加上
                    state.blacklist.push(params);
                }
            } else {
                state.blacklist.push(params);
            }
            setStore("blacklist", state.blacklist);
            setStore("blacklistState", 1);
        },
        //删除黑名单某个账户
        deleteBlacklist({ state }, params) {
            for (let i = 0; i < state.blacklist.length; i++) {
                if (state.blacklist[i] === params) {
                    state.blacklist.splice(i, 1);
                    break;
                }
            }
            setStore("blacklist", state.blacklist);
            setStore("blacklistState", 1);
        },
    },
};
export default login;
