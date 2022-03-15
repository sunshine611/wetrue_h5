<template>
	<view class="login">
		<view class="login-box">
			<view class="title">
				<u-image width="92rpx" height="46rpx" src="../../static/logo.png" class="inline mr-5"></u-image>
				{{i18n.login.createAccount}}
			</view>
			<u-gap height="60"></u-gap>
			<view class="form">
				<view class="form-title">
					<u--text :text="i18n.login.createAccount"></u--text>
				</view>
				<u-gap height="14"></u-gap>
				<u-textarea v-model="form.address" class="address" :clearable="false" disabled />
				<u-gap height="30"></u-gap>
				<view class="form-title">{{i18n.MnemonicTips}}</view>
				<u-gap height="14"></u-gap>
				<u-textarea v-model="form.mnemonic" class="textarea" :clearable="false" height="160" disabled
					:custom-style="{padding:'15rpx',wordWrap:'break-word',wordBreak:'normal'}" />
			</view>
			<u-gap height="40"></u-gap>
			<u-button size="default" type="primary" shape="circle" ripple @tap="createAccount" :throttle-time="200" :text="i18n.login.rebuild"></u-button>
			<u-gap height="25"></u-gap>
			<view class="clearfix">
				<view class="pull-left mnemonic" @tap="reLaunchUrl('../index/index')">{{i18n.home.index}}</view>
				<view class="pull-right mnemonic" @tap="goUrl('login')">{{i18n.login.mnemonicLogin}}</view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	generateMnemonic,
	getHdWalletAccountFromMnemonic
} from '@aeternity/aepp-sdk/es/utils/hd-wallet'

export default {
	data() {
		return {
			form: {
				address: '',
				mnemonic: '',
			}
		}
	},
	onLoad() {
		this.createAccount();
	},
	computed: {
		i18n: {
			get() {
				return this.$_i18n.messages[this.$_i18n.locale];
			},
		},
	},
	methods: {
		createAccount() {
			const mnemonic = generateMnemonic();
			const key = getHdWalletAccountFromMnemonic(mnemonic,0);
			this.form.address=key.publicKey;
			this.form.mnemonic = mnemonic;
		}
	}
}
</script>

<style lang="scss" scoped>
	page {
		background-color: #667eea;
	}

	.login {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;

		.login-box {
			box-sizing: border-box;
			width: 90%;
			background-color: #FFFFFF;
			border-radius: 10rpx;
			min-height: 200rpx;
			padding: 60rpx 30rpx;
			box-shadow: 0rpx 5rpx 18rpx rgba($color: #666, $alpha:0.7);

			.title {
				font-size: 46rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.form {
				.address {
					background-color: #f5f5f5;
					border: 1px solid #ccc;
					border-radius: 10rpx;
				}

				.textarea {
					border: 1px solid #ccc;
					border-radius: 10rpx;
				}
			}

			.mnemonic {
				font-size: 24rpx;
				color: #2196f3;
			}
		}
	}
</style>
