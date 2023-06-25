<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },

  onShow() {
    uni.setTabBarItem({
      index: 0,
      text: this.$t('tabBar.index'),
    })
    uni.setTabBarItem({
      index: 1,
      text: this.$t('tabBar.message'),
    })
    uni.setTabBarItem({
      index: 2,
      text: this.$t('tabBar.chat'),
    })
    uni.setTabBarItem({
      index: 3,
      text: this.$t('tabBar.my'),
    })
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<template></template>

<style lang="scss">
/*每个页面公共css */
@import '@/components/vk-uview-ui/index.scss';
body {
  max-width: 720px;
  margin: 0 auto;
}
page {
  background-color: #efefef;
}

/*每个页面公共css */
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

.clearfix:after {
  content: '';
  display: block;
  clear: both;
}

.clearfix {
  zoom: 1;
  overflow: hidden;
}

.pull-left {
  float: left;
}

.pull-right {
  float: right;
}
.t-c {
  text-align: center;
}
.empty {
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.inline {
  display: inline-block;
}

//sass循环语法
@for $i from 0 through 200 {
  $rpx: $i * 1rpx !important; //默认间距单位

  .mb-#{$i} {
    margin-bottom: $rpx;
  }

  .mr-#{$i} {
    margin-right: $rpx;
  }

  .ml-#{$i} {
    margin-left: $rpx;
  }

  .mt-#{$i} {
    margin-top: $rpx;
  }

  .pt-#{$i} {
    padding-top: $rpx;
  }

  .pb-#{$i} {
    padding-bottom: $rpx;
  }

  .font-#{$i} {
    font-size: $rpx;
  }
}
</style>
