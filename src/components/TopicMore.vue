<script>
import { ref, getCurrentInstance, watch } from 'vue'
import HeadImg from "@/components/HeadImg.vue";
import Name from "@/components/Name";
import Backend from "@/util/backend";
import { useUserStore } from "@/stores/userStore";

export default {
    name: 'TopicMore',
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
    setup(props, { }) {
        const { proxy } = getCurrentInstance();
        const userStore = useUserStore();
        const moreShow = ref(false) //二维码弹层

        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                proxy.postHashToWeTrue(res,true).then((res) => {
                    proxy.releaseCallback(res);
                });
            }
        };

        let moreList = [
            {
                text: proxy.$t('index.focus'),
                subText: proxy.$t('index.focusText'),
            },
            {
                text: proxy.$t('index.complain'),
                subText: proxy.$t('index.complainText'),
            },
            {
                text: proxy.$t('index.blacklist'),
                subText: proxy.$t('index.blacklistText'),
            },
            {
                text: proxy.$t('index.aeternal'),
                subText: proxy.$t('index.aeternalText'),
            }
        ]
        //更多操作
        const moreOpera = () => {
            moreShow.value = true;
            if (props.topicInfo.isFocus) {
                moreList[0] = {
                    text: proxy.$t('index.cancelFocus'),
                    subText: proxy.$t('index.cancelFocusText'),
                };
            } else {
                moreList[0] = {
                    text: proxy.$t('index.focus'),
                    subText: proxy.$t('index.focusText'),
                };
            }
        }
        //更多操作选择事件
        const handleOpera = (index) => {
            if (index === 0) {
                focus();
            } else if (index === 1) {
                complain();
            } else if (index === 2) {
                blacklist()
            } else if (index === 3) {
                window.open(
                    Backend.explorerViewhUrl(props.topicInfo.hash)
                );
            }
        }
        //是否关注
        const focus = () => {
            let payload = {
                action: props.topicInfo.isFocus ? 'false' : 'true',
                content: props.topicInfo.users.userAddress,
            };
            proxy.wetrueSend("focus", payload).then((res) => {
                if (props.postList.length > 0) {
                    for (let i = 0; i < props.postList.length; i++) {
                        if (
                            props.postList[i].users.userAddress ===
                            props.topicInfo.users.userAddress
                        ) {
                            props.postList[i].isFocus = !props.postList[i].isFocus;
                        }
                    }
                } else {
                    props.topicInfo.isFocus = !props.topicInfo.isFocus;
                }
                proxy.uHideLoading();
            });
        }
        //投诉
        const complain = () => {
            let params = { hash: props.topicInfo.hash };
            proxy.$http.post("/Submit/complain", params).then((res) => {
                if (res.code === 200) {
                    proxy.uShowToast(proxy.$t('components.complainSuccess'));
                }
            });
        }
        //黑名单
        const blacklist = () => {
            let params = props.topicInfo.users.userAddress;
            userStore.setBlacklist(params)
            if (props.postList.length > 0) {
                for (let i = 0; i < props.postList.length; i++) {
                    if (
                        props.postList[i].users.userAddress ===
                        props.topicInfo.users.userAddress
                    ) {
                        props.postList.splice(i,1);
                    }
                }
            }
            proxy.uShowToast(proxy.$t('components.blacklistSuccess'));
        }

        return {
            moreList,
            handleOpera,
            moreShow,
            moreOpera,
        }
    },
    
}
</script>

<template>
    <view class="topic-more">
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
    </view>
</template>
