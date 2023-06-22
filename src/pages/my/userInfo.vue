<script setup>
import Request from "luch-request";
const http = new Request();
import TopicList from "@/components/TopicList.vue";
import HeadImg from "@/components/HeadImg.vue";
import User from "@/components/User.vue";
import BalanceList from "@/components/BalanceList.vue";
import Backend from "@/util/backend";
import { ref, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
const { proxy } = getCurrentInstance();

const more = ref("loadmore") //加载更多
const current = ref(0) //tab当前选项
const address = ref("") //用户格式化地址
const userInfo = ref({}) //用户信息
const userAddress = ref("") //用户地址
const postList = ref([]) //帖子列表

const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
})

const tabList = [{
        name: proxy.$t('my.topic'),
    },{
        name: proxy.$t('my.star'),
    },{
        name: proxy.$t('my.focus'),
    },{
        name: proxy.$t('my.fans'),
    },{
        name: proxy.$t('my.assets'),
}]

onLoad ( (option) => {
    proxy.uSetBarTitle(proxy.$t('titleBar.userInfo'));
    userAddress.value = option.userAddress;
    getUserInfo();
    getPostList();
});
//下拉刷新
onPullDownRefresh ( () => {
    pageInfo.value.page = 1;
    getUserInfo();
    getPostList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    if ([0, 1, 2, 3].includes(current.value)) {
        pageInfo.value.page++;
        getPostList();
    }
});

//获取用户信息
const getUserInfo = () => {
    let params = {
        userAddress: userAddress.value,
    };
    proxy.$http.post("/User/info", params).then((res) => {
        if (res.code === 200) {
            userInfo.value = res.data;
            address.value = "";
            for (
                let i = 0, len = userAddress.value.length;
                i < len;
                i++
            ) {
                address.value += userAddress.value[i];
                if (i % 3 === 2) address.value += " ";
            }
        }
    });
}
//获取帖子列表
const getPostList = () => {
    let params, url;
    if (current.value === 0) {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            userAddress: userAddress.value,
        };
        url = "/User/contentList";
    } else if (current.value === 1) {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            userAddress: userAddress.value,
        };
        url = "/Content/starList";
    } else if (current.value === 2) {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            focus: "myFocus",
            userAddress: userAddress.value,
        };
        url = "/User/focusList";
    } else if (current.value === 3) {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            focus: "focusMy",
            userAddress: userAddress.value,
        };
        url = "/User/focusList";
    }
    proxy.$http.post(url, params, {custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalPage = parseInt(res.data.totalPage);
            more.value = "loadmore";
            if (pageInfo.value.page === 1) {
                proxy.$nextTick(() => {
                    if (current.value === 0 || current.value === 1) {
                        postList.value = res.data.data.map(
                            (item) => {
                                item.payload = proxy.topicHighlight(
                                    item.payload
                                );
                                return item;
                            }
                        );
                    } else {
                        postList.value = res.data.data;
                    }
                });
            } else {
                if (pageInfo.value.page > pageInfo.value.totalPage) {
                    pageInfo.value.page = pageInfo.value.totalPage;
                    more.value = "nomore";
                } else {
                    if (current.value === 0 || current.value === 1) {
                        postList.value = postList.value.concat(
                            res.data.data.map((item) => {
                                item.payload = this.topicHighlight(
                                    item.payload
                                );
                                return item;
                            })
                        );
                    } else {
                        postList.value = postList.value.concat(
                            res.data.data
                        );
                    }
                }
            }
        } else {
            more.value = "nomore";
        }
    });
}
//获取账户token列表
const getTokenList = () => {
    uni.showLoading({
        title: proxy.$t('my.loading'),
    });
    http.get( Backend.nodeApiAccounts(userAddress.value) ).then((res) => {
        postList.value.push({
            balance: res.data.balance,
            symbol: "AE",
            decimal: 18,
            contract_id: "",
            cert: "TRUE",
        });
    }).then(() => {
        http.get(Backend.aeknowApiTokenList(userAddress.value)).then(
            (res) => {
                if (res.data.tokens.length > 0) {
                    postList.value = postList.value.concat(
                        res.data.tokens
                    );
                }
                uni.hideLoading();
                more.value = "nomore";
            }
        ).catch(() => {
            uni.hideLoading();
            more.value = "nomore";
        });
    });
}
//切换tab
const tabChange = (index) => {
    current.value = index;
    postList.value = [];
    if ([0, 1, 2, 3].includes(index)) {
        pageInfo.value.page = 1;
        getPostList();
    } else if (index === 4) {
        getTokenList();
    }
}
//复制粘贴板
const copy = () => {
    proxy.copyContent(userInfo.value.userAddress);
}
</script>

