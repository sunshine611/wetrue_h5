import { getStore } from "@/util/service";

export const version = '2.9.01'
export const source  = 'WeTrue'
export let baseUrl, nodeUrl, aeExplorer, chatapi, aeMdw, aeknow, compilerUrl, diceUrl
//备注 compilerUrl 可能可以废弃，测试后允许删除
export const chatRommKeyIv   = { key: '20200425FEAACD66', iv: '66DCAAEF20200425' }
export const shTipContractId = 'ct_2Hyt9ZxzXra5NAzhePkRsDPDWppoatVD7CtHnUoHVbuehwR8Nb'
export const diceContractId  = 'ct_2RNL8GrrB1JQbvn5nf4Dz3EPcFs47oKnBZSvnm5hey7SdjYG25'
export const rptContractId   = 'ct_2U1usf3A8ZNUcZLkZe5rEoBTxk7eJvk9fcbRDNqmRiwXCHAYN'

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
        diceUrl     = 'https://wetrue.io/dice/'
    } else if (env_net == 'cc') {
        baseUrl     = 'https://api.wetrue.cc'
        nodeUrl     = 'https://mainnet.wetrue.cc'
        aeExplorer  = 'https://aeknow.org/block'
        chatapi     = 'https://api.wetrue.io'
        aeMdw       = 'https://mainnet.wetrue.cc/mdw'
        aeknow      = 'https://api.wetrue.cc/Aeknow'
        compilerUrl = 'https://compiler.wetrue.cc'
        diceUrl     = 'https://wetrue.cc/dice/'
    } else if(env_net == 'test') {
        baseUrl     = 'http://192.168.1.120:1807'
        nodeUrl     = 'https://mainnet.wetrue.cc'
        aeExplorer  = 'https://explorer.aeternity.io'
        chatapi     = 'http://192.168.1.111:50001'
        aeMdw       = 'https://mainnet.wetrue.cc/mdw'
        aeknow      = 'http://192.168.1.120:1807/Aeknow'
        compilerUrl = 'https://compiler.wetrue.cc'
        diceUrl     = 'http://127.0.0.1:5173/'
    }
}