<template>
    <view class="index">
        <u-tabs
            :list="tabList"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
        ></u-tabs>
        <div class="empty" v-show="msgList.length === 0">
            <u-empty :text="i18n.index.noData" mode="list"></u-empty>
        </div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="msgList.length > 0"
        />
        <VersionTip
            v-model="versionShow"
            :versionInfo="versionInfo"
        ></VersionTip>
    </view>
</template>

<script>
import { getStore } from "@/util/service";
import { version } from "@/config/config.js";
import moment from "moment";
import VersionTip from "@/components/VersionTip.vue";
export default {
    components: {
        VersionTip,
    },
    data() {
        return {
            current: 0, //当前tab索引
            msgList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
            versionInfo: {}, //版本信息
            versionCode: parseInt(version.replace(/./g, "")), //版本号
            versionShow: false, //版本提示弹层
            tabList: [
                {
                    name: "评论",
                },
                {
                    name: "WeTrue发布",
                },
            ],
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getMsgList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getMsgList();
    },
    onLoad() {
        this.getMsgList();
        this.getVersionInfo();
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    methods: {
        //获取帖子列表
        getMsgList() {
            let url = "";
            let params = {
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
            };
            if (this.current === 0) {
                url = "/Message/list";
            } else if (this.current === 1) {
                url = "/Content/hotRec";
            }
            this.$http
                .post(url, params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.$nextTick(() => {
                                this.msgList = res.data.data;
                            });
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                this.msgList = this.msgList;
                            }
                        }
                    } else {
                        this.more = "nomore";
                    }
                });
        },
        //切换顶部tab事件
        tabChange(index) {
            this.current = index;
        },
        //获取服务端版本信息
        getVersionInfo() {
            this.$http
                .post(
                    "/Config/version",
                    { version: version },
                    { custom: { isToast: true } }
                )
                .then((res) => {
                    if (res.code === 200) {
                        this.versionInfo = res.data;
                        if (this.versionInfo.mustUpdate) {
                            this.versionShow = true;
                        }
                    }
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.index {
}
</style>