<template>
    <view class="user-info">
        <u-navbar :is-fixed="false" :title="$t('my.userInfo')" v-show="!validThirdPartySource()">
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
        <view class="user-box">
            <view class="user-top">
                <view class="head">
                    <HeadImg
                        :userInfo="userInfo"
                        width="120rpx"
                        height="120rpx"
                    ></HeadImg>
                    <u-gap height="10"></u-gap>
                    <view :class="[userInfo.isAuth ? 'auth' : '']">
                        {{ userInfo.nickname || $t('my.cryptonym') }}
                    </view>
                </view>
                <view class="address" @tap="copy" id="copy">
                    {{ address }}
                </view>
            </view>
            <view class="user-bottom">
                <view class="item">
                    <view class="value">
                        {{ userInfo.topic || 0 }}
                    </view>
                    <view class="label">{{ $t('my.topic') }}</view>
                </view>
                <view class="item">
                    <view class="value">
                        {{ userInfo.star || 0 }}
                    </view>
                    <view class="label">{{ $t('my.star') }}</view>
                </view>
                <view class="item">
                    <view class="value">
                        {{ userInfo.active || 0 }}
                    </view>
                    <view class="label">{{ $t('my.active') }}</view>
                </view>
                <view class="item">
                    <view class="value">
                        {{ userInfo.focus || 0 }}
                    </view>
                    <view class="label">{{ $t('my.focus') }}</view>
                </view>
                <view class="item">
                    <view class="value">
                        {{ userInfo.fans || 0 }}
                    </view>
                    <view class="label">{{ $t('my.fans') }}</view>
                </view>
            </view>
        </view>
        <u-tabs
            :list="tabList"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
        <TopicList
            :postList="postList"
            v-if="current === 0 || current === 1"
        ></TopicList>
        <User :userList="postList" v-if="current === 2 || current === 3"></User>
        <BalanceList
            :tokenList="postList"
            :userAddress="userAddress"
            :sendClick="false"
            v-if="current === 4"
        ></BalanceList>
        <view class="empty" v-show="postList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            class="mb-20 mt-20"
            :status="more"
            v-show="postList.length > 0"
        />
        <u-gap :height="10"></u-gap>
    </view>
</template>

<style lang="scss" scoped>
.user-info {
    .user-box {
        background-color: rgba($color: #fff, $alpha: 0.9);
        font-size: 26upx;
        box-sizing: border-box;
        margin-bottom: 20rpx;
        box-shadow: 0px 2px 6px 0px rgba($color: #999, $alpha: 0.3);
        .user-top {
            padding: 30rpx 30rpx 0 30rpx;
            display: flex;

            .head {
                text-align: center;
                font-size: 24upx;
                padding: 20rpx 30rpx;
                .auth {
                    color: #2979ff;
                    font-weight: bold;
                    display: inline-block;
                }
            }

            .address {
                display: inline-flex;
                flex-wrap: wrap;
                align-items: center;
                line-height: 50rpx;
                font-size: 34rpx;
                color: #f04a82;
            }
        }

        .user-bottom {
            display: flex;
            justify-content: space-around;
            padding: 10rpx 30rpx 30rpx;

            .item {
                text-align: center;

                .value {
                    font-size: 24rpx;
                    color: #000;
                }

                .label {
                    font-size: 24rpx;
                    color: #666;
                }
            }
        }
    }
}
</style>
