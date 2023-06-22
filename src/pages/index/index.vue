<script setup>
import TopicList from "@/components/TopicList.vue";
import PostTopicButton from "@/components/Button/PostTopicButton.vue";
import VersionTip from "@/components/VersionTip.vue";
import { setThirdPartySource } from "@/util/thirdPartySource/source";
import socket from '@/util/socketio.js';
import { ref,  getCurrentInstance } from 'vue';
import { useUserStore } from "@/stores/userStore";
import { onLoad, onShow, onPullDownRefresh, onReachBottom, onTabItemTap } from '@dcloudio/uni-app';
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const current = ref( 0 ) //tab当前选项
const postList = ref([]) //帖子列表
const more = ref('loadmore') //加载更多
const versionInfo = ref({}) //版本信息
const versionShow = ref(false) //版本提示弹层
const tabClick = ref(false) //点击tab事件
const postTopicButtonShow = ref(true) //控制发帖按钮显隐
const newCount = ref( 0 ) //最新总贴数
const postButtonInfo = ref({}) //发布按钮增加信息
const cateInfo = ref({ //当前类别
    value: 1,
    label: "",
})
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
    totalSize: 0,
})

const categoryList = ref([{
        name: proxy.$t('home.newRelease'),
    },{
        name: proxy.$t('home.hotRecommend'),
    },{
        name: proxy.$t('home.newPic'),
    },{
        name: proxy.$t('home.myFocus'),
    },{
        name: proxy.$t('home.superHero'),
}])

onLoad ( async (option) => {
    proxy.uSetBarTitle(proxy.$t('titleBar.index'));
    setThirdPartySource(option);
    cateInfo.value.label = proxy.$t('home.newRelease');
    await getPostList();
    appVersion();
    proxy.getUnreadMsg();
    //监听最新总贴数
    socket.on('contentListCount', (res) => {
        if(res.countSize > 0) {
            newCount.value = res.countSize;
            newContentCount();
        }
    })
    //监听最新未读消息
    socket.on('msgStateSize', (res) => {
        if(res.msgStateSize == 'new') {
            proxy.getUnreadMsg();
        }
    })
    //监听错误
    socket.on('error', (msg) => proxy.uShowToast(msg))
});
onShow ( () => {
    setTimeout(() => {
        if (current.value === 0) getNewCount();
    }, 1000);
});
//下拉刷新
onPullDownRefresh ( () => {
    pageInfo.value.page = 1;
    getPostList();
    proxy.getUnreadMsg();
    setTimeout(function () {
        uni.stopPullDownRefresh();
        newContentCount();
    }, 500);
    proxy.getSystemStatusBarHeight(); //状态栏高度
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
    getPostList();
    proxy.getUnreadMsg();
});

onTabItemTap ( () => {
    if (tabClick.value) {
        postList.value = [];
        pageInfo.value.page = 1;
        getPostList();
    }
    tabClick.value = true;
    newContentCount();
    setTimeout(() => {
        tabClick.value = false;
    }, 500);
});

setTimeout(() => {
    proxy.getSystemStatusBarHeight(); //状态栏高度
}, 1000);

