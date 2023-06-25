<script setup>
import { reactive, onMounted } from 'vue'
import { getHdWalletAccountFromSeed } from '@aeternity/aepp-sdk'
import { generateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

onMounted(() => {
    createAccount()
});

const form = reactive({
	address: '',
	mnemonic: '',
})

const createAccount = async () => {
	const mnemonic = generateMnemonic(wordlist);
	const seed     = await mnemonicToSeed(mnemonic)
	const keyPair  = getHdWalletAccountFromSeed(seed, 0);
	form.address   = keyPair.publicKey;
	form.mnemonic  = mnemonic;
}
</script>

<template>
	<view class="login">
		<view class="login-box">
			<view class="title">
				<u-image width="92rpx" height="46rpx" src="../../static/logo.png" class="inline mr-5"></u-image>
				{{ $t('login.createMnemonic') }}
			</view>
			<u-gap height="60"></u-gap>
			<view class="form">
				<view class="form-title">{{ $t('login.accountAddress') }}</view>
				<u-gap height="14"></u-gap>
				<u-input v-model="form.address" type="textarea" class="address" :clearable="false" height="120"
					:custom-style="{padding:'15rpx'}" disabled />
				<u-gap height="30"></u-gap>
				<view class="form-title">{{ $t('login.MnemonicTips') }}</view>
				<u-gap height="14"></u-gap>
				<u-input v-model="form.mnemonic" type="textarea" class="textarea" :clearable="false" height="160" disabled
					:custom-style="{padding:'15rpx',wordWrap:'break-word',wordBreak:'normal'}" />
			</view>
			<u-gap height="40"></u-gap>
			<u-button size="default" type="primary" shape="circle" ripple @tap="createAccount" :throttle-time="200">{{ $t('login.rebuild') }}</u-button>
			<u-gap height="25"></u-gap>
			<view class="clearfix">
				<view class="pull-left mnemonic" @tap="reLaunchUrl('../index/index')">{{ $t('home.index') }}</view>
				<view class="pull-right mnemonic" @tap="goUrl('login')">{{ $t('login.mnemonicLogin') }}</view>
			</view>
		</view>
	</view>
</template>

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
