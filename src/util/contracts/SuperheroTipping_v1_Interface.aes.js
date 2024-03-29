module.exports = `
@compiler >= 6

contract interface OracleService =
  record success_claim = { success : bool, caller : address, percentage : int }

  stateful entrypoint check_persist_claim : (string, address, bool) => success_claim
  payable stateful entrypoint query_oracle : (string, address) => unit

main contract Tipping =
  type tip_id    = int
  type url_id    = int
  type retip_id  = int
  type url       = string
  type claim_gen = int

  record tip = { sender : address, title : string, claim_gen : claim_gen, timestamp : int, url_id : url_id, amount : int }
  record retip = { sender : address, amount : int, claim_gen : claim_gen, tip_id : tip_id }

  record state = { urls : map(url, url_id), claims : map(url_id, claim_gen * int), url_index : map(url_id, url), tips : map(tip_id, tip), retips : map(retip_id, retip), owner : address, oracle_service : OracleService }

  datatype event =
    TipReceived(address, int, url)
    | ReTipReceived(address, int, url)
    | TipWithdrawn(address, int, url)

  stateful entrypoint change_oracle_service : (OracleService) => unit
  payable stateful entrypoint tip : (string, string) => unit
  payable stateful entrypoint retip : (tip_id) => unit
  payable stateful entrypoint pre_claim : (string, address) => unit
  stateful entrypoint claim : (string, address, bool) => unit
  stateful entrypoint migrate_balance : (address) => unit
  entrypoint get_state : () => state
  entrypoint tips_for_url : (string) => list(tip)
  entrypoint retips_for_tip : (tip_id) => list(retip)
  entrypoint unclaimed_for_url : (string) => int
  entrypoint check_claim : (string, address) => OracleService.success_claim
`
