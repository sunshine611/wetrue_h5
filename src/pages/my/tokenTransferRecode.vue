<template>
  <div class="token-list">
    <u-navbar title="转账记录">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
    <u-cell-group v-if="recodeList.length > 0" class="cell-box">
      <div v-for="item in recodeList" :key="item.txhash">
        <u-cell-item
          class="cell-out"
          v-if="item.sender_id === token"
          :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
          @click="view(item.txhash)"
        >
          <div slot="icon" class="icon">
            <fa-FontAwesome
              type="fas fa-arrow-circle-up"
              size="50"
              class="mr-20"
              color="#f34343"
            >
            </fa-FontAwesome>
          </div>
          <div slot="title">
            {{
              item.recipient_id.slice(0, 3) +
                "..." +
                item.recipient_id.slice(-4)
            }}
          </div>
          <div slot="right-icon" class="amount">
            {{ "-" + balanceFormat(item.amount) + " " + (tokenName || "AE") }}
          </div>
        </u-cell-item>
        <u-cell-item
          class="cell-in"
          v-else
          :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
          @click="view(item.txhash)"
        >
          <div slot="icon" class="icon">
            <fa-FontAwesome
              type="fas fa-arrow-circle-down"
              size="50"
              class="mr-20"
              color="#76bf0c"
            >
            </fa-FontAwesome>
          </div>
          <div slot="title">
            {{ item.sender_id.slice(0, 3) + "..." + item.sender_id.slice(-4) }}
          </div>
          <div slot="right-icon" class="amount">
            {{ "+" + balanceFormat(item.amount) + " " + (tokenName || "AE") }}
          </div>
        </u-cell-item>
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
      tokenName: "", //token名字
      contract: "", //合约编号
      recodeList: [], //转账记录列表
      //分页信息
      pageInfo:{
        limit:20,
        offset:0
      }
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
    this.tokenName = option.tokenName;
    this.contract = option.contract;
    this.isPassword();
    if (!!this.contract) {
      this.getTokenRecodeList();
    } else {
      this.getAeRecodeList();
    }
  },
  //上拉刷新
  onPullDownRefresh() {
    if (!!this.contract) {
      this.getTokenRecodeList();
    } else {
      this.getAeRecodeList();
    }
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
    //获取AE转账记录列表
    getAeRecodeList() {
      http.get(`${aeknow}api/spendtx/${this.token}`).then((res) => {
        if (res.data.txs.length > 0) {
          this.recodeList = res.data.txs;
        }
      });
    },
    //查看详情
    view(hash) {
      window.open("https://www.aeknow.org/block/transaction/" + hash);
    },
  },
};
</script>
<style lang="scss" scoped>
.token-list {
  .cell-box {
    .cell-in {
      .amount {
        color: #76bf0c;
      }
    }
    .cell-out {
      .amount {
        color: #f34343;
      }
    }
  }
}
</style>
