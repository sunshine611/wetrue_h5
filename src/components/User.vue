<script setup>
import HeadImg from "@/components/HeadImg.vue";
import Name from "@/components/Name";

const props = defineProps({
    userList: {
        type: Array,
        default: ()=>[],
    },
})
</script>

<template>
    <view class="user">
        <u-cell-group :border="false">
            <view v-for="item in userList" :key="item.userAddress">
                <u-cell-item
                    @click="
                        goUrl(
                            '/pages/my/userInfo?userAddress=' +
                                item.userAddress
                        )
                    "
                >   
                    <template v-slot:icon>
                        <view class="mr-20">
                            <HeadImg
                                :userInfo="item"
                                width="100rpx"
                                height="100rpx"
                            ></HeadImg>
                        </view>
                    </template>
                    <template v-slot:label>
                        <text class="mr-16">{{ $t('components.focus') + ": " + item.focus }}</text
                        ><text class="mr-16">{{ $t('components.fans') + ": " + item.fans }}</text>
                        <text class="mr-16">{{ $t('components.topic') + ": " + item.topic }}</text>
                        <text>{{ $t('components.active') + ": " + item.active }}</text>

                    </template>
                    <template v-slot:title>
                        <Name :userInfo="item"></Name>
                    </template>
                    <template v-slot:right-icon><view class="amount"></view></template>
                </u-cell-item>
            </view>
        </u-cell-group>
    </view>
</template>
