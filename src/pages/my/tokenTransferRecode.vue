<template>
  <div class="token-list">
    <u-cell-group v-if="recodeList.length > 0">
      <div v-for="item in recodeList" :key="item.txhash">
        <u-cell-item
          v-if="item.sender_id === token"
          :title="
            `接收方地址：${item.sender_id.slice(0, 6)}...${item.sender_id.slice(
              -5
            )}`
          "
          :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
          :value="balanceFormat(item.amount)"
          @click="view(item.txhash)"
        ></u-cell-item>
        <u-cell-item
          v-else
          :title="
            `发送方地址：${item.sender_id.slice(0, 6)}...${item.sender_id.slice(
              -5
            )}`
          "
          :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
          :value="balanceFormat(item.amount)"
          @click="view(item.txhash)"
        ></u-cell-item>
      </div>
    </u-cell-group>
    <div class="empty" v-else><u-empty mode="list"></u-empty></div>
  </div>
</template>

<script>
import Request from "@/js_sdk/luch-request/luch-request/index.js";
const http = new Request();
import { aeknow } from "@/config/config.js";
import { mapGetters } from "vuex";
import uEmpty from "../../uview-ui/components/u-empty/u-empty.vue";
export default {
  components: { uEmpty },
  data() {
    return {
      contract: "", //合约编号
      recodeList: [], //转账记录列表
    };
  },
  computed: {
    ...mapGetters(["token"]),
    //国际化
    i18n() {
      return this.$_i18n.messages[this.$_i18n.locale];
    },
  },
  onLoad(option) {
    this.contract = option.contract;
    this.isPassword();
    this.getTokenRecodeList();
  },
  //上拉刷新
  onPullDownRefresh() {
    this.getTokenRecodeList();
    setTimeout(function() {
      uni.stopPullDownRefresh();
    }, 500);
  },
  methods: {
    //获取账户token列表
    getTokenRecodeList() {
      http
        .get(`${aeknow}api/tokentxs/${this.token}/${this.contract}`)
        .then((res) => {
          if (res.data.length > 0) {
            this.recodeList = res.data;
          }
        });
    },
    //查看详情
    view(hash){
      window.open('https://www.aeknow.org/block/transaction/' + hash);
    }
  },
};
</script>
