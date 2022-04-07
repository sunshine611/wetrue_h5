export const version     = '2.7.0'
export const source      = 'WeTrue'
export let baseUrl, nodeUrl, aeExplorer, chatapi, aeMdw, aeknow, compilerUrl

const net = 'cc'
if (net == 'io') {
    baseUrl     = 'https://api.wetrue.io'
    nodeUrl     = 'https://mainnet.aeternity.io'
    aeExplorer  = 'https://explorer.aeternity.io'
    chatapi     = 'https://api.wetrue.io'
    aeMdw       = 'https://mainnet.aeternity.io/mdw'
    aeknow      = 'https://api.wetrue.io/Aeknow'
    compilerUrl = 'https://compiler.aeternity.io'
}

if (net == 'cc') {
    baseUrl     = 'https://api.wetrue.cc'
    nodeUrl     = 'https://node.aechina.io'
    aeExplorer  = 'https://explorer.aeternity.io'
    chatapi     = 'https://api.wetrue.io'
    aeMdw       = 'https://node.aechina.io/mdw'
    aeknow      = 'https://api.wetrue.cc/Aeknow'
    compilerUrl = 'https://compiler.aechina.io'
}

if(net == 'test'){
    baseUrl     = 'http://192.168.1.120:1807'
    nodeUrl     = 'https://testnet.aeternity.io'
    aeExplorer  = 'https://explorer.testnet.aeternity.io'
    chatapi     = 'http://192.168.1.111:50001'
    aeMdw       = 'https://explorer.testnet.aeternity.io/mdw'
    aeknow      = 'http://192.168.1.120:1807/Aeknow'
    compilerUrl = 'https://compiler.aechina.io'
}

export const chatRommKeyIv = { key: '20200425FEAACD66', iv: '66DCAAEF20200425' }
//export const aeknow      = 'https://www.aeknow.org'