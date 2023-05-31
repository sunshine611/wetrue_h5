<template>
	<view class="login">
		<div class="login-box">
			<div class="title">
				<u-image width="92rpx" height="46rpx" src="../../static/logo.png" class="inline mr-5"></u-image>
				{{ $t('login.createMnemonic') }}
			</div>
			<u-gap height="60"></u-gap>
			<div class="form">
				<div class="form-title">{{ $t('login.accountAddress') }}</div>
				<u-gap height="14"></u-gap>
				<u-input v-model="form.address" type="textarea" class="address" :clearable="false" height="120"
					:custom-style="{padding:'15rpx'}" disabled />
				<u-gap height="30"></u-gap>
				<div class="form-title">{{ $t('login.MnemonicTips') }}</div>
				<u-gap height="14"></u-gap>
				<u-input v-model="form.mnemonic" type="textarea" class="textarea" :clearable="false" height="160" disabled
					:custom-style="{padding:'15rpx',wordWrap:'break-word',wordBreak:'normal'}" />
			</div>
			<u-gap height="40"></u-gap>
			<u-button size="default" type="primary" shape="circle" ripple @tap="createAccount" :throttle-time="200">{{ $t('login.rebuild') }}</u-button>
			<u-gap height="25"></u-gap>
			<div class="clearfix">
				<div class="pull-left mnemonic" @tap="reLaunchUrl('../index/index')">{{ $t('home.index') }}</div>
				<div class="pull-right mnemonic" @tap="goUrl('login')">{{ $t('login.mnemonicLogin') }}</div>
			</div>
		</div>
	</view>
</template>

<script>

import { generateMnemonic, mnemonicToSeed } from '@aeternity/bip39';
import { getHdWalletAccountFromSeed } from '@aeternity/aepp-sdk'

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
	},
	methods: {
		createAccount() {
			const mnemonic = generateMnemonic();
			const seed = mnemonicToSeed(mnemonic);
			const keyPair = getHdWalletAccountFromSeed(seed, 0);
			this.form.address = keyPair.publicKey;
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
