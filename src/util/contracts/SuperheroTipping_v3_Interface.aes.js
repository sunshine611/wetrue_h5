module.exports = `
contract Tipping =
  type tip_id = int
  datatype tip = PostWithoutTip(tip_meta, list(string))
  record tip_meta = { sender : address, title : string, timestamp : int }
  record state = { tips : map(tip_id, tip), version : string }
  datatype event = PostWithoutTipReceived(address, string)

  stateful entrypoint post_without_tip_sig : (string, list(string), address, signature) => int
  stateful entrypoint post_without_tip : (string, list(string)) => int
  entrypoint get_state : () => state
`
