module.exports = `
@compiler >= 6

contract interface AEX9_Interface = entrypoint balance: (address) => option(int)

contract MigrateTokenInterface =
    record account_migrates = { account_map: map(address, account) }
    record account = { from_account: address, for_account: address, token_from: address, token_for: address, migrate_count: int, swap_count: int, chain_time: int, chain_height: int }
    record swap_token = { from_token: AEX9_Interface, for_token: AEX9_Interface, ratio:int, migrate_freeze: int }

    //设置迁移--> (待迁移合约地址, 目标合约地址, <迁移百分比比例:90等于 100:90 等于90%>, 状态=0正常1停止)
    stateful entrypoint migrate_set: (AEX9_Interface, AEX9_Interface, int, int) => bool
    //映射迁移--> (待迁移合约地址, 迁移到账户, 迁移数量)
    stateful entrypoint migrate_mapping: (AEX9_Interface, address, int) => int
    //获取全部迁移Token
    entrypoint get_token_all: () => map(address, swap_token)
    //获取迁移Token信息
    entrypoint get_token_info: (AEX9_Interface) => swap_token
    //获取全部迁移Token记录
    entrypoint get_migrates: () => map(address, account_migrates)
    //获取迁移Token记录--> (目标合约地址)
    entrypoint get_migrates_map: (AEX9_Interface) => account_migrates
    //获取迁移账户记录--> (目标合约地址, 迁移账户)
    entrypoint get_migrates_account: (AEX9_Interface, address) => account
    //获取合约AEX-9余额
    entrypoint token_balance: (AEX9_Interface) => int
    //提取合约AEX-9余额--> (合约地址, 账户, 数量)
    stateful entrypoint transfer_token_balance: (AEX9_Interface, address, int) => int
    //销毁合约AEX-9余额--> (合约地址, 数量)
    stateful entrypoint burn_token_balance: (AEX9_Interface, int) => int
    //获取合约所有者地址
    entrypoint owner: () => address
`
