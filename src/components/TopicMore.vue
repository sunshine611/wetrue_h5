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
        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                this.postHashToWeTrue(res,true).then((res) => {
                    this.releaseCallback(res);
                });
            }
        };
    },
    computed: {
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
        //显示更多操作
        moreList() {
            return [
                {
                    text: this.i18n.index.focus,
                    subText: this.i18n.index.focusText,
                },
                {
                    text: this.i18n.index.complain,
                    subText: this.i18n.index.complainText,
                },
                {
                    text: this.i18n.index.aeternal,
                    subText: this.i18n.index.aeternalText,
                },
            ];
        },
    },
    watch: {},
    methods: {
        //更多操作
        moreOpera() {
            this.moreShow = true;
            if (this.topicInfo.isFocus) {
                this.moreList[0] = {
                    text: this.i18n.index.cancelFocus,
                    subText: this.i18n.index.cancelFocusText,
                };
            } else {
                this.moreList[0] = {
                    text: this.i18n.index.focus,
                    subText: this.i18n.index.focusText,
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
                window.open(
                    Backend.explorerViewhUrl(this.topicInfo.hash)
                );
            }
        },
        //是否关注
        focus() {
            let payload = {
                action: this.topicInfo.isFocus,
                content: this.topicInfo.users.userAddress,
            };
            this.wetrueSend("focus", payload).then((res) => {
                this.releaseCallback(res);
            });
        },
        releaseCallback(res){
            if (res.code === 200) {
                if (this.postList.length > 0) {
                    for (let i = 0; i < this.postList.length; i++) {
                        if (
                            this.postList[i].users.userAddress ===
                            this.topicInfo.users.userAddress
                        ) {
                            this.postList[i].isFocus = res.data.isFocus;
                        }
                    }
                } else {
                    this.topicInfo.isFocus = res.data.isFocus;
                }
            }
            this.uHideLoading();
        },
        //投诉
        complain() {
            let params = { hash: this.topicInfo.hash };
            this.$http.post("/Submit/complain", params).then((res) => {
                if (res.code === 200) {
                    this.uShowToast(this.i18n.components.complainSuccess);
                }
            });
        },
    },
};
</script>
