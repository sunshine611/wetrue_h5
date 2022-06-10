<template>
	<view class="m-item">
		<view class="m-left" v-if="userType(message.userAddress)=='home'">
			<view class="head-name" :class="[message.isAuth ? 'head-name-auth' : '']">
				{{ message.nickname ? message.nickname : 'ak_' + message.userAddress.slice(-4) }}
			</view>
		</view>
		<view class="m-content">
			<view class="m-content-head" :class="{'m-content-head-right':userType(message.userAddress)=='customer'}">
				{{ $moment(message.msgUtcTime).format(" MM/DD HH:mm:ss") }}
			</view>
			<view class="m-content-head" :class="{'m-content-head-right':userType(message.userAddress)=='customer'}">
				<view :class="'m-content-head-'+userType(message.userAddress)">{{message.msgContent}} </view>
			</view>
		</view>
		<view class="m-right" v-if="userType(message.userAddress)=='customer'">
			<view class="head-name" :class="[message.isAuth ? 'head-name-auth' : '']">
				{{ message.nickname ? message.nickname : 'ak_' + message.userAddress.slice(-4) }}
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	data() {
		return {

		}
	},
	props: ['message'],
	computed: {
        ...mapGetters(["token"]),
    },
	methods: {
        userType(userAddress) {
			if (userAddress==this.token) {
				return 'customer'
			} else {
				return 'home'
			}
        },
	},
}
</script>

<style>
	.m-item {
		display: flex;
		flex-direction: row;
		padding-top: 20rpx;
	}
	.m-left {
		display: flex;
		width: 140rpx;
		justify-content: center;
		align-items: flex-start;
	}
	.m-content {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		word-break: break-all;
	}
	.m-time {
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}
	.m-right {
		display: flex;
		width: 140rpx;
		justify-content: center;
		align-items: flex-start;
	}
	.head-name {
		display: inline-block;
		font-size: 26rpx;
	}
	.head-name-auth {
		color: #2979ff;
		font-weight: bold;
	}
	.m-content-head {
		display: flex;
		position: relative;
	}
	.m-content-head-right {
		display: flex;
		justify-content: flex-end;
	}
	.m-content-head-home {
		text-align: left;
		background: white;
		border: 1px solid white;
		border-radius: 20rpx;
		padding: 20rpx;
	}
	.m-content-head-home:before {
		border: 15rpx solid transparent;
		border-right: 15rpx solid white;
		left: -26rpx;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}
	.m-content-head-customer {
		border: 1rpx solid #1482d1;
		background: #1482d1;
		border-radius: 20rpx;
		padding: 20rpx;
		color: white;
	}
	.m-content-head-customer:after {
		border: 15rpx solid transparent;
		border-left: 15rpx solid #1482d1;
		top: 20rpx;
		right: -26rpx;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}
</style>
