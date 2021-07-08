<template>
    <div class="reward">
        <u-popup
            v-model="showModal"
            mode="center"
            width="80%"
            height="70%"
            :border-radius="10"
        >
            <div class="reward-content">
                <div class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    打赏记录
                </div>
                <u-table>
                    <u-tr>
                        <u-th>打赏人</u-th>
                        <u-th>金额</u-th>
                    </u-tr>
                    <u-tr v-for="(item,index) in record" :key="index">
                        <u-td>{{item.nickname}}[{{item.sender_id.slice(-4)}}]</u-td>
                        <u-td>{{balanceFormat(item.amount, 1)}}</u-td>
                    </u-tr>
                </u-table>
            </div>
        </u-popup>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
    components: {
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        record: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            showModal: this.value, //控制隐藏显示
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    watch: {
        value(val) {
            this.showModal = val;
        },
        showModal(val) {
            this.$emit("input", val);
        },
    },
    methods: {},
};
</script>
<style lang="scss" scoped>
.reward {
    .reward-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
