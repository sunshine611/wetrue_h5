<script setup>
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance();

const props = defineProps({
    placeholder: {
		type: String,
		default: '写评论...'
	},
	isShow: {
		type: Boolean,
		default: false
	},
	stopLoading: {
		type: Boolean,
		default: false
	}
})

const emits = defineEmits(["submitComment","clickOther"])

const screenHeight = ref(0)
const content = ref('')
const btnLoading = ref(false)
const submitColor = ref(false)

watch(
	() => content.value,
	(val) => {
		if (!!content.value) {
			submitColor.value = '#fb5f5f';
		} else {
			submitColor.value = "#b0b0b0";
		}
	}
)

watch(
	() => props.stopLoading,
	(val) => {
		btnLoading.value = !val;
	}
)

const submitComment = () => {
	if (!content.value) {
		proxy.uShowToast(proxy.$t('components.enterContent'));
		return false;
	}
	btnLoading.value = true;
	emits('submitComment', content.value);
}
const clickOther = () => {
	btnLoading.value = false;
	emits('clickOther');
}
</script>

<template>
	<view :style="{'display':isShow ? 'inline-block' : 'none'}">
		<view @click="clickOther" class="comment-other"></view>
		<view class="comment">
			<view class="comment-info">
				<view class="comment-input">
					<textarea class="content" v-model="content" :placeholder="placeholder" :focus="isShow"
						:maxlength="1000" ></textarea>
				</view>
				<div class="comment-submit">
					<u-button size="mini" @click.stop="submitComment" :loading="btnLoading" type="primary">{{ $t('components.send') }}</u-button>
				</div>
			</view>
		</view>
	</view>
</template>

<style lang="scss" scoped>
.comment-other {
	position: fixed;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 100%;
	height: 100%;
	max-width: 720px;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 100;
}

.comment {
	z-index: 999;
	position: fixed;
	bottom: 0;
	z-index: 100;
	width: 100%;
	max-width: 720px;
	background-color: white;
	padding: 20upx;
	border-top: 1px solid #aaa;
	font-size: 28rpx;
}

.comment-info {
	display: flex;
	justify-content: space-between;
}

.comment-input {
	width: 80%;
	height: 230rpx;

	.content {
		width: 100%;
		box-sizing: border-box;
		background-color: rgba(232, 232, 232, 0.57);
		font-size: 28rpx;
		padding: 20upx;
		max-height: 230rpx;
		border-radius: 20rpx;
	}
}

.comment-submit {
	width: 20%;
	color: #f04a82;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}
</style>
