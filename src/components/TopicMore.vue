<template>
    <div class="topic-more">
        <fa-FontAwesome
            type="fas fa-angle-down"
            size="36"
            color="#cecece"
            @click="moreOpera"
        >
        </fa-FontAwesome>
        <u-action-sheet
            :list="moreList"
            v-model="moreShow"
            @click="handleOpera"
        ></u-action-sheet>
    </div>
</template>
<script>
import HeadImg from "@/components/HeadImg.vue";
import Name from "@/components/Name";
import Backend from "@/util/backend";

export default {
    components: {
        HeadImg,
        Name,
    },
    props: {
        topicInfo: {
            type: Object,
            default: () => {},
        },
        postList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            moreShow: false, //下箭头控制显示更多操作
        };
    },
    mounted() {
        // #ifdef H5
        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                this.postHashToWeTrue(res,true).then((res) => {
                    this.releaseCallback(res);
                });
            }
        };
        // #endif
    },
    computed: {
        //显示更多操作
        moreList() {
            let moreList = [
                {
                    text: this.$t('index.focus'),
                    subText: this.$t('index.focusText'),
                },
                {
                    text: this.$t('index.complain'),
                    subText: this.$t('index.complainText'),
                },
                {
                    text: this.$t('index.blacklist'),
                    subText: this.$t('index.blacklistText'),
                },
                {
                    text: this.$t('index.aeternal'),
                    subText: this.$t('index.aeternalText'),
                }
            ]
            if (this.validAdmin()){
                moreList.push({
                    text: 'Test Admin',
                    subText: 'Test Admin',
                })
            }
            return moreList;
        },
    },
    watch: {},
    methods: {
        //更多操作
        moreOpera() {
            this.moreShow = true;
            if (this.topicInfo.isFocus) {
                this.moreList[0] = {
                    text: this.$t('index.cancelFocus'),
                    subText: this.$t('index.cancelFocusText'),
                };
            } else {
                this.moreList[0] = {
                    text: this.$t('index.focus'),
                    subText: this.$t('index.focusText'),
                };
            }
        },
        //更多操作选择事件
        handleOpera(index) {
            if (index === 0) {
                this.focus();
            } else if (index === 1) {
                this.complain();
            } else if (index === 2) {
                this.blacklist()
            } else if (index === 3) {
                window.open(
                    Backend.explorerViewhUrl(this.topicInfo.hash)
                );
            }
        },
        //是否关注
        focus() {
            let payload = {
                action: this.topicInfo.isFocus ? 'false' : 'true',
                content: this.topicInfo.users.userAddress,
            };
            this.wetrueSend("focus", payload).then((res) => {
                if (this.postList.length > 0) {
                    for (let i = 0; i < this.postList.length; i++) {
                        if (
                            this.postList[i].users.userAddress ===
                            this.topicInfo.users.userAddress
                        ) {
                            this.postList[i].isFocus = !this.topicInfo.isFocus;
                        }
                    }
                } else {
                    this.topicInfo.isFocus = !this.topicInfo.isFocus;
                }
                this.uHideLoading();
            });
        },
        //投诉
        complain() {
            let params = { hash: this.topicInfo.hash };
            this.$http.post("/Submit/complain", params).then((res) => {
                if (res.code === 200) {
                    this.uShowToast(this.$t('components.complainSuccess'));
                }
            });
        },
        //黑名单
        blacklist() {
            let params = this.topicInfo.users.userAddress;
            this.$store.dispatch("user/setBlacklist", params);
            if (this.postList.length > 0) {
                for (let i = 0; i < this.postList.length; i++) {
                    if (
                        this.postList[i].users.userAddress ===
                        this.topicInfo.users.userAddress
                    ) {
                        this.postList.splice(i,1);
                    }
                }
            }
            this.uShowToast(this.$t('components.blacklistSuccess'));
        },
    },
};
</script>
