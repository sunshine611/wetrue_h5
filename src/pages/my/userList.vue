<template>
    <view class="user-list">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="title" v-show="!validThirdPartySource()">
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
        <User :userList="userList" class="mb-20"></User>
        <div class="empty" v-show="userList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="userList.length > 0"
        />
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import User from "@/components/User.vue";

export default {
    components: {
        User,
    },
    data() {
        return {
            type: "", //用户类型
            title: "", //导航标题
            userList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getUserList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getUserList();
    },
    onLoad(option) {
        if (option.type === "focus") {
            this.type = "focus";
            this.title = this.$t('my.myFocus');
        } else if (option.type === "fans") {
            this.type = "fans";
            this.title = this.$t('my.myFans');
        }
        this.uSetBarTitle(this.title);
        this.getUserList();
    },
    computed: {
        ...mapGetters(["token"]),
    },
    methods: {
        //获取帖子列表
        getUserList() {
            var focus;
            if (this.type === "focus") {
                focus = "myFocus";
            } else if (this.type === "fans") {
                focus = "focusMy";
            }
            let params = {
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
                focus: focus,
                userAddress: this.token
            };
            this.$http.post("/User/focusList", params,{ custom: { isToast: true } }).then((res) => {
                if (res.code === 200) {
                    this.pageInfo.totalPage = parseInt(res.data.totalPage);
                    this.more = "loadmore";
                    if (this.pageInfo.page === 1) {
                        this.userList = res.data.data;
                    } else {
                        if (this.pageInfo.page > this.pageInfo.totalPage) {
                            this.pageInfo.page = this.pageInfo.totalPage;
                            this.more = "nomore";
                        } else {
                            this.userList = this.userList.concat(res.data.data);
                        }
                    }
                } else {
                    this.more = "nomore";
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.user-list {
}
</style>
