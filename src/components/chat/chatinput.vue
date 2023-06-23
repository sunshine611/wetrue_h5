<script setup>
import { ref,getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
const { proxy } = getCurrentInstance();

const inputValue = ref("")
const emits = defineEmits(["send-message"])

const startRecognize = () => {
	let options = {};
	options.engine = 'iFly';
	inputValue.value = "";
	plus.speech.startRecognize(options, function (s) {
		console.log(s);
		inputValue.value += s;
	}, function (e) {
		console.log("语音识别失败：" + e.message);
	});
}
const sendMessge = () => {
	if (inputValue.value.trim() == '') {
		proxy.uShowToast(proxy.$t('components.enterContent'));
		inputValue.value = '';
	} else {
		//点击发送按钮时，通知父组件用户输入的内容
		/*this.$emit('send-message', {
			type: 'text',
			msgContent: inputValue.value
		});*/
		emits('send-message', {
			type: 'text',
			msgContent: inputValue.value
		});
		inputValue.value = '';
	}
}
</script>

<template>
	<view class="footer safe-area-inset-bottom">
		<view class="footer-left">
			<view @tap="startRecognize">
				<Icon icon="carbon:microphone-filled" />
			</view>
		</view>
		<view class="footer-center">
			<u-input 
				class="input-text" 
				@confirm="sendMessge"
				v-model="inputValue" 
				type="text" 
				placeholder="write a message..."
				/>
		</view>
		<view class="footer-right" @tap="sendMessge">
			<view id='msg-type'>{{ $t('chat.send')}}</view>
		</view>
	</view>
</template>

<style>
	.footer {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 80rpx;
		min-height: 80rpx;
		border-top: solid 1rpx #bbb;
		overflow: hidden;
		padding: 5rpx;
		background-color: #fafafa;
	}
	.footer-left {

		width: 80rpx;
		height: 80rpx;

		display: flex;
		justify-content: center;
		align-items: center;
	}
	.footer-right {
		width: 120rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #1482D1;
	}
	.footer-center {
		flex: 1;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.footer-center .input-text {
		flex: 1;
		background: #fff;
		border: solid 1rpx #ddd;
		padding: 10rpx !important;
		font-family: verdana !important;
		overflow: hidden;
		border-radius: 15rpx;
	}
</style>
