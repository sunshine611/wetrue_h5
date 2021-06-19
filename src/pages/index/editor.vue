<template>
	<div class="editor">
		<u-navbar back-text="" :title="i18n.index.sendContent" :border-bottom="false">
			<div slot="right" class="right-btn">
				<u-button type="primary" size="mini" :disabled="form.text.length===0" @click="release"  :loading="btnLoading">{{i18n.index.send}}</u-button>
			</div>
		</u-navbar>
		<div class="font-24" style="color:#f04a82">{{i18n.index.sendHint}}</div>
		<u-gap height="40"></u-gap>
		<u-input v-model="form.text" type="textarea" :border="false" height="300" :auto-height="true" :maxlength="5000"
			:placeholder="i18n.index.wetrueTips" :clearable="false" />
	</div>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					text: ''
				},
				btnLoading: false, //按钮加载状态
			}
		},
		onLoad() {
			this.isPassword();
		},
		activated(){
			this.isPassword();
		},
		computed: {
			//国际化
			i18n() {
				return this.$_i18n.messages[this.$_i18n.locale]
			},
		},
		methods: {
			//发布
			async release() {
				this.btnLoading = true;
				uni.showLoading({
					title: this.i18n.index.inChain
				});
				let payload = {
					content: this.form.text
				}
				let res = await this.sendTopic(payload);
				if (!!res.hash) {
					uni.hideLoading();
					this.btnLoading = false;
					this.getConfigInfo();
					this.reLaunchUrl('index');
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	page {
		background-color: #fff;
	}

	.editor {
		padding: 30rpx;

		.right-btn {
			padding-right: 30rpx;
		}
	}
</style>
