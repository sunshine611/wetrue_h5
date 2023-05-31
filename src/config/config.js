import { getStore } from "@/util/service";

export const version = '2.8.17'
export const source  = 'WeTrue'
export let baseUrl, nodeUrl, aeExplorer, chatapi, aeMdw, aeknow, compilerUrl
export const chatRommKeyIv = { key: '20200425FEAACD66', iv: '66DCAAEF20200425' }
export const shTipContractId = 'ct_2Hyt9ZxzXra5NAzhePkRsDPDWppoatVD7CtHnUoHVbuehwR8Nb'

getConfigUrl();

exports.setConfigUrl = function () {
    getConfigUrl ()
}

function getConfigUrl () {
    let env_net = getStore("networkSetting") == 'io' ? 'io' : 'cc';
    if (env_net == 'io') {
        baseUrl     = 'https://api.wetrue.io'
        nodeUrl     = 'https://mainnet.aeternity.io'
        aeExplorer  = 'https://aeknow.org/block'
        chatapi     = 'https://api.wetrue.io'
        aeMdw       = 'https://mainnet.wetrue.io/mdw'
        aeknow      = 'https://www.aeknow.org'
        compilerUrl = 'https://compiler.wetrue.io'
    } else if (env_net == 'cc') {
        baseUrl     = 'https://api.wetrue.cc'
        nodeUrl     = 'https://mainnet.wetrue.cc'
        aeExplorer  = 'https://aeknow.org/block'
        chatapi     = 'https://api.wetrue.io'
        aeMdw       = 'https://mainnet.wetrue.cc/mdw'
        aeknow      = 'https://api.wetrue.cc/Aeknow'
        compilerUrl = 'https://compiler.wetrue.cc'
    } else if(env_net == 'test') {
        baseUrl     = 'http://192.168.1.120:1807'
        nodeUrl     = 'https://mainnet.wetrue.cc'
        aeExplorer  = 'https://explorer.aeternity.io'
        chatapi     = 'http://192.168.1.111:50001'
        aeMdw       = 'https://mainnet.wetrue.cc/mdw'
        aeknow      = 'http://192.168.1.120:1807/Aeknow'
        compilerUrl = 'https://compiler.wetrue.cc'
    }
}