<template>
	<view class="m-item" :id="'message'+id">
		<view class="m-left">
			<view v-if="message.userType=='home'" :class="['head_name', message.isAuth ? 'auth' : '']">
				{{ message.nickname ? message.nickname : 'ak_' + message.userAddress.slice(-4) }}
				<view class="m-time">{{ $moment(message.msgUtcTime).format(" MM/DD HH:mm") }}</view>
			</view>
		</view>
		
		<view class="m-content">
			<view class="m-content-head" :class="{'m-content-head-right':message.userType=='customer'}">
				<view :class="'m-content-head-'+message.userType">{{message.msg}} </view>
			</view>
		</view>
		<view class="m-right">
			<view v-if="message.userType=='customer'" :class="['head_name', message.isAuth ? 'auth' : '']">
				{{ message.nickname ? message.nickname : 'ak_' + message.userAddress.slice(-4) }}
				<view class="m-time">{{ $moment(message.msgUtcTime).format(" MM/DD HH:mm") }}</view>
			</view>
		</view>
	</view>
</template>

<script>

export default {
	data() {
		return {
		}
	},
	props: ['message', 'id'],
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
		width: 280rpx;
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
		width: 280rpx;
		justify-content: center;
		align-items: flex-start;
	}
	.head_icon {
		width: 80rpx;
		height: 80rpx;
	}
	.head_name {
		display: inline-block;
		color: #4e4e4e;
		font-size: 26rpx;
		&.auth {
			color: #2979ff;
			font-weight: bold;
		}
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
		background: #1482d1;
		border: 1px #1482d1 solid;
		border-radius: 20rpx;
		padding: 20rpx;
		color: white;
	}
	.m-content-head-home:before {
		border: 15rpx solid transparent;
		border-right: 15rpx solid #1482d1;
		left: -26rpx;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}
	.m-content-head-customer {
		border: 1rpx solid white;
		background: white;
		border-radius: 20rpx;
		padding: 20rpx;
	}
	.m-content-head-customer:after {
		border: 15rpx solid transparent;
		border-left: 15rpx solid white;
		top: 20rpx;
		right: -26rpx;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}
</style>
