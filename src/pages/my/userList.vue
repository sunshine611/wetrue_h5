<script setup>
import User from "@/components/User.vue";
import { ref, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const type = ref("") //类型
const title = ref("") //导航标题
const more = ref("loadmore") //加载更多
const userList = ref([]) //帖子列表
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
})

onLoad ( (option) => {
    if (option.type === "focus") {
        type.value  = "focus";
        title.value = proxy.$t('my.myFocus');
    } else if (option.type === "fans") {
        type.value  = "fans";
        title.value = proxy.$t('my.myFans');
    }
    proxy.uSetBarTitle(title.value);
    getUserList();
});
//下拉刷新
onPullDownRefresh ( () => {
    pageInfo.value.page = 1;
    getUserList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
    getUserList();
});

const getUserList = () => {
    var focus;
    if (type.value === "focus") {
        focus = "myFocus";
    } else if (type.value === "fans") {
        focus = "focusMy";
    }
    let params = {
        page: pageInfo.value.page,
        size: pageInfo.value.pageSize,
        focus: focus,
        userAddress: userStore.token
    };
    proxy.$http.post("/User/focusList", params,{ custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalPage = parseInt(res.data.totalPage);
            more.value = "loadmore";
            if (pageInfo.value.page === 1) {
                userList.value = res.data.data;
            } else {
                if (pageInfo.value.page > pageInfo.value.totalPage) {
                    pageInfo.value.page = pageInfo.value.totalPage;
                    more.value = "nomore";
                } else {
                    userList.value = userList.value.concat(res.data.data);
                }
            }
        } else {
            more.value = "nomore";
        }
    });
}
</script>

<template>
    <view class="user-list">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="title" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <User :userList="userList" class="mb-20"></User>
        <view class="empty" v-show="userList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="userList.length > 0"
        />
    </view>
</template>

<style lang="scss" scoped>
.user-list {
}
</style>
