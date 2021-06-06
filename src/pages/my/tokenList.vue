<template>
  <div class="token-list">
    <u-cell-group>
      <u-cell-item title="AE" :value="aeBalance"></u-cell-item>
      <u-cell-item
        v-for="item in tokenList"
        :key="item.contract"
        :title="item.tokenname"
        :value="balanceFormat(item.balance)"
        @click="goUrl(`tokenTransferRecode?contract=${item.contract}&tokenName=${item.tokenname}`)"
      ></u-cell-item>
    </u-cell-group>
  </div>
</template>

<script>
import Request from "@/js_sdk/luch-request/luch-request/index.js";
const http = new Request();
import { aeknow } from "@/config/config.js";
import { mapGetters } from "vuex";
import UCellItem from "../../uview-ui/components/u-cell-item/u-cell-item.vue";
export default {
  components: {  UCellItem },
  data() {
    return {
      aeBalance: 0, //ae余额
      tokenList: [], //token列表
    };
  },
  computed: {
    ...mapGetters(["token"]),
    //国际化
    i18n() {
      return this.$_i18n.messages[this.$_i18n.locale];
    },
  },
  onLoad() {
    this.isPassword();
    this.getAccount();
    this.getTokenList();
  },
  activated() {},
  //上拉刷新
  onPullDownRefresh() {
    this.getAccount();
    this.getTokenList();
    setTimeout(function() {
      uni.stopPullDownRefresh();
    }, 500);
  },
  methods: {
    //获取账户token列表
    getTokenList() {
      http.get(aeknow + "api/token/" + this.token).then((res) => {
        if (res.data.tokens.length > 0) {
          this.tokenList = res.data.tokens;
        }
      });
    },
    //获取账户AE余额
    getAccount() {
      http.get(aeknow + "api/account/" + this.token).then((res) => {
        this.aeBalance = this.balanceFormat(res.data.balance);
      });
    },
  },
};
</script>