//获取帖子列表
const getPostList = () => {
    let url = "";
    let params = {
        page: pageInfo.value.page,
        size: pageInfo.value.pageSize,
    };
    postButtonInfo.value = {};
    postTopicButtonShow.value = true;
    if (current.value === 0) {
        url = "/Content/list";
    } else if (current.value === 1) {
        url = "/Content/hotRec";
    } else if (current.value === 2) {
        url = "/Image/list";
    } else if (current.value === 3) {
        url = "/Content/focusList";
    } else if (current.value === 4) {
        url = "/Content/shTipidList";
        postButtonInfo.value = { type: "shtip" };
        if (proxy.validThirdPartySource()) postTopicButtonShow.value = false;
    }
    proxy.$http.post(url, params, { custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalPage = parseInt(res.data.totalPage);
            more.value = "loadmore";
            if (pageInfo.value.page === 1) {
                pageInfo.value.totalSize = parseInt(res.data.totalSize);
                proxy.$nextTick(() => {
                    let itemList = res.data.data.map((item) => {
                        return itemListMap(item); //数据处理
                    });
                    postList.value = itemList.filter((s)=> {return s;});
                });
                if (current.value == 0) {
                    newCount.value = pageInfo.value.totalSize;
                }
            } else {
                if (pageInfo.value.page > pageInfo.value.totalPage) {
                    pageInfo.value.page = pageInfo.value.totalPage;
                    more.value = "nomore";
                } else {
                    let itemList = res.data.data.map((item) => {
                        return itemListMap(item); //数据处理
                    });
                    postList.value = postList.value.concat(itemList.filter((s)=> {return s;}));
                }
            }
        } else {
            more.value = "nomore";
        }
    });
}
//切换顶部tab事件
const tabChange = (index) => {
    current.value = index;
    postList.value = [];
    pageInfo.value = {
        page: 1,
        pageSize: 10,
    }; //页码信息
    getPostList();
}
//未读新帖标记
const newContentCount = () => {
    if (current.value === 0) {
        const oldCount = pageInfo.value.totalSize
        if (oldCount > 0 && newCount.value > oldCount) {
            let size = parseInt(newCount.value - oldCount);
            uni.setTabBarBadge({
                index: 0,
                text: `${size}`,
            });
            const url = "/Content/list";
            let params = {page: 1, size: size};
            getNewPost(url, params);
        } else {
            uni.hideTabBarRedDot({
                index: 0,
            });
        }
    }
}
const getNewCount = () => {
    const url = "/Content/list";
    const params = {page: 1, size: 1};
    proxy.$http.post(url, params).then((res) => {
        if (res.code === 200) {
            newCount.value = parseInt(res.data.totalSize);
            newContentCount();
        }
    });
}
const getNewPost = (url, params) => {
    proxy.$http.post(url, params).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalSize = parseInt(res.data.totalSize);
            res.data.data.map((item) => {
                if (postList.value[0].hash !== item.hash ) {
                    postList.value.unshift(itemListMap(item));
                    postList.value.pop();
                }
            });
            uni.hideTabBarRedDot({
                index: 0,
            });
        }
    });
}
//获取服务端版本信息
const appVersion = () => {
    proxy.getVersionInfo().then((res) => {
        versionInfo.value = res;
        if (versionInfo.value.mustUpdate) {
            versionShow.value = true;
        }
    });
}
//帖子列表-数据前期处理
const itemListMap = (item) => {
    if (userStore.blacklistState === 1) {
        userStore.setblacklistState(0)
    }
    item.payload = proxy.topicHighlight(
        item.payload
    );
    if (current.value === 4) { //超级英雄
        item.hash = item.shTipid;
    }
    const block = userStore.blacklist.includes(item.users.userAddress);
    if(!block) {
        return item;
    }
}
</script>

<template>
  <view class="index">
      <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
          <u-navbar class="nav" :is-fixed="false" :is-back="false">
              <u-tabs
                  class="nav-tab"
                  :list="categoryList"
                  :is-scroll="true"
                  @change="tabChange"
                  :current="current"
                  active-color="#f04a82"
                  bg-color="#fafafa"
                  :show-bar="false"
              ></u-tabs>
          </u-navbar>
      <TopicList :postList="postList"></TopicList>
      <view class="empty" v-show="postList.length === 0">
          <u-empty :text="$t('index.noData')" mode="list"></u-empty>
      </view>
      <u-loadmore
          bg-color="rgba(0,0,0,0)"
          margin-bottom="20"
          :status="more"
          v-show="postList.length > 0"
      />
      <VersionTip
          v-model="versionShow"
          :versionInfo="versionInfo"
      ></VersionTip>
      <PostTopicButton v-show="postTopicButtonShow" :postButtonInfo="postButtonInfo"></PostTopicButton>
  </view>
</template>

<style lang="scss" scoped>
.index {
  .nav {
      ::v-deep .u-navbar-inner {
          display: inline !important;
      }
      .nav-tab {
          width: 100%;
      }
  }
}
</style>
